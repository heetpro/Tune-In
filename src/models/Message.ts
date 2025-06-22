import type { IMessage } from "@/types";
import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema<IMessage>({
    senderId: {
        type: String,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
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