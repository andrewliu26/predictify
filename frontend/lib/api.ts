import { Song, SongResponse, APIError } from './types';

const BASE_URL = '/api/songs';

export async function searchSongs(query: string): Promise<SongResponse> {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
    console.log('🔍 Sending search request to:', url);

    try {
        const response = await fetch(url);
        console.log('📨 Search response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Search error response:', error);
            throw new Error(error.detail || 'Failed to fetch songs');
        }

        const data = await response.json();
        console.log('✅ Search results:', { total: data.songs?.length || 0 });
        return data;
    } catch (error) {
        console.error('🚨 Search request failed:', error);
        throw error;
    }
}

export async function getRecommendations(trackId: string) {
    const url = `/api/songs/recommendations/${trackId}`;
    try {
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            const error = await response.json().catch(() => ({})); // Safely handle non-JSON error responses
            console.error('❌ Recommendations error response:', error);

            // Throwing structured error
            throw new Error(
                error.detail ||
                (response.status === 404 ? 'Recommendations not found' : 'Failed to fetch recommendations')
            );
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Network or fetch error:', error);
        throw error;
    }
}

export async function getSong(trackId: string): Promise<Song> {
    const url = `${BASE_URL}/${trackId}`;
    console.log('🔍 Fetching song from:', url);

    try {
        const response = await fetch(url);
        console.log('📨 Song response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Song error response:', error);
            throw new Error(error.detail || 'Failed to fetch song');
        }

        const data = await response.json();
        console.log('✅ Song data received:', { trackId: data.track_id });
        return data;
    } catch (error) {
        console.error('🚨 Song request failed:', error);
        throw error;
    }
}