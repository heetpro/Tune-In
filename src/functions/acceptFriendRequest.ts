import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import type { Response } from "express";

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        // Find the request
        const request = await FriendRequest.findById(requestId);
        
        if (!request) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        // Verify the current user is the receiver of the request
        if (request.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Not authorized to accept this request' });
        }

        // Check if the request is still pending
        if (request.status !== 'pending') {
            return res.status(400).json({ error: `Request already ${request.status}` });
        }

        // Update the request status
        request.status = 'accepted';
        request.respondedAt = new Date();
        request.updatedAt = new Date();
        await request.save();

        // Add each user to the other's friends list
        const senderId = request.senderId;
        
        // Update both users' friends and friendRequests arrays
        await User.findByIdAndUpdate(userId, {
            $addToSet: { friends: senderId },
            $pull: { 'friendRequests.incoming': senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $addToSet: { friends: userId },
            $pull: { 'friendRequests.outgoing': userId }
        });

        return res.json({
            message: 'Friend request accepted',
            request: request
        });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ error: 'Failed to accept friend request' });
    }
}; 