import type { IErrorLog } from "@/types";
import mongoose, { Schema } from "mongoose";

const ErrorSchema = new Schema<IErrorLog>({
    userId: {
        type: String,
        required: false,
    },
    error: {
        type: Schema.Types.Mixed,
        required: true,
    },
    request: {
        type: Schema.Types.Mixed,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    environment: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
    },
    resolved: {
        type: Boolean,
        required: true,
    },
    resolvedAt: {
        type: Date,
        required: false,
    },
});

export default mongoose.model<IErrorLog>("Error", ErrorSchema); 