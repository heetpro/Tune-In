import type { IArtist, ITrack } from "@/types";
import axios from "axios";
import querystring from 'querystring';
import SpeedcastApi from "speedcast-api";

export class spotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl = 'https://api.spotify.com/v1';

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI!;

    // console.log('Spotify Service Initialized:');
    // console.log(`Client ID: ${this.clientId?.substring(0, 5)}...`);
    // console.log(`Redirect URI: ${this.redirectUri}`);
  }

  getAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-library-read',
      'playlist-read-private',
      'user-read-currently-playing',
      'user-read-playback-state'
    ].join(' ');


    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
    });

    return `https://accounts.spotify.com/authorize?${params}`;
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const response = await axios.post('https://accounts.spotify.com/api/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    
    return response.data;
  }


  async getAccessToken(code: string): Promise<any> {
    try {
      const formData = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const response = await axios.post('https://accounts.spotify.com/api/token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Spotify token error:', error.response?.data || error.message);
      throw new Error('Failed to get access token from Spotify');
    }
  }

  private async makeSpotifyRequest(endpoint: string, accessToken: string, params?: any) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('SPOTIFY_TOKEN_EXPIRED');
      }
      throw error;
    }
  }


  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Spotify profile error:', error.response?.data || error.message);
      throw new Error('Failed to get user profile from Spotify');
    }
  }

  async getTopTracks(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<ITrack[]> {
    const data = await this.makeSpotifyRequest('/me/top/tracks', accessToken, {
      time_range: timeRange,
      limit,
    });

    return data.items.map((track: any) => this.formatTrack(track));
  }

  // Get user's saved tracks (liked songs)
  async getLikedTracks(accessToken: string, limit: number = 50, offset: number = 0): Promise<ITrack[]> {
    const data = await this.makeSpotifyRequest('/me/tracks', accessToken, {
      limit,
      offset,
    });

    return data.items.map((item: any) => this.formatTrack(item.track));
  }


  async getTopArtists(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<IArtist[]> {
    const data = await this.makeSpotifyRequest('/me/top/artists', accessToken, {
      time_range: timeRange,
      limit,
    });

    return data.items.map((artist: any) => ({
      spotifyId: artist.id,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      images: artist.images,
      externalUrl: {
        spotify: artist.external_urls.spotify,
      },
    }));
  }

  private formatTrack(track: any): ITrack {
    return {
      spotifyId: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => ({
        spotifyId: artist.id,
        name: artist.name,
        genres: [],
        popularity: 0,
        images: [],
        externalUrl: {
          spotify: artist.external_urls.spotify,
        },
      })),
      album: {
        spotifyId: track.album.id,
        albumType: track.album.album_type,
        genres: [],
        name: track.album.name,
        artists: track.album.artists.map((artist: any) => ({
          spotifyId: artist.id,
          name: artist.name,
          genres: [],
          popularity: 0,
          images: [],
          externalUrl: {
            spotify: artist.external_urls.spotify,
          },
        })),
        images: track.album.images,
        releaseDate: new Date(track.album.release_date),
        totalTracks: track.album.total_tracks,
        externalUrl: {
          spotify: track.album.external_urls.spotify,
        },
      },
      duration: track.duration_ms,
      popularity: track.popularity,
      explicit: track.explicit,
      previewUrl: track.preview_url,
      externalUrl: {
        spotify: track.external_urls.spotify,
      },
      href: track.href,
    };
  }


}

