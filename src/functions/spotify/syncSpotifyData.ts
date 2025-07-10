import { spotifyService } from "@/lib/spotify";
import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import { MusicProfile } from "@/models/MusicProfile";
import type { Response } from "express";

const spotify = new spotifyService();

// Core function that syncs Spotify data - can be called from API or during auth
export const syncUserSpotifyData = async (
    userId: string,
    accessToken: string
): Promise<any> => {
    try {
        console.log('Starting Spotify data sync for user:', userId);

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Find existing music profile or create a new one
        let musicProfile;
        if (user.musicProfile) {
            // Try to find existing profile
            musicProfile = await MusicProfile.findById(user.musicProfile);
        }

        if (!musicProfile) {
            // Create new music profile if none exists
            musicProfile = new MusicProfile({
                spotifyConnected: true,
                spotifyAccessToken: accessToken,
                spotifyTokenExpiresAt: new Date(Date.now() + 3600 * 1000), // Default 1 hour
                topArtists: {
                    short_term: [],
                    medium_term: [],
                    long_term: []
                },
                topTracks: {
                    short_term: [],
                    medium_term: [],
                    long_term: []
                },
                recentTracks: [],
                playlists: [],
                topGenres: [],
                audioFeatures: {
                    danceability: 0,
                    energy: 0,
                    key: 0,
                    mode: 0,
                    speechiness: 0,
                    acousticness: 0,
                    instrumentalness: 0,
                    liveness: 0,
                    valence: 0,
                    tempo: 0,
                    duration: 0,
                    timeSignature: 0,
                    loudness: 0
                },
                lastSyncAt: new Date(),
                compatibilityScore: new Map<string, number>(),
                recentlyPlayed: []
            });

            // Save the new profile
            await musicProfile.save();
            
            // Link it to the user
            user.musicProfile = musicProfile._id;
            await user.save();
        } else {
            // Update existing profile
            musicProfile.spotifyConnected = true;
            musicProfile.spotifyAccessToken = accessToken;
            await musicProfile.save();
        }

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

        // Instead of accessing user.musicProfile directly, use the musicProfile document
        if (topArtistsShort.status === 'fulfilled') {
            musicProfile.topArtists.short_term = topArtistsShort.value;
        }
        if (topArtistsMedium.status === 'fulfilled') {
            musicProfile.topArtists.medium_term = topArtistsMedium.value;
        }
        if (topArtistsLong.status === 'fulfilled') {
            musicProfile.topArtists.long_term = topArtistsLong.value;
        }

        if (topTracksShort.status === 'fulfilled') {
            musicProfile.topTracks.short_term = topTracksShort.value;
        }
        if (topTracksMedium.status === 'fulfilled') {
            musicProfile.topTracks.medium_term = topTracksMedium.value;
        }
        if (topTracksLong.status === 'fulfilled') {
            musicProfile.topTracks.long_term = topTracksLong.value;
        }

        if (recentTracks.status === 'fulfilled') {
            musicProfile.recentTracks = recentTracks.value.map(rt => rt.track).slice(0, 50);
        }

        if (playlists.status === 'fulfilled') {
            musicProfile.playlists = playlists.value;
        }

        if (currentTrack.status === 'fulfilled' && currentTrack.value) {
            musicProfile.currentlyPlaying = currentTrack.value;
        }

        if (topGenres.status === 'fulfilled') {
            musicProfile.topGenres = topGenres.value;
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

                    musicProfile.audioFeatures = avgFeatures;
                }
            }
        } catch (audioError) {
            console.error('Error fetching audio features:', audioError);
        }

        musicProfile.lastSyncAt = new Date();
        await musicProfile.save();

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
            lastSyncAt: musicProfile.lastSyncAt,
        };

        console.log('Spotify data sync completed successfully:', syncResults);
        return syncResults;
    } catch (error: any) {
        console.error('Error in syncUserSpotifyData:', error);
        throw error;
    }
};

// API endpoint for manual sync
export const syncSpotifyData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if musicProfile exists and is connected
        const musicProfile = user.musicProfile ? await MusicProfile.findById(user.musicProfile) : null;

        if (!musicProfile?.spotifyConnected || !musicProfile?.spotifyAccessToken) {
            return res.status(400).json({ error: 'Spotify not connected' });
        }
        
        let accessToken = musicProfile.spotifyAccessToken;

        if (musicProfile.spotifyTokenExpiresAt && musicProfile.spotifyTokenExpiresAt < new Date()) {
            if (!musicProfile.spotifyRefreshToken) {
                return res.status(401).json({ error: 'Spotify token expired and no refresh token available' });
            }

            const refreshedTokens = await spotify.refreshAccessToken(musicProfile.spotifyRefreshToken);
            accessToken = refreshedTokens.access_token;
            musicProfile.spotifyAccessToken = refreshedTokens.access_token;
            musicProfile.spotifyTokenExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000);

            if (refreshedTokens.refresh_token) {
                musicProfile.spotifyRefreshToken = refreshedTokens.refresh_token;
            }
            
            await musicProfile.save();
        }

        const syncResults = await syncUserSpotifyData(userId, accessToken);

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
};