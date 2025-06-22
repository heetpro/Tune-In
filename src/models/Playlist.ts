import type { IPlaylist } from "@/types";
import mongoose, { Schema } from "mongoose";



const PlaylistSchema = new Schema<IPlaylist>({
    spotifyId: {
        type: String,
        required: true,
    },
    public: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    collaborative: {
        type: Boolean,
        required: true,
    },
    owner: {
        spotifyId: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
    },
    images: {
        type: Schema.Types.Mixed,
        ref: "SpotifyImage",
    },
    externalUrl: {
        spotify: {
            type: String,
            required: true,
        },
    },
})

export const Playlist = mongoose.model<IPlaylist>("Playlist", PlaylistSchema);