import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Search by username (case insensitive)
        const users = await User.find({
            _id: { $ne: userId }, // Exclude the current user
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { displayName: { $regex: query, $options: 'i' } }
            ],
            isBanned: false // Don't show banned users
        })
        .select('_id username displayName profilePicture isOnline lastSeen')
        .limit(20);

        // For each user, check if the current user has sent them a friend request
        // or if they have sent the current user a friend request
        const currentUser = await User.findById(userId);
        
        const usersWithFriendStatus = users.map(user => {
            const isAlreadyFriend = currentUser?.friends.includes(user._id.toString());
            const hasSentRequest = currentUser?.friendRequests.outgoing.includes(user._id.toString());
            const hasReceivedRequest = currentUser?.friendRequests.incoming.includes(user._id.toString());
            
            return {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                friendStatus: isAlreadyFriend ? 'friends' : 
                             hasSentRequest ? 'request-sent' : 
                             hasReceivedRequest ? 'request-received' : 
                             'none'
            };
        });

        return res.json(usersWithFriendStatus);
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'Failed to search users' });
    }
};