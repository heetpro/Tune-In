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


