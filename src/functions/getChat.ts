import type { AuthRequest } from "@/middleware/auth";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";
import { User } from "@/models/User";
import type { Response } from "express";

export const getChat = async (req: AuthRequest, res: Response) => {
    try {
        const { participantId } = req.body;
        const userId = req.user._id.toString();
    
        if (userId === participantId) {
          return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }
    
        // Check if users are friends or have a match
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        const areFriends = user.friends.includes(participantId);
        
        // Check for match
        const match = await Match.findOne({
          $or: [
            { user1Id: userId, user2Id: participantId },
            { user1Id: participantId, user2Id: userId }
          ],
          status: 'accepted'
        });
        
        const haveMatch = !!match;
        
        // Only allow conversation if users are friends or have a match
        if (!areFriends && !haveMatch) {
          return res.status(403).json({ 
            error: 'Cannot create conversation. Users must be friends or have a match',
            areFriends,
            haveMatch
          });
        }
    
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userId, participantId] },
          isActive: true
        });
    
        if (existingConversation) {
          return res.json(existingConversation);
        }
    
        const conversation = new Conversation({
          matchId: match ? match._id : `friend_${userId}_${participantId}`,
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
        console.error('Error creating conversation:', error);
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
};