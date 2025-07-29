// API do Spotify - Gerenciamento de chamadas para a API
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

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401) {
                console.error('Token de acesso expirado ou inválido.');
                this.auth.logout();
                throw new Error('Token expirado. Faça login novamente.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na API do Spotify:', errorData);
                throw new Error(`Erro na API: ${response.status} - ${errorData.error.message}`);
            }
            
            if (response.status === 204) {
                return {};
            }

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

    async play(deviceId, spotifyUri) {
        const endpoint = `/me/player/play?device_id=${deviceId}`;
        const options = {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotifyUri] }),
        };
        return this.makeRequest(endpoint, options);
    }

    async search(query, types = ['track', 'artist', 'album'], limit = 20) {
        const type = types.join(',');
        const endpoint = `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
        return this.makeRequest(endpoint);
    }
}
