import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const setUsername = async (req: AuthRequest, res: Response) => {
    try {
        const { username } = req.body;
        const userId = req.user._id;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
        }

        // Validate username format (letters, numbers, dots, underscores)
        if (!/^[a-z0-9._]+$/.test(username)) {
            return res.status(400).json({ 
                error: 'Username can only contain letters, numbers, dots, and underscores' 
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Update the user's username and mark onboarding as completed
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                username: username.toLowerCase(),
                hasCompletedOnboarding: true 
            },
            { new: true }
        ).select('-__v');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            message: 'Username set successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error setting username:', error);
        return res.status(500).json({ error: 'Failed to set username' });
    }
}; 