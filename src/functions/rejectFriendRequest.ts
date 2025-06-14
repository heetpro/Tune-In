import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import type { Response } from "express";

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
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
            return res.status(403).json({ error: 'Not authorized to reject this request' });
        }

        // Check if the request is still pending
        if (request.status !== 'pending') {
            return res.status(400).json({ error: `Request already ${request.status}` });
        }

        // Update the request status
        request.status = 'rejected';
        request.respondedAt = new Date();
        request.updatedAt = new Date();
        await request.save();

        // Update both users' friendRequests arrays
        const senderId = request.senderId;
        
        await User.findByIdAndUpdate(userId, {
            $pull: { 'friendRequests.incoming': senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $pull: { 'friendRequests.outgoing': userId }
        });

        return res.json({
            message: 'Friend request rejected',
            request: request
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ error: 'Failed to reject friend request' });
    }
}; 