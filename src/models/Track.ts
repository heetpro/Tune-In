import type { ITrack } from "@/types";
import mongoose, { Schema } from "mongoose";


export const TrackSchema = new Schema<ITrack>({
    spotifyId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    artists: {
        type: Schema.Types.Mixed,
        required: true,
        ref: "Artist",
    },
    album: {
        type: Schema.Types.Mixed,
        ref: "Album",
    },
    duration: {
        type: Number,
        required: true,
    },
    popularity: {
        type: Number,
    },
    previewUrl: {
        type: String,
        required: false,
    },
    externalUrl: {
        spotify: {
            type: String,
            required: true,
        },
    },
    audioFeatures: {
        type: Schema.Types.Mixed,
    },

})

export const Track = mongoose.model<ITrack>("Track", TrackSchema);