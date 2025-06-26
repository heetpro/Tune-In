import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getMusicProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('musicProfile');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const musicProfile = {
            topArtists: user.musicProfile.topArtists,
            topTracks: user.musicProfile.topTracks,
            topGenres: user.musicProfile.topGenres,
            recentTracks: user.musicProfile.recentTracks?.slice(0, 10), // Limit for overview
            currentlyPlaying: user.musicProfile.currentlyPlaying,
            audioFeatures: user.musicProfile.audioFeatures,
            playlistCount: user.musicProfile.playlists?.length || 0,
            lastSyncAt: user.musicProfile.lastSyncAt,
            spotifyConnected: user.musicProfile.spotifyConnected
        };

        return res.status(200).json({
            musicProfile
        });

    } catch (error) {
        console.error('Error fetching music profile:', error);
        return res.status(500).json({ error: "Failed to fetch music profile" });
    }
};