import type { ICacheEntry } from "@/types";
import mongoose, { Schema } from "mongoose";

const CacheSchema = new Schema<ICacheEntry>({
    key: {
        type: Schema.Types.Mixed,
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: false,
    },
    tags: {
        type: [String],
        required: false,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    accessCount: {
        type: Number,
        required: true,
    },
    lastAccessedAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<ICacheEntry>("Cache", CacheSchema); 