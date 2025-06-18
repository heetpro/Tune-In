import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import Match from "@/models/Match";
import type { Response } from "express";
import mongoose from "mongoose";

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
        if (senderUser?.friends.includes(targetReceiverId)) {
            return res.status(400).json({ error: 'Users are already friends' });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: targetReceiverId },
                { senderId: targetReceiverId, receiverId: senderId }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                // If receiver has already sent a request to sender, accept it automatically
                if (existingRequest.senderId.toString() === targetReceiverId) {
                    existingRequest.status = 'accepted';
                    existingRequest.respondedAt = new Date();
                    existingRequest.updatedAt = new Date();
                    await existingRequest.save();

                    // Update both users' friends lists
                    await User.findByIdAndUpdate(senderId, {
                        $addToSet: { friends: targetReceiverId },
                        $pull: { 'friendRequests.incoming': targetReceiverId }
                    });

                    await User.findByIdAndUpdate(targetReceiverId, {
                        $addToSet: { friends: senderId },
                        $pull: { 'friendRequests.outgoing': senderId }
                    });

                    return res.json({
                        message: 'Friend request accepted automatically',
                        request: existingRequest,
                        receiver: {
                            _id: receiverUser._id,
                            username: receiverUser.username,
                            displayName: receiverUser.displayName,
                            profilePicture: receiverUser.profilePicture
                        }
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
                    $addToSet: { 'friendRequests.outgoing': targetReceiverId }
                });

                await User.findByIdAndUpdate(targetReceiverId, {
                    $addToSet: { 'friendRequests.incoming': senderId }
                });

                return res.json({
                    message: 'Friend request sent',
                    request: existingRequest,
                    receiver: {
                        _id: receiverUser._id,
                        username: receiverUser.username,
                        displayName: receiverUser.displayName,
                        profilePicture: receiverUser.profilePicture
                    }
                });
            }
        }

        // Create new friend request
        const friendRequest = new FriendRequest({
            senderId,
            receiverId: targetReceiverId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await friendRequest.save();

        // Update users' friendRequests arrays
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { 'friendRequests.outgoing': targetReceiverId }
        });

        await User.findByIdAndUpdate(targetReceiverId, {
            $addToSet: { 'friendRequests.incoming': senderId }
        });

        return res.status(201).json({
            message: 'Friend request sent',
            request: friendRequest,
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