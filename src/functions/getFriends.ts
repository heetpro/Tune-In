import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";
import mongoose from "mongoose";

export const getFriends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error(`Invalid userId format in getFriends: ${userId}`);
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Safely get friend IDs and filter out invalid ones
        const friendIds = (user.friends && 
                          user.friends.id && 
                          Array.isArray(user.friends.id)) ? 
                          user.friends.id.filter(id => mongoose.Types.ObjectId.isValid(id)) : 
                          [];
        
        if (friendIds.length === 0) {
            return res.json([]);
        }
        
        const friends = await User.find({
            _id: { $in: friendIds }
        }).select('_id displayName firstName lastName profilePicture lastSeen');
        
        return res.json(friends);
    } catch (error) {
        console.error('Error getting friends:', error);
        return res.status(500).json({ error: 'Failed to get friends' });
    }
}; 