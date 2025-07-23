import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import Match from "@/models/Match";
import type { Response } from "express";
import mongoose from "mongoose";

export const getUsersToChat = async (req: AuthRequest, res: Response) => {
    try {
        const myId = req.user._id.toString();
        
        if (!mongoose.Types.ObjectId.isValid(myId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const currentUser = await User.findById(myId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Safely get the friend IDs array
        const friendIds = (currentUser.friends && 
                          currentUser.friends.id && 
                          Array.isArray(currentUser.friends.id)) ? 
                          currentUser.friends.id.filter(id => mongoose.Types.ObjectId.isValid(id)) : 
                          [];
        
        const acceptedMatches = await Match.find({
            $or: [
                { user1Id: myId, status: 'accepted' },
                { user2Id: myId, status: 'accepted' }
            ]
        });
        
        const matchedUserIds = acceptedMatches.map(match => 
            match.user1Id === myId ? match.user2Id : match.user1Id
        );
        
        // Filter out any invalid IDs
        const validMatchedUserIds = matchedUserIds.filter(id => 
            typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
        );
        
        const allowedUserIds = [...new Set([...validMatchedUserIds, ...friendIds])];
        
        // Only proceed if there are valid IDs
        if (allowedUserIds.length === 0) {
            return res.json([]);
        }
        
        const users = await User.find({
            _id: { $in: allowedUserIds }
        }).select('_id username displayName profilePicture lastSeen');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users to chat:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
}