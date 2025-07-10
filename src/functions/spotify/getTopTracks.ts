import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import { MusicProfile } from "@/models/MusicProfile";
import type { Response } from "express";
import type { IMusicProfile } from "@/types";
import mongoose from "mongoose";

export const getTopTracks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { timeRange = 'medium_term' } = req.query;

        // Populate the musicProfile reference
        const user = await User.findById(userId).populate('musicProfile');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if musicProfile exists
        if (!user.musicProfile) {
            return res.status(404).json({ error: "Music profile not found" });
        }

        // Check if it's an ObjectId (not populated) or document
        const isMusicProfilePopulated = 
            user.musicProfile instanceof mongoose.Types.ObjectId === false &&
            typeof user.musicProfile !== 'string';
            
        if (!isMusicProfilePopulated) {
            return res.status(500).json({ error: "Failed to load music profile data" });
        }

        // Now we can safely cast it to IMusicProfile
        const musicProfile = user.musicProfile as IMusicProfile;

        // Now we can access the populated musicProfile
        const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
        const range = validTimeRanges.includes(timeRange as string) ? timeRange as string : 'medium_term';

        // Handle case where topTracks might not exist or be properly initialized
        const tracks = 
            musicProfile.topTracks && 
            musicProfile.topTracks[range as keyof typeof musicProfile.topTracks] ? 
            musicProfile.topTracks[range as keyof typeof musicProfile.topTracks] : [];

        return res.status(200).json({
            timeRange: range,
            tracks,
            count: tracks.length
        });

    } catch (error) {
        console.error('Error fetching top tracks:', error);
        return res.status(500).json({ error: "Failed to fetch top tracks" });
    }
};
