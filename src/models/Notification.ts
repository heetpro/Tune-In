import type { INotification } from "@/types";
import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema<INotification>({
    type: {
        type: String,
        required: true,
        enum: ['new_match', 'new_message', 'new_like', 'music_update'],
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedId: {
        type: String,
        required: false,
    },
    relatedType: {
        type: String,
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
    createdAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<INotification>("Notification", NotificationSchema);       