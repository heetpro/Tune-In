import type { ISpotifyImage } from "@/types";
import mongoose, { Schema } from "mongoose";

const SpotifyImageSchema = new Schema<ISpotifyImage>({
    url: {
        type: String,
        required: true,
    },
    height: {
        type: Number,
        required: false,
    },
    width: {
        type: Number,
        required: false,
    },
});

export default mongoose.model<ISpotifyImage>("SpotifyImage", SpotifyImageSchema);   