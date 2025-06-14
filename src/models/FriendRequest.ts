import type { IFriendRequest } from "@/types";
import mongoose, { Schema } from "mongoose";

const FriendRequestSchema = new Schema<IFriendRequest>({
    senderId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    respondedAt: {
        type: Date,
        required: false,
    },
});

// Create compound index to ensure uniqueness between users
FriendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema); 