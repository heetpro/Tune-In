import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getTopGenres = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('musicProfile.topGenres');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const genres = user.musicProfile.topGenres || [];

        return res.status(200).json({
            genres,
            count: genres.length
        });

    } catch (error) {
        console.error('Error fetching top genres:', error);
        return res.status(500).json({ error: "Failed to fetch top genres" });
    }
};