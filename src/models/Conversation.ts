import type { IConversation } from "@/types";
import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema<IConversation>({
    matchId: {
        type: String,
        required: true,
    },
    participants: {
        type: [String],
        required: true,
    },
    lastMessage: {
        type: Schema.Types.Mixed,
        required: false,
    },
    lastActivity: {
        type: Date,
        required: true,
    },
    messageCount: {
        type: Schema.Types.Mixed,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    sharedTracks: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<IConversation>("Conversation", ConversationSchema);   