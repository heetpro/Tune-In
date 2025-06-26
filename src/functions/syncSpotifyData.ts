import { spotifyService } from "@/lib/spotify";
import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";



const spotify = new spotifyService();

export const syncSpotifyData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const spotifyId = user.spotifyId;
        if (!user.musicProfile.spotifyConnected || !user.musicProfile.spotifyAccessToken) {
            return res.status(400).json({ error: 'Spotify not connected' });
        }


        res.status(200).json({ message: "Spotify data synced successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sync Spotify data" });
    }
}