import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import { User } from "@/models/User";
import Match from "@/models/Match";
import type { Response } from "express";
import mongoose from "mongoose";

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;
        const senderIdString = senderId.toString();
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(senderIdString) || !mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        const currentUser = await User.findById(senderId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if they are friends using the updated model structure
        const isFriend = currentUser.friends && 
            currentUser.friends.id && 
            Array.isArray(currentUser.friends.id) && 
            currentUser.friends.id.some(id => id === userToChatId);
        
        const matchExists = await Match.findOne({
            $or: [
                { user1Id: senderIdString, user2Id: userToChatId, status: 'accepted' },
                { user1Id: userToChatId, user2Id: senderIdString, status: 'accepted' }
            ]
        });
        
        if (!isFriend && !matchExists) {
            return res.status(403).json({ error: 'You can only chat with your friends or accepted matches' });
        }
        
        const messages = await Message.find({
            $or: [
                { senderId: senderIdString, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderIdString }
            ]
          })
          .sort({ sentAt: -1 });
      
          res.status(200).json(messages);
          
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
}