import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getFriends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get all friends of this user
        const friends = await User.find({
            _id: { $in: user.friends.id }
        }).select('_id displayName firstName lastName profilePicture isOnline lastSeen');
        
        return res.json(friends);
    } catch (error) {
        console.error('Error getting friends:', error);
        return res.status(500).json({ error: 'Failed to get friends' });
    }
}; 