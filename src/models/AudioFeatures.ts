import type { IAudioFeatures } from "@/types";
import mongoose, { Schema } from "mongoose";


const AudioFeaturesSchema = new Schema<IAudioFeatures>({
    danceability: {
        type: Number,
        required: true,
    },
    energy: {
        type: Number,
        required: true,
    },
    key: {
        type: Number,
        required: true,
    },
    mode: {
        type: Number,
        required: true,
    },
    speechiness: {
        type: Number,
        required: true,
    },
    loudness: {
        type: Number,
        required: true,
    },
    acousticness: {
        type: Number,
        required: true,
    },
    instrumentalness: {
        type: Number,
        required: true,
    },
    liveness: {
        type: Number,
        required: true,
    },
    valence: {
        type: Number,
        required: true,
    },
    tempo: {
        type: Number,
        required: true,
    },
    timeSignature: {
        type: Number,
        required: true,
    },
})

export const AudioFeatures = mongoose.model<IAudioFeatures>("AudioFeatures", AudioFeaturesSchema);