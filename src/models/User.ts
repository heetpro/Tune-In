import type { IUser } from "@/types";
import mongoose, { Schema , model} from "mongoose";


export const UserSchema = new Schema<IUser>({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    spotifyId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
    },
    profilePicture: {
        type: String,
    },
    bio: {
        type: String,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'other'],
    },
    intrestedIn: {
        type: [String],
    },
    location: {
        city: {
            type: String,
        },
        country: {
            type: String,
        },
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
    },
    dailyRolls: {
        date: {
            type: Date,
            default: Date.now,
        },
        count: {
            type: Number,
        },
    },
    musicProfile: {
        type: Schema.Types.ObjectId,
        ref: "MusicProfile",
    },
    privacySettings: {
        type: Object,
        default: {
            showAge: true,
            showLocation: true,
            showLastSeen: true,
        },
    },
    notifications: {
        type: Object,
        default: {
            newMessages: true,
            newLikes: true,
            newMatches: true,
        },
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
    },
    banExpiresAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

export const User = mongoose.model<IUser>("User", UserSchema);




