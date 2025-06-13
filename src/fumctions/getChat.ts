import type { AuthRequest } from "@/middleware/auth";
import Conversation from "@/models/Conversation";
import type { Response } from "express";

export const getChat = async (req: AuthRequest, res: Response) => {
    try {
        const { participantId } = req.body;
        const userId = req.user._id.toString();
    
        if (userId === participantId) {
          return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }
    
        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userId, participantId] },
          isActive: true
        });
    
        if (existingConversation) {
          return res.json(existingConversation);
        }
    
        // Create new conversation
        const conversation = new Conversation({
          matchId: `${userId}_${participantId}`,
          participants: [userId, participantId],
          lastActivity: new Date(),
          messageCount: 0,
          isActive: true,
          sharedTracks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    
        await conversation.save();
        await conversation.populate('participants', 'displayName profilePicture isOnline lastSeen');
    
        return res.status(201).json(conversation);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
}