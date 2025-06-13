import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import type { Response } from "express";

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({
            conversationId,
            isDeleted: false
          })
          .sort({ sentAt: -1 })
          .limit(parseInt(limit as string))
          .skip((parseInt(page as string) - 1) * parseInt(limit as string))
          .populate('senderId', 'displayName profilePicture');
      
          res.json(messages.reverse());
        } catch (error) {
          res.status(500).json({ error: 'Failed to get messages' });
        }
}