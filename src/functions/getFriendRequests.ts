import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import type { Response } from "express";

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        // Get incoming requests
        const incomingRequests = await FriendRequest.find({
            receiverId: userId,
            status: 'pending'
        }).populate('senderId', '_id displayName firstName lastName profilePicture');

        // Get outgoing requests
        const outgoingRequests = await FriendRequest.find({
            senderId: userId,
            status: 'pending'
        }).populate('receiverId', '_id displayName firstName lastName profilePicture');

        return res.json({
            incoming: incomingRequests,
            outgoing: outgoingRequests
        });
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return res.status(500).json({ error: 'Failed to get friend requests' });
    }
}; 