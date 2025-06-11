import type { ICurrentTrack } from "@/types";
import mongoose, { Schema } from "mongoose";

const CurrentTrackSchema = new Schema<ICurrentTrack>({
    spotifyId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    artists: {
        type: [String],
        required: true,
    },
    album: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    popularity: {
        type: Number,
        required: true,
    },
    explicit: {
        type: Boolean,
        required: true,
    },
    previewUrl: {
        type: String,
        required: true,
    },
    externalUrl: {
        type: String,
        required: true,
    },
    isPlaying: {
        type: Boolean,
        required: true,
    },
    progressMs: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },

});
export default mongoose.model<ICurrentTrack>("CurrentTrack", CurrentTrackSchema);