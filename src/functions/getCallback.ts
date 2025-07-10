import { User } from "@/models/User";
import { MusicProfile } from "@/models/MusicProfile";
import type { Request, Response } from "express";
import type { AuthRequest } from "@/middleware/auth";
import { spotifyService } from "@/lib/spotify";
import { generateRefreshToken, generateToken } from "@/lib/jwt";


const spotify = new spotifyService();


export const getCallback = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code not provided' });
        }

        console.log('Callback received with code:', code);

        // Get access token from Spotify
        try {
            const tokenData = await spotify.getAccessToken(code as string);
            console.log('Token data received from Spotify');
            
            const userProfile = await spotify.getUserProfile(tokenData.access_token);
            console.log('User profile received:', userProfile.id);
            
            // Check if user exists
            let user = await User.findOne({ spotifyId: userProfile.id });
            let isNewUser = false;
            let musicProfile;

            if (!user) {
                // Create new music profile
                musicProfile = new MusicProfile({
                    spotifyConnected: true,
                    spotifyAccessToken: tokenData.access_token,
                    spotifyRefreshToken: tokenData.refresh_token,
                    spotifyTokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                    lastSyncAt: new Date(),
                    topArtists: { short_term: [], medium_term: [], long_term: [] },
                    topTracks: { short_term: [], medium_term: [], long_term: [] },
                    recentTracks: [],
                    playlists: [],
                    topGenres: [],
                    audioFeatures: {}
                });
                
                await musicProfile.save();

                // Create new user
                isNewUser = true;
                user = new User({
                    spotifyId: userProfile.id,
                    displayName: userProfile.display_name || userProfile.id,
                    firstName: userProfile.display_name?.split(' ')[0] || userProfile.id,
                    lastName: userProfile.display_name?.split(' ').slice(1).join(' ') || '',
                    profilePicture: userProfile.images?.[0]?.url || '',
                    isActive: true,
                    isOnline: true,
                    lastSeen: new Date(),
                    hasCompletedOnboarding: false, // New users need to complete onboarding
                    musicProfile: musicProfile._id
                });

                await user.save();
            } else {
                // Update existing user
                user.lastSeen = new Date();
           
                
                // Find or create music profile
                if (!user.musicProfile) {
                    musicProfile = new MusicProfile({
                        spotifyConnected: true,
                        spotifyAccessToken: tokenData.access_token,
                        spotifyRefreshToken: tokenData.refresh_token,
                        spotifyTokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                        lastSyncAt: new Date(),
                        topArtists: { short_term: [], medium_term: [], long_term: [] },
                        topTracks: { short_term: [], medium_term: [], long_term: [] },
                        recentTracks: [],
                        playlists: [],
                        topGenres: [],
                        audioFeatures: {}
                    });
                    await musicProfile.save();
                    user.musicProfile = musicProfile._id;
                } else {
                    musicProfile = await MusicProfile.findById(user.musicProfile);
                    if (musicProfile) {
                        musicProfile.spotifyConnected = true;
                        musicProfile.spotifyAccessToken = tokenData.access_token;
                        musicProfile.spotifyRefreshToken = tokenData.refresh_token;
                        musicProfile.spotifyTokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
                        await musicProfile.save();
                    }
                }
                
                await user.save();
            }

            // Now sync Spotify data in the background
            syncSpotifyData(user._id, tokenData.access_token).catch(error => {
                console.error('Background Spotify data sync failed:', error);
            });

            // Generate tokens
            const token = generateToken({ id: user._id, spotifyId: user.spotifyId }, res);
            const refreshToken = generateRefreshToken({ id: user._id });

            // Check if user has a username set
            const needsUsername = isNewUser || !user.username;

            // Redirect to frontend with token and onboarding status
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}&refresh=${refreshToken}&needsUsername=${needsUsername}`;
            
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('Spotify auth error:', error);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Callback error:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
};

// Separate function for Spotify data sync to be executed in the background
async function syncSpotifyData(userId: string, accessToken: string): Promise<void> {
    try {
        console.log('Starting background Spotify data sync for user:', userId);
        
        const user = await User.findById(userId).populate('musicProfile');
        if (!user || !user.musicProfile) {
            throw new Error('User or music profile not found');
        }
        
        const musicProfile = user.musicProfile;
        
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

        console.log('Background Spotify data sync completed successfully for user:', userId);
    } catch (error) {
        console.error('Error in background Spotify data sync:', error);
        throw error;
    }
}