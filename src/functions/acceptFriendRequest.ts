import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
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

        // Check if the friend request exists
        if (!user.friendRequests?.incoming?.id.includes(senderId)) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { 'friends.id': senderId },
            $pull: { 'friendRequests.incoming': senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $addToSet: { 'friends.id': userId },
            $pull: { 'friendRequests.outgoing': userId }
        });

        return res.json({
            message: 'Friend request accepted',
            friend: {
                _id: sender._id,
                displayName: sender.displayName,
                firstName: sender.firstName,
                lastName: sender.lastName,
                profilePicture: sender.profilePicture
            }
        });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ error: 'Failed to accept friend request' });
    }
}; 