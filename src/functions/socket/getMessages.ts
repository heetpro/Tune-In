import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import type { Response } from "express";

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ],
            // isDeleted: false
          })
          .sort({ sentAt: -1 })
      
          res.status(200).json(messages);
          
        } catch (error) {
          res.status(500).json({ error: 'Failed to get messages' });
        }
}