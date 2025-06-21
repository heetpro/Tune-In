import axios from "axios";
import querystring from 'querystring';
import SpeedcastApi from "speedcast-api";

export class spotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI!;

    console.log('Spotify Service Initialized:');
    console.log(`Client ID: ${this.clientId?.substring(0, 5)}...`);
    console.log(`Redirect URI: ${this.redirectUri}`);
  }

  getAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-library-read',
      'playlist-read-private'
    ].join(' ');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: Math.random().toString(36).substring(7)
    });
    return `https://accounts.spotify.com/authorize?${params}`;
  }


  async getAccessToken(code: string): Promise<any> {
    try {
      // Create form data - this is the correct way to send form-urlencoded data with axios
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

  async getUserTopTracks(accessToken: string, limit = 20): Promise<any> {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Spotify tracks error:', error.response?.data || error.message);
      throw new Error('Failed to get user top tracks from Spotify');
    }
  }
}

