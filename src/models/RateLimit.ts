import type { IRateLimit } from "@/types";
import mongoose, { Schema } from "mongoose";

const RateLimitSchema = new Schema<IRateLimit>({
    identifier: {
        type: Schema.Types.Mixed,
        required: true,
    },
    endpoint: {
        type: String,
        required: true,
    },
    requests: {
        type: Schema.Types.Mixed,
        required: true,
    },
    windowStart: {
        type: Date,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        required: true,
    },
    blockedUntil: {
        type: Date,
        required: false,
    },
    blockReason: {
        type: String,
        required: false,
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

export default mongoose.model<IRateLimit>("RateLimit", RateLimitSchema); 