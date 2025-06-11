import type { ITrack } from "@/types";
import mongoose, { Schema } from "mongoose";


export const TrackSchema = new Schema<ITrack>({

})

export const Track = mongoose.model<ITrack>("Track", TrackSchema);