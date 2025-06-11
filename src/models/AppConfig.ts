import type { IAppConfig } from "@/types";
import mongoose, { Schema } from "mongoose";

const AppConfigSchema = new Schema<IAppConfig>({
    key: {
        type: String,
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    version: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    updatedBy: {
        type: String,
        required: true,
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

AppConfigSchema.index({
    key: 1,
    isActive: 1,
});

export default mongoose.model<IAppConfig>("AppConfig", AppConfigSchema);    