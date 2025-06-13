import type { AuthRequest } from "@/middleware/auth";
import type { Response } from "express";

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        return res.json({
            id: user._id,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName || '',
            profilePicture: user.profilePicture,
            bio: user.bio || '',
            isOnline: user.isOnline,
            isActive: user.isActive,
            isBanned: user.isBanned,
            isVerified: user.isVerified,
            isPremium: user.isPremium,
            isAdmin: user.isAdmin,
        })
    }
    catch (error) {
        console.error('Error getting profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}