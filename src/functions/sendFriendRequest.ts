import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, username } = req.body;
        const senderId = req.user._id;
        let targetReceiverId = receiverId;

        // Check if either receiverId or username is provided
        if (!receiverId && !username) {
            return res.status(400).json({ error: 'Either receiverId or username is required' });
        }

        // If username is provided but not receiverId, find the user by username
        if (!receiverId && username) {
            const receiver = await User.findOne({ username: username.toLowerCase() });
            if (!receiver) {
                return res.status(404).json({ error: 'User not found with the provided username' });
            }
            targetReceiverId = receiver._id.toString();
        }

        // Cannot send request to yourself
        if (senderId.toString() === targetReceiverId) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        // Check if receiver exists
        const receiverUser = await User.findById(targetReceiverId);
        if (!receiverUser) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        // Check if users are already friends
        const senderUser = await User.findById(senderId);
        if (!senderUser) {
            return res.status(404).json({ error: 'Sender user not found' });
        }

        if (senderUser.friends.id.includes(targetReceiverId)) {
            return res.status(400).json({ error: 'Users are already friends' });
        }

        // Check if receiver has already sent a request to the sender
        if (senderUser.friendRequests.incoming.id.includes(targetReceiverId)) {
            // Accept the request automatically
            await User.findByIdAndUpdate(senderId, {
                $addToSet: { 'friends.id': targetReceiverId },
                $pull: { 'friendRequests.incoming': targetReceiverId }
            });

            await User.findByIdAndUpdate(targetReceiverId, {
                $addToSet: { 'friends.id': senderId },
                $pull: { 'friendRequests.outgoing': senderId }
            });

            return res.json({
                message: 'Friend request accepted automatically',
                receiver: {
                    _id: receiverUser._id,
                    username: receiverUser.username,
                    displayName: receiverUser.displayName,
                    profilePicture: receiverUser.profilePicture
                }
            });
        }

        // Check if sender has already sent a request to the receiver
        if (senderUser.friendRequests.outgoing.id.includes(targetReceiverId)) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        // Send the friend request by updating both users
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { 'friendRequests.outgoing': targetReceiverId }
        });

        await User.findByIdAndUpdate(targetReceiverId, {
            $addToSet: { 'friendRequests.incoming': senderId }
        });

        return res.status(201).json({
            message: 'Friend request sent',
            receiver: {
                _id: receiverUser._id,
                username: receiverUser.username,
                displayName: receiverUser.displayName,
                profilePicture: receiverUser.profilePicture
            }
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ error: 'Failed to send friend request' });
    }
}; 