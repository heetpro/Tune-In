import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import { log } from "console";
import type { Response } from "express";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const senderId = req.user._id;
        let targetReceiverId = id;

        // Check if either receiverId or username is provided
        if (!targetReceiverId) {
            return res.status(400).json({ error: 'Either receiverId or username is required' });
        }

        // If username is provided but not receiverId, find the user by username
        if (!targetReceiverId) {
            const receiver = await User.findOne({ username: targetReceiverId });
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

        log("SENDER USER:::::::::::::::::::::::::::::::::", targetReceiverId);

        if (senderUser.friends.id.includes(targetReceiverId)) {
            return res.status(400).json({ error: 'Users are already friends' });
        }

        if ((senderUser.friendRequests.incoming.id as string[]).includes(targetReceiverId)) {
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
            $addToSet: { 'friendRequests.outgoing.id': targetReceiverId }
        });
        await User.findByIdAndUpdate(targetReceiverId, {
            $addToSet: { 'friendRequests.incoming.id': senderId }
        });

        // Auto‑accept existing incoming:
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { 'friends.id': targetReceiverId },
            $pull: { 'friendRequests.incoming.id': targetReceiverId }
        });
        await User.findByIdAndUpdate(targetReceiverId, {
            $addToSet: { 'friends.id': senderId },
            $pull: { 'friendRequests.outgoing.id': senderId }
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