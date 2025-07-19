import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";
import type { IMusicProfile } from "@/types/index";

export const getMusicProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('musicProfile')
            .lean();
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (!user.musicProfile || typeof user.musicProfile === 'string') {
            return res.status(404).json({ error: "Music profile not found" });
        }
        
        // Cast the populated object to IMusicProfile
        const musicProfileData = user.musicProfile as unknown as IMusicProfile;
        
        const musicProfile = {
            topArtists: musicProfileData.topArtists,
            topTracks: musicProfileData.topTracks,
            topGenres: musicProfileData.topGenres,
            recentTracks: musicProfileData.recentTracks?.slice(0, 10), // Limit for overview
            currentlyPlaying: musicProfileData.currentlyPlaying,
            audioFeatures: musicProfileData.audioFeatures,
            playlistCount: musicProfileData.playlists?.length || 0,
            lastSyncAt: musicProfileData.lastSyncAt,
            spotifyConnected: musicProfileData.spotifyConnected
        };

        return res.status(200).json({
            musicProfile
        });

    } catch (error) {
        console.error('Error fetching music profile:', error);
        return res.status(500).json({ error: "Failed to fetch music profile" });
    }
};