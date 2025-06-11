import type { IMusicProfile } from "@/types";
import mongoose, { Schema } from "mongoose";


export const MusicProfileSchema = new Schema<IMusicProfile>({
    spotifyConnected: {
        type: Boolean,
        default: false,
    },
    spotifyAccessToken: {
        type: String,
        required: false,
    },
    spotifyRefreshToken: {
        type: String,
        required: false,
    },
    spotifyTokenExpiresAt: {
        type: Date,
        required: false,
    },
    currentlyPlaying: {
        type: Schema.Types.ObjectId,
        ref: "Track",
    },
    recentTracks: [{
        type: Schema.Types.Mixed,
        ref: "Track",
    }],
    topArtists: [{
        type: Schema.Types.ObjectId,
        ref: "Artist",
    }],
    topTracks: [{
        type: Schema.Types.ObjectId,
        ref: "Track",
    }],
    topGenres: [{
        type: Schema.Types.ObjectId,
        ref: "Genre",
    }],
    audioFeatures: {
        type: Schema.Types.ObjectId,
        ref: "AudioFeatures",
    },
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: "Playlist",
    }],
    compatibilityScore: {
        type: Map,
    },
    lastSyncAt: {
        type: Date,
        default: Date.now,
    },
})

export const MusicProfile = mongoose.model<IMusicProfile>("MusicProfile", MusicProfileSchema);