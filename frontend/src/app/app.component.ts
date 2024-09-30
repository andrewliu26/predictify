import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SpotifyService } from './services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Spotify Listening History';
  token: string | null = null;
  history: any[] = [];
  saved: any[] = [];   // Array for saved tracks

  constructor(private authService: AuthService, private spotifyService: SpotifyService) {}

  ngOnInit(): void {
    // Get the token from the URL if available
    this.token = this.authService.getAccessTokenFromUrl();

    // If the token is not in the URL, check localStorage
    if (!this.token) {
      this.token = localStorage.getItem('spotify_access_token');
    }

    // Only proceed to load data if a valid token is available
    if (this.token) {
      localStorage.setItem('spotify_access_token', this.token);  // Store the token again
      this.loadRecentlyPlayed();
      this.loadSavedTracks();
    } else {
      console.log('No token found, user needs to log in.');
    }
  }

  loginWithSpotify(): void {
    this.authService.authenticateSpotify();
  }

  logoutFromSpotify(): void {
    localStorage.removeItem('spotify_access_token');  // Remove token from localStorage
    this.token = null;  // Set the in-memory token to null
    console.log('User logged out');

    // Clear the URL hash and reload the page after token removal to prevent automatic login
    window.location.href = window.location.origin;  // This ensures the app reloads without the access token in the URL
  }


  async loadRecentlyPlayed(): Promise<void> {
    if (this.token) {
      try {
        this.history = await this.spotifyService.getRecentlyPlayed(this.token);
        console.log('Recently Played:', this.history);
      } catch (error) {
        console.error('Error loading recently played tracks:', error);
      }
    }
  }

  async loadSavedTracks(): Promise<void> {
    if (this.token) {
      try {
        this.saved = await this.spotifyService.getSavedTracks(this.token);  // Save the response to 'saved'
        console.log('Saved Tracks:', this.saved);  // Log the saved tracks
      } catch (error) {
        console.error('Error loading saved tracks:', error);
      }
    }
  }

  getArtistNames(artists: any[]): string {
    return artists.map(artist => artist.name).join(', ');
  }
}
