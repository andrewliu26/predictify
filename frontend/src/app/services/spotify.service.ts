import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private recentlyPlayedUrl = 'https://api.spotify.com/v1/me/player/recently-played';
  private savedTracksUrl = 'https://api.spotify.com/v1/me/tracks';  // Correct API endpoint for saved tracks

  async getRecentlyPlayed(token: string): Promise<any> {
    try {
      const response = await axios.get(this.recentlyPlayedUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      throw error;
    }
  }

  async getSavedTracks(token: string): Promise<any> {
    try {
      const response = await axios.get(this.savedTracksUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Saved Tracks Response:', response.data); // Log the entire response for debugging
      return response.data.items;  // Return the 'items' array
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
      throw error;
    }
  }
}
