import type { IMessage } from "@/types";
import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema<IMessage>({
    senderId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        required: true,
    },
    sharedContent: {
        type: Schema.Types.Mixed,
        required: false,
    },
    isRead: {
        type: Boolean,
        required: true,
    },
    readAt: {
        type: Date,
        required: false,
    },
    isDelivered: {
        type: Boolean,
        required: true,
    },
    deliveredAt: {
        type: Date,
        required: false,
    },
    sentAt: {
        type: Date,
        required: true,
    },
    editedAt: {
        type: Date,
        required: false,
    },
    deletedAt: {
        type: Date,
        required: false,
    },
    isDeleted: {
        type: Boolean,
        required: true,
    },
});

export default mongoose.model<IMessage>("Message", MessageSchema);  