import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import type { Response } from "express";

export const removeFriend = async (req: AuthRequest, res: Response) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        const friendUser = await User.findById(friendId);
        if (!friendUser) {
            return res.status(404).json({ error: 'Friend not found' });
        }

        const user = await User.findById(userId);
        if (!user || !user.friends.includes(friendId)) {
            return res.status(400).json({ error: 'User is not in your friends list' });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        });

        await FriendRequest.findOneAndUpdate(
            {
                $or: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ],
                status: 'accepted'
            },
            {
                status: 'rejected',
                updatedAt: new Date()
            }
        );

        return res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error removing friend:', error);
        return res.status(500).json({ error: 'Failed to remove friend' });
    }
}; 