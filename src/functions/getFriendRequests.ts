import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Pull out the nested .id arrays, with defaults
    const incomingIds = user.friendRequests?.incoming?.id ?? [];
    const outgoingIds = user.friendRequests?.outgoing?.id ?? [];

    // Load full user documents for each set of IDs
    const incomingRequests = await User.find({
      _id: { $in: incomingIds },
    }).select("_id displayName firstName lastName profilePicture");

    const outgoingRequests = await User.find({
      _id: { $in: outgoingIds },
    }).select("_id displayName firstName lastName profilePicture");

    return res.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (err) {
    console.error("Error getting friend requests:", err);
    return res.status(500).json({ error: "Failed to get friend requests" });
  }
};
