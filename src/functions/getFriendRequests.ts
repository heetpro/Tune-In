import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        
        // Get the current user with populated friend request information
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const incomingRequests = await User.find({
            _id: { $in: user.friendRequests.incoming }
        }).select('_id displayName firstName lastName profilePicture');

        const outgoingRequests = await User.find({
            _id: { $in: user.friendRequests.outgoing }
        }).select('_id displayName firstName lastName profilePicture');

        return res.json({
            incoming: incomingRequests,
            outgoing: outgoingRequests
        });
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return res.status(500).json({ error: 'Failed to get friend requests' });
    }
}; 