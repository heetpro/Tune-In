import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getAudioFeatures = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('musicProfile.audioFeatures');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const audioFeatures = user.musicProfile.audioFeatures || null;

        return res.status(200).json({
            audioFeatures
        });

    } catch (error) {
        console.error('Error fetching audio features:', error);
        return res.status(500).json({ error: "Failed to fetch audio features" });
    }
};
