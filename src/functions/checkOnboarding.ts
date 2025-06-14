import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const checkOnboarding = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('hasCompletedOnboarding username');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            hasUsername: !!user.username,
            username: user.username
        });
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return res.status(500).json({ error: 'Failed to check onboarding status' });
    }
}; 