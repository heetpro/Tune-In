import { spotifyService } from "@/lib/spotify";
import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";



const spotify = new spotifyService();

export const syncSpotifyData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.musicProfile.spotifyConnected || !user.musicProfile.spotifyAccessToken) {
            throw new Error('Spotify not connected');

        }
        let accessToken = user.musicProfile.spotifyAccessToken;

       

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sync Spotify data" });
    }
}