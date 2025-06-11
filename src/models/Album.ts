import type { IAlbum } from "@/types";
import mongoose, { Schema } from "mongoose"


const AlbumSchema = new Schema<IAlbum>({
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
    images: {
        type: Schema.Types.Mixed,
        ref: "SpotifyImage",
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    totalTracks: {
        type: Number,
        required: true,
    },
    popularity: {
        type: Number,
    },
    externalUrl: {
        spotify: {
            type: String,
            required: true,
        },
    },
})

export const Album = mongoose.model<IAlbum>("Album", AlbumSchema);