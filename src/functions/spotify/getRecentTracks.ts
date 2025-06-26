import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getRecentTracks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { limit = 20 } = req.query;

        const user = await User.findById(userId).select('musicProfile.recentTracks');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const recentTracks = user.musicProfile.recentTracks || [];
        const limitNum = parseInt(limit as string) || 20;
        const tracks = recentTracks.slice(0, limitNum);

        return res.status(200).json({
            tracks,
            count: tracks.length,
            total: recentTracks.length
        });

    } catch (error) {
        console.error('Error fetching recent tracks:', error);
        return res.status(500).json({ error: "Failed to fetch recent tracks" });
    }
};