import type { IReport } from "@/types";
import mongoose, { Schema } from "mongoose";

const ReportSchema = new Schema<IReport>({
    reporterId: {
        type: String,
        required: true,
    },
    reportedUserId: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    screenshot: {
        type: [String],
        required: false,
    },
    conversationId: {
        type: String,
        required: false,
    },
    messageIds: {
        type: [String],
        required: false,
    },
    status: {
        type: String,
        required: true,
    },
    resolution: {
        type: String,
        required: false,
    },
    resolvedBy: {
        type: String,
        required: false,
    },
    resolvedAt: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<IReport>("Report", ReportSchema); 