import type { ISharedTrack } from "@/types";
import mongoose, { Schema } from "mongoose";

const SharedTrackSchema = new Schema<ISharedTrack>({
    userId: {
        type: String,
        required: true,
    },
    tragetedUserId: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    context: {
        musicScore: {
            type: Number,
            required: true,
        },
        sharedArtists: {
            type: [String],
            required: true,
        },
        sharedGenres: {
            type: [String],
            required: true,
        },
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<ISharedTrack>("SharedTrack", SharedTrackSchema);