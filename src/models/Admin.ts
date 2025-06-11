import type { IAdmin } from "@/types";
import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema<IAdmin>({
    userId: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'moderator'],
    },
    permissions: {
        type: [String],
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});


export default mongoose.model<IAdmin>("Admin", AdminSchema); 