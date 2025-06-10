// first defining basic types.

export interface IUser {
    _id: string;
    googleId: string;
    spotifyId: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    bio: string;
    age: number;
    gender: 'male' | 'female' | 'non-binary' | 'other';
    intrestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
    location: {
        city: string;
        country: string;
    };
    isActive: boolean;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
    dailyRolls: {
        date: Date;
        count: number;
    };
    musicProfile: IMusicProfile;
    privacySettings: {
        showAge: boolean;
        showLocation: boolean;
        showLastSeen: boolean;
    };
    notifications: {
        newMessages: boolean;
        newLikes: boolean;
        newMatches: boolean;
    };
    isPremium: boolean;
    isVerified: boolean;
    isBanned: boolean;
    banReason?: string;
    banExpiresAt?: Date;
};


export interface IMusicProfile {
    spotifyConnected: boolean;
    spotifyAccessToken?: string;
    spotifyRefreshToken?: string;
    spotifyTokenExpiresAt?: Date;

    currentlyPlaying?: ICurrentTrack;
    recentTracks: ITrack[];


    topArtists: {
        short_term: IArtist[];
        medium_term: IArtist[];
        long_term: IArtist[];
    }

    topTracks: {
        short_term: ITrack[];
        medium_term: ITrack[];
        long_term: ITrack[];
    };


    topGenres: IGenre[];
    audioFeatures: IAudioFeatures;

    playlists: IPlaylist[];

    compatibilityScore: Map<string, number>;

    lastSyncAt: Date;
}

export interface ITrack {
    spotifyId: string;
    name: string;
    artists: IArtist[];
    album: IAlbum;
    duration: number;
    popularity: number;
    explicit: boolean;
    previewUrl?: string;
    externalUrl: {
        spotify: string;
    };
    audioFeatures?: IAudioFeatures;
    playCount?: number;
    lastPlayedAt?: Date;

}


export interface IArtist {
    spotifyId: string;
    name: string;
    genres: string[];
    popularity: number;
    followers: number;
    images: ISpotifyImage[];
    externalUrl: {
        spotify: string;
    };
}

export interface IAlbum {
    spotifyId: string;
    name: string;
    artists: IArtist[];
    images: ISpotifyImage[];
    releaseDate: Date;
    totalTracks: number;
    popularity: number;
    externalUrl: {
        spotify: string;
    };
}

export interface IPlaylist {
    spotifyId: string;  
    public: boolean;
    name: string;
    description?: string;
    collaborative: boolean;
    owner: {
        spotifyId: string;
        displayName: string;
    };
    tracks: ITrack[];
    images: ISpotifyImage[];
    followerCount: number;
    externalUrl: {
        spotify: string;
    };
}


export interface IAudioFeatures {
    danceability: number;
    energy: number;
    key: number;
    mode: number;
    speechiness: number;
    loudness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    timeSignature: number;
}

