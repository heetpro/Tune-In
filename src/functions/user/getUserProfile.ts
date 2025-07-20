import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
console.log("USER:::::::::::::::::::::::::::::::::",user);

        console.log({
            id: user._id,
            spotifyId: user.spotifyId,
            username: user.username || null,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName || '',
            profilePicture: user.profilePicture || '',

        });
        
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
            location: user.location || {
                city: '',
                country: '',
                coordinates: {
                    lat: 0,
                    lng: 0,
                },
            },
            hasCompletedOnboarding: user.hasCompletedOnboarding,
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