import type { IAnalytics } from "@/types";
import mongoose, { Schema } from "mongoose";

const AnalyticsSchema = new Schema<IAnalytics>({
    date: {
        type: Date,
        required: true,
    },
    dailyActiveUsers: {
        type: Number,
        required: true,
    },
    newRegistrations: {
        type: Number,
        required: true,
    },
    totalUsers: {
        type: Number,
        required: true,
    },
    totalMatches: {
        type: Number,
        required: true,
    },
    mutualMatches: {
        type: Number,
        required: true,
    },
    averageMatchScore: {
        type: Number,
        required: true,
    },
    totalTracksShared: {
        type: Number,
        required: true,
    },
    uniqueArtistsDiscovered: {
        type: Number,
        required: true,
    },
    playlistsCreated: {
        type: Number,
        required: true,
    },
    averageSessionDuration: {
        type: Number,
        required: true,
    },
    messagesExchanged: {
        type: Number,
        required: true,
    },
    averageMessagesPerConversation: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});



export default mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);    