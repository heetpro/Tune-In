import type { IArtist } from "@/types";
import mongoose, { Schema } from "mongoose";


const ArtistSchema = new Schema<IArtist>({
    spotifyId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    genres: {
        type: [String],
        required: true,
    },
    popularity: {
        type: Number,
    },
    images: {
        type: Schema.Types.Mixed,
    },
    externalUrl: {
        spotify: {
            type: String,
            required: true,
        },
    },
})

export const Artist = mongoose.model<IArtist>("Artist", ArtistSchema);