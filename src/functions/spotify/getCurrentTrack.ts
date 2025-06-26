import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getCurrentTrack = async (req: AuthRequest, res: Response
) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('musicProfile.currentlyPlaying');
            
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentTrack = user.musicProfile.currentlyPlaying || null;

        return res.status(200).json({
            currentTrack,
            isPlaying: currentTrack?.isPlaying || false
        });

    } catch (error) {
        console.error('Error fetching current track:', error);
        return res.status(500).json({ error: "Failed to fetch current track" });
    }
};
