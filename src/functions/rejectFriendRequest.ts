import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { senderId } = req.params;
        const userId = req.user._id;

        // Check if senderId exists
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' });
        }

        // Find the current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify the request exists in the incoming requests
        if (!user.friendRequests.incoming?.id?.includes(senderId)) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        // Remove the friend request
        await User.findByIdAndUpdate(userId, {
            $pull: { 'friendRequests.incoming': senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $pull: { 'friendRequests.outgoing': userId }
        });

        return res.json({
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ error: 'Failed to reject friend request' });
    }
}; 