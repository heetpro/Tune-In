import type { IMusicProfile, IAudioFeatures } from "@/types";
import mongoose, { Schema } from "mongoose";

// Create schemas for embedded documents
const SpotifyImageSchema = new Schema({
    url: String,
    height: Number,
    width: Number
}, { _id: false });

const ArtistSchema = new Schema({
    spotifyId: String,
    name: String,
    genres: [String],
    popularity: Number,
    images: [SpotifyImageSchema],
    externalUrl: {
        spotify: String
    }
}, { _id: false });

const AlbumSchema = new Schema({
    spotifyId: String,
    albumType: String,
    genres: [String],
    name: String,   
    artists: [ArtistSchema],
    images: [SpotifyImageSchema],
    releaseDate: Date,
    totalTracks: Number,
    externalUrl: {
        spotify: String
    }
}, { _id: false });

const TrackSchema = new Schema({
    spotifyId: String,
    name: String,
    artists: [ArtistSchema],
    album: AlbumSchema,
    duration: Number,
    popularity: Number,
    explicit: Boolean,
    previewUrl: String,
    externalUrl: {
        spotify: String
    },
    audioFeatures: {
        type: Map,
        of: Number
    },
    href: String
}, { _id: false });

const CurrentTrackSchema = new Schema({
    ...TrackSchema.obj,
    isPlaying: Boolean,
    progressMs: Number,
    timestamp: Date
}, { _id: false });

const RecentlyPlayedTrackSchema = new Schema({
    track: TrackSchema,
    playedAt: String,
    context: {
        type: {
            type: String,
            enum: ['album', 'artist', 'playlist', 'show']
        },
        href: String,
        externalUrls: {
            spotify: String
        },
        uri: String
    }
}, { _id: false });

const PlaylistSchema = new Schema({
    spotifyId: String,
    public: Boolean,
    name: String,
    description: String,
    collaborative: Boolean,
    owner: {
        spotifyId: String,
        displayName: String
    },
    images: [SpotifyImageSchema],
    externalUrl: {
        spotify: String
    }
}, { _id: false });

const GenreSchema = new Schema({
    name: String,
    weight: Number
}, { _id: false });

const AudioFeaturesSchema = new Schema({
    danceability: Number,
    energy: Number,
    key: Number,
    mode: Number,
    speechiness: Number,
    acousticness: Number,
    instrumentalness: Number,
    liveness: Number,
    valence: Number,
    tempo: Number,
    duration: Number,
    timeSignature: Number,
    loudness: Number
}, { _id: false });

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
        type: CurrentTrackSchema,
        required: false
    },
    recentTracks: [TrackSchema],
    recentlyPlayed: [RecentlyPlayedTrackSchema],
    topArtists: {
        short_term: [ArtistSchema],
        medium_term: [ArtistSchema],
        long_term: [ArtistSchema]
    },
    topTracks: {
        short_term: [TrackSchema],
        medium_term: [TrackSchema],
        long_term: [TrackSchema]
    },
    topGenres: [GenreSchema],
    audioFeatures: {
        type: AudioFeaturesSchema,
        default: {}
    },
    playlists: [PlaylistSchema],
    compatibilityScore: {
        type: Map,
        of: Number
    },
    lastSyncAt: {
        type: Date,
        default: Date.now,
    },
});

export const MusicProfile = mongoose.model<IMusicProfile>("MusicProfile", MusicProfileSchema);