import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import Match from "@/models/Match";
import type { Response } from "express";

export const getUsersToChat = async (req: AuthRequest, res: Response) => {
    try {
        const myId = req.user._id.toString();
        
        const currentUser = await User.findById(myId);
        if (!currentUser) {
            throw new Error('User not found');
        }
        
        const friendIds = currentUser.friends || [];
        
        const acceptedMatches = await Match.find({
            $or: [
                { user1Id: myId, status: 'accepted' },
                { user2Id: myId, status: 'accepted' }
            ]
        });
        
        const matchedUserIds = acceptedMatches.map(match => 
            match.user1Id === myId ? match.user2Id : match.user1Id
        );
        
        const allowedUserIds = [...new Set([ ...matchedUserIds, ...friendIds])];
        
        const users = await User.find({
            _id: { $in: allowedUserIds }
        }).select('_id username displayName profilePicture isOnline lastSeen');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users to chat:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
}