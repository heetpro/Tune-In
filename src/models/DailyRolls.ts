import type { IDailyRolls } from "@/types";
import mongoose, { Schema } from "mongoose";

const DailyRollsSchema = new Schema<IDailyRolls>({
    userId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    rollsUsed: {
        type: Number,
        required: true,
    },
    maxRolls: {
        type: Number,
        required: true,
    },
    usersShown: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<IDailyRolls>("DailyRolls", DailyRollsSchema); 