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


        // Check if token is expired and refresh if needed
        if (user.musicProfile.spotifyTokenExpiresAt && user.musicProfile.spotifyTokenExpiresAt < new Date()) {
            if (!user.musicProfile.spotifyRefreshToken) {
                return res.status(400).json({ error: 'Spotify token expired and no refresh token available' });
            }

            // Refresh the token
            const refreshedTokens = await spotify.refreshAccessToke(user.musicProfile.spotifyRefreshToken);
            user.musicProfile.spotifyAccessToken = refreshedTokens.access_token;
            user.musicProfile.spotifyTokenExpiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000);
            if (refreshedTokens.refresh_token) {
                user.musicProfile.spotifyRefreshToken = refreshedTokens.refresh_token;
            }
        }



        res.status(200).json({ message: "Spotify data synced successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sync Spotify data" });
    }
}