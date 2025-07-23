import type { AuthRequest } from "@/middleware/auth";
import Conversation from "@/models/Conversation";
import type { Response } from "express";

export const getChats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            participants: userId,
            isActive: true,

        }).sort({ updatedAt: -1 })
        .populate('participants', 'displayName profilePicture lastSeen')
        .limit(50);

        return res.json(conversations);
    }
    catch (error) {
        console.error('Error getting chats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}