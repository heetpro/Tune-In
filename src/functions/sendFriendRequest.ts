import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import Match from "@/models/Match";
import type { Response } from "express";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        // Check if receiverId is provided
        if (!receiverId) {
            return res.status(400).json({ error: 'Receiver ID is required' });
        }

        // Cannot send request to yourself
        if (senderId.toString() === receiverId) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        // Check if receiver exists
        const receiverUser = await User.findById(receiverId);
        if (!receiverUser) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        // Check if users are already friends
        const senderUser = await User.findById(senderId);
        if (senderUser?.friends.includes(receiverId)) {
            return res.status(400).json({ error: 'Users are already friends' });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                // If receiver has already sent a request to sender, accept it automatically
                if (existingRequest.senderId.toString() === receiverId) {
                    existingRequest.status = 'accepted';
                    existingRequest.respondedAt = new Date();
                    existingRequest.updatedAt = new Date();
                    await existingRequest.save();

                    // Update both users' friends lists
                    await User.findByIdAndUpdate(senderId, {
                        $addToSet: { friends: receiverId },
                        $pull: { 'friendRequests.incoming': receiverId }
                    });

                    await User.findByIdAndUpdate(receiverId, {
                        $addToSet: { friends: senderId },
                        $pull: { 'friendRequests.outgoing': senderId }
                    });

                    return res.json({
                        message: 'Friend request accepted automatically',
                        request: existingRequest
                    });
                } else {
                    return res.status(400).json({ error: 'Friend request already sent' });
                }
            } else if (existingRequest.status === 'accepted') {
                return res.status(400).json({ error: 'Users are already friends' });
            } else {
                // If previously rejected, create new request
                existingRequest.status = 'pending';
                existingRequest.updatedAt = new Date();
                existingRequest.respondedAt = undefined;
                await existingRequest.save();

                // Update users' friendRequests
                await User.findByIdAndUpdate(senderId, {
                    $addToSet: { 'friendRequests.outgoing': receiverId }
                });

                await User.findByIdAndUpdate(receiverId, {
                    $addToSet: { 'friendRequests.incoming': senderId }
                });

                return res.json({
                    message: 'Friend request sent',
                    request: existingRequest
                });
            }
        }

        // Create new friend request
        const friendRequest = new FriendRequest({
            senderId,
            receiverId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await friendRequest.save();

        // Update users' friendRequests arrays
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { 'friendRequests.outgoing': receiverId }
        });

        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { 'friendRequests.incoming': senderId }
        });

        return res.status(201).json({
            message: 'Friend request sent',
            request: friendRequest
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ error: 'Failed to send friend request' });
    }
}; 