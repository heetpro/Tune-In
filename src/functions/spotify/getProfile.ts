import type { AuthRequest } from "@/middleware/auth";
import type { Response } from "express";

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        return res.json({
            id: user._id,
            spotifyId: user.spotifyId,
            username: user.username || null,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName || '',
            profilePicture: user.profilePicture || '',
            bio: user.bio || '',
            age: user.age || null,
            gender: user.gender || null,
            intrestedIn: user.intrestedIn || [],
            city: user.city || '',
            country: user.country || '',
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            isOnline: user.isOnline || false,
            lastSeen: user.lastSeen,
            isPremium: user.isPremium || false,
            isVerified: user.isVerified || false,
            isBanned: user.isBanned || false,
            isAdmin: user.isAdmin || false,
        });
    }
    catch (error) {
        console.error('Error getting profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}