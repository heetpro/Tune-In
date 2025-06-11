import type { ISession } from "@/types";
import mongoose, { Schema } from "mongoose";

const SessionSchema = new Schema<ISession>({
    sessionToken: {
        type: String,
        required: true,
        unique: true,
    },
    deviceInfo: {
        userAgent: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: false,
        },
        browser: {
            type: String,
            required: false,
        },
    },
    location: {
        city: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        coordinates: {
            lat: {
                type: Number,
                required: false,
            },
            lng: {
                type: Number,
                required: false,
            },
        },
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    lastActivity: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<ISession>("Session", SessionSchema);  