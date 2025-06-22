import { User } from "@/models/User";
import type { Request, Response } from "express";
import type { AuthRequest } from "@/middleware/auth";
import { spotifyService } from "@/lib/spotify";
import { generateRefreshToken, generateToken } from "@/lib/jwt";


const spotify = new spotifyService();


export const getCallback = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code not provided' });
        }

        console.log('Callback received with code:', code);

        // Get access token from Spotify
        try {
            const tokenData = await spotify.getAccessToken(code as string);
            console.log('Token data received from Spotify');
            
            const userProfile = await spotify.getUserProfile(tokenData.access_token);
            console.log('User profile received:', userProfile.id);
            
            // Check if user exists
            let user = await User.findOne({ spotifyId: userProfile.id });
            let isNewUser = false;

            if (!user) {
                // Create new user
                isNewUser = true;
                user = new User({
                    spotifyId: userProfile.id,
                    displayName: userProfile.display_name || userProfile.id,
                    firstName: userProfile.display_name?.split(' ')[0] || userProfile.id,
                    lastName: userProfile.display_name?.split(' ').slice(1).join(' ') || '',
                    profilePicture: userProfile.images?.[0]?.url || '',
                    isActive: true,
                    isOnline: true,
                    lastSeen: new Date(),
                    hasCompletedOnboarding: false // New users need to complete onboarding
                });

                await user.save();
            } else {
                // Update existing user
                user.isOnline = true;
                user.lastSeen = new Date();
                await user.save();
            }

            // Generate tokens
            const token = generateToken({ id: user._id, spotifyId: user.spotifyId }, res);
            const refreshToken = generateRefreshToken({ id: user._id });

            // Check if user has a username set
            const needsUsername = isNewUser || !user.username;

            // Redirect to frontend with token and onboarding status
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}&refresh=${refreshToken}&needsUsername=${needsUsername}`;
            
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('Spotify auth error:', error);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Callback error:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
};