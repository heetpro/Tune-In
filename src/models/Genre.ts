import type { IGenre } from "@/types";
import mongoose, { Schema } from "mongoose";

const GenreSchema = new Schema<IGenre>({
    name: {
        type: String,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
});

export default mongoose.model<IGenre>("Genre", GenreSchema);