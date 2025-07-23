import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import { User } from "@/models/User";
import Match from "@/models/Match";
import type { Response } from "express";

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;
        const senderIdString = senderId.toString();
        
        const currentUser = await User.findById(senderId);
        if (!currentUser) {
            throw new Error('User not found');
        }
        
        // Check if they are friends
        const isFriend = currentUser.friends && currentUser.friends.id && 
            Array.isArray(currentUser.friends.id) && 
            currentUser.friends.id.some(id => id === userToChatId);
        
        const matchExists = await Match.findOne({
            $or: [
                { user1Id: senderIdString, user2Id: userToChatId, status: 'accepted' },
                { user1Id: userToChatId, user2Id: senderIdString, status: 'accepted' }
            ]
        });
        
        if (!isFriend && !matchExists) {
            throw new Error('You can only chat with your friends or accepted matches');
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