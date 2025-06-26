import { spotifyService } from "@/lib/spotify";
import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";



const spotify = new spotifyService();

export const syncSpotifyData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.musicProfile.spotifyConnected || !user.musicProfile.spotifyAccessToken) {
            throw new Error('Spotify not connected');

        }
        let accessToken = user.musicProfile.spotifyAccessToken;

        if (user.musicProfile.spotifyTokenExpiresAt && user.musicProfile.spotifyTokenExpiresAt < new Date()) {
            if (!user.musicProfile.spotifyRefreshToken) {
                throw new Error('Spotify token expired and no refresh token available');
            }

            const refreshedTokens = await spotify.refreshAccessToken(user.musicProfile.spotifyRefreshToken);
            accessToken = refreshedTokens.access_token;
            user.musicProfile.spotifyAccessToken = refreshedTokens.access_token;
            user.musicProfile.spotifyTokenExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000);

            if (refreshedTokens.refresh_token) {
                user.musicProfile.spotifyRefreshToken = refreshedTokens.refresh_token;
            }
        }

        console.log('Starting Spotify data sync for user:', userId);

        const [
            topArtistsShort,
            topArtistsMedium,
            topArtistsLong,
            topTracksShort,
            topTracksMedium,
            topTracksLong,
            recentTracks,
            likedTracks,
            playlists,
            currentTrack,
            topGenres
        ] = await Promise.allSettled([
            spotify.getTopArtists(accessToken, 'short_term', 50),
            spotify.getTopArtists(accessToken, 'medium_term', 50),
            spotify.getTopArtists(accessToken, 'long_term', 50),
            spotify.getTopTracks(accessToken, 'short_term', 50),
            spotify.getTopTracks(accessToken, 'medium_term', 50),
            spotify.getTopTracks(accessToken, 'long_term', 50),
            spotify.getRecentlyPlayed(accessToken, 50),
            spotify.getLikedTracks(accessToken, 50),
            spotify.getUserPlaylists(accessToken, 50),
            spotify.getCurrentTrack(accessToken),
            spotify.getTopGenres(accessToken)
        ]);

        if (topArtistsShort.status === 'fulfilled') {
            user.musicProfile.topArtists.short_term = topArtistsShort.value;
        }
        if (topArtistsMedium.status === 'fulfilled') {
            user.musicProfile.topArtists.medium_term = topArtistsMedium.value;
        }
        if (topArtistsLong.status === 'fulfilled') {
            user.musicProfile.topArtists.long_term = topArtistsLong.value;
        }

        if (topTracksShort.status === 'fulfilled') {
            user.musicProfile.topTracks.short_term = topTracksShort.value;
        }
        if (topTracksMedium.status === 'fulfilled') {
            user.musicProfile.topTracks.medium_term = topTracksMedium.value;
        }
        if (topTracksLong.status === 'fulfilled') {
            user.musicProfile.topTracks.long_term = topTracksLong.value;
        }

        if (recentTracks.status === 'fulfilled') {
            user.musicProfile.recentTracks = recentTracks.value.map(rt => rt.track).slice(0, 50);
        }

        if (playlists.status === 'fulfilled') {
            user.musicProfile.playlists = playlists.value;
        }

        if (currentTrack.status === 'fulfilled' && currentTrack.value) {
            user.musicProfile.currentlyPlaying = currentTrack.value;
        }

        if (topGenres.status === 'fulfilled') {
            user.musicProfile.topGenres = topGenres.value;
        }

        try {
            const allTopTracks = [
                ...(topTracksShort.status === 'fulfilled' ? topTracksShort.value : []),
                ...(topTracksMedium.status === 'fulfilled' ? topTracksMedium.value : []),
                ...(topTracksLong.status === 'fulfilled' ? topTracksLong.value : [])
            ];

            if (allTopTracks.length > 0) {
                const uniqueTrackIds = [...new Set(allTopTracks.map(track => track.spotifyId))];
                const audioFeatures = await spotify.getAudioFeatures(accessToken, uniqueTrackIds.slice(0, 100));


                if (audioFeatures.length > 0) {
                    const avgFeatures = audioFeatures.reduce((acc, features) => {
                        Object.keys(features).forEach(key => {
                            if (typeof features[key as keyof typeof features] === 'number') {
                                acc[key as keyof typeof acc] = (acc[key as keyof typeof acc] || 0) + 
                                    (features[key as keyof typeof features] as number);
                            }
                        });
                        return acc;
                    }, {} as any);

                    Object.keys(avgFeatures).forEach(key => {
                        avgFeatures[key] = avgFeatures[key] / audioFeatures.length;
                    });

                    user.musicProfile.audioFeatures = avgFeatures;
                }
            }
        } catch (audioError) {
            console.error('Error fetching audio features:', audioError);
        }

        user.musicProfile.lastSyncAt = new Date();

        await user.save();

        const syncResults = {
            topArtists: {
                short_term: topArtistsShort.status === 'fulfilled' ? topArtistsShort.value.length : 0,
                medium_term: topArtistsMedium.status === 'fulfilled' ? topArtistsMedium.value.length : 0,
                long_term: topArtistsLong.status === 'fulfilled' ? topArtistsLong.value.length : 0,
            },
            topTracks: {
                short_term: topTracksShort.status === 'fulfilled' ? topTracksShort.value.length : 0,
                medium_term: topTracksMedium.status === 'fulfilled' ? topTracksMedium.value.length : 0,
                long_term: topTracksLong.status === 'fulfilled' ? topTracksLong.value.length : 0,
            },
            recentTracks: recentTracks.status === 'fulfilled' ? recentTracks.value.length : 0,
            playlists: playlists.status === 'fulfilled' ? playlists.value.length : 0,
            topGenres: topGenres.status === 'fulfilled' ? topGenres.value.length : 0,
            currentTrack: currentTrack.status === 'fulfilled' && currentTrack.value ? true : false,
            lastSyncAt: user.musicProfile.lastSyncAt,
        };

        console.log('Spotify data sync completed successfully:', syncResults);

        return res.status(200).json({ 
            message: "Spotify data synced successfully",
            syncResults 
        });


    } catch (error: any) {
        console.error('Error syncing Spotify data:', error);
        
        if (error.message === 'SPOTIFY_TOKEN_EXPIRED') {
            return res.status(401).json({ error: 'Spotify token expired' });
        }
        
        return res.status(500).json({ error: "Failed to sync Spotify data" });
    }
}