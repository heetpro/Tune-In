import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getPlaylists = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('musicProfile.playlists');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const playlists = user.musicProfile.playlists || [];

        return res.status(200).json({
            playlists,
            count: playlists.length
        });

    } catch (error) {
        console.error('Error fetching playlists:', error);
        return res.status(500).json({ error: "Failed to fetch playlists" });
    }
};