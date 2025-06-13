import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import type { Response } from "express";

export const readMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id.toString();
    
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId },
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );
    
        return res.json({ message: 'Messages marked as read' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to mark messages as read' });
      }
}