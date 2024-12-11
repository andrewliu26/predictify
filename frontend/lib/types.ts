// lib/types.ts

export interface AudioFeatures {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
}

export interface Song {
    track_id: string;
    track_name: string;
    artists: string;
    album_name: string;
    track_genre: string;
    popularity: number;
    duration_ms: number;
    explicit: boolean;
    // Original direct features
    danceability?: number;
    energy?: number;
    valence?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    // New audio_features object from recommendations
    audio_features?: AudioFeatures;
    // Additional features
    key?: number;
    loudness?: number;
    mode?: number;
    speechiness?: number;
    tempo?: number;
    time_signature?: number;
}

export interface SongResponse {
    songs: Song[];
    total: number;
}

export interface APIError {
    error: string;
    details?: string;
}