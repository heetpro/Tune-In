import type { IMatchCompatibility } from "@/types";
import mongoose, { Schema } from "mongoose";

const MatchCompatibilitySchema = new Schema<IMatchCompatibility>({
    overallScore: {
        type: Number,
        required: true,
    },
    artistMatch: {
        type: Number,
        required: true,
    },
    genreMatch: {
        type: Number,
        required: true,
    },
    audioFeaturesMatch: {
        type: Number,
        required: true,
    },
    playlistSimilarity: {
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
    sharedTracks: {
        type: [String],
        required: true,
    },
    reasons: {
        type: [String],
        required: true,
    },
});

MatchCompatibilitySchema.index({
    overallScore: 1,
    artistMatch: 1,
    genreMatch: 1,
    audioFeaturesMatch: 1,
    playlistSimilarity: 1,
    sharedArtists: 1,
    sharedGenres: 1,
    sharedTracks: 1,
    reasons: 1,
});

export default mongoose.model<IMatchCompatibility>("MatchCompatibility", MatchCompatibilitySchema); 