import type { IUser } from "@/types";
import mongoose, { Schema, model } from "mongoose";


export const UserSchema = new Schema<IUser>({

    spotifyId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'],
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
        coordinates: {
            type: Object,
        },
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
    // Friend system fields
    friends: {
        id: {
            type: [String],
            default: []
        }
    },
    friendRequests: {
        incoming: {
            id: {
                type: [String],
                default: []
            }
            
        },
        outgoing: {
            id: {
                type: [String],
                default: []
            }
        },
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
            newFriendRequests: true,
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
    isAdmin: {
        type: Boolean,
        default: false,
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false,
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




