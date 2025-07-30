import { SPOTIFY_URLS } from './config';

class SpotifyAPI {
    constructor(auth) {
        if (!auth || typeof auth.getAccessToken !== 'function') {
            throw new Error('Uma instância de SpotifyAuth é necessária.');
        }
        this.auth = auth;
        this.baseUrl = SPOTIFY_URLS.API_BASE;
    }

    async makeRequest(endpoint, options = {}) {
        const token = this.auth.getAccessToken();

        if (!token) {
            console.warn('Token de acesso não encontrado. Faça login primeiro.');
            return null;
        }

        const url = `http://localhost:3001/api${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    }

    async getUserProfile() {
        return this.makeRequest('/me');
    }

    async getFeaturedPlaylists(limit = 20) {
        return this.makeRequest(`/browse/featured-playlists?limit=${limit}`);
    }

    async getPlaylistTracks(playlistId, limit = 50) {
        return this.makeRequest(`/playlists/${playlistId}/tracks?limit=${limit}`);
    }

    async search(query, types = ['track', 'artist', 'album'], limit = 20) {
        const type = types.join(',');
        const endpoint = `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
        return this.makeRequest(endpoint);
    }

    async getUserPlaylists(limit = 50) {
        return this.makeRequest(`/me/playlists?limit=${limit}`);
    }

    async getTopArtists(limit = 20) {
        return this.makeRequest(`/me/top/artists?limit=${limit}`);
    }

    async getRecentlyPlayed(limit = 50) {
        return this.makeRequest(`/me/player/recently-played?limit=${limit}`);
    }

    async play(deviceId, spotifyUri) {
        const endpoint = `/me/player/play?device_id=${deviceId}`;
        const options = {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotifyUri] }),
        };
        return this.makeRequest(endpoint, options);
    }
}

export default SpotifyAPI;
