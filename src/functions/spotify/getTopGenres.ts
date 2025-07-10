import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import { MusicProfile } from "@/models/MusicProfile";
import type { Response } from "express";
import type { IMusicProfile } from "@/types";
import mongoose from "mongoose";

export const getTopGenres = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

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

        // Handle case where topGenres might not exist or be properly initialized
        const genres = musicProfile.topGenres || [];

        return res.status(200).json({
            genres,
            count: genres.length
        });

    } catch (error) {
        console.error('Error fetching top genres:', error);
        return res.status(500).json({ error: "Failed to fetch top genres" });
    }
};