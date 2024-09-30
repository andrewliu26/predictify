import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private spotifyAuthUrl = 'https://accounts.spotify.com/authorize';

  authenticateSpotify() {
    const scope = 'user-read-recently-played';
    window.location.href = `${this.spotifyAuthUrl}?client_id=${environment.spotifyClientId}&redirect_uri=${environment.spotifyRedirectUri}&scope=${scope}&response_type=token`;
  }

  getAccessTokenFromUrl(): string | null {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      return params.get('access_token');
    }
    return null;
  }
}
