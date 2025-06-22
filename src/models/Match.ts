import type { IMatch } from "@/types";
import mongoose, { Schema } from "mongoose";

const MatchSchema = new Schema<IMatch>({
    user1Id: {
        type: String,
        required: true,
    },
    user2Id: {
        type: String,
        required: true,
    },
    matchScore: {
        type: Number,
        required: true,
    },
    musicCompatibility: {
        type: Schema.Types.Mixed,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    initiatedBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<IMatch>("Match", MatchSchema);