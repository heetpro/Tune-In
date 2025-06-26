import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getTopArtists = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { timeRange = 'medium_term' } = req.query;

        const user = await User.findById(userId).select('musicProfile.topArtists');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
        const range = validTimeRanges.includes(timeRange as string) ? timeRange as string : 'medium_term';

        const artists = user.musicProfile.topArtists[range as keyof typeof user.musicProfile.topArtists] || [];

        return res.status(200).json({
            timeRange: range,
            artists,
            count: artists.length
        });

    } catch (error) {
        console.error('Error fetching top artists:', error);
        return res.status(500).json({ error: "Failed to fetch top artists" });
    }
};