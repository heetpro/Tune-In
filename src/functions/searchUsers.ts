import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { displayName: { $regex: query, $options: 'i' } }
            ],
            isBanned: false
        })
            .select('_id username displayName profilePicture')
            .limit(20);



        const searchUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
        }));

        return res.json(searchUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'Failed to search users' });
    }
};