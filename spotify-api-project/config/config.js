// Configuração da API do Spotify
const SPOTIFY_CONFIG = {
    CLIENT_ID: 'ec8f1fadc6924058a977b84e6d2bf776',
    CLIENT_SECRET: 'f417409093fc4ae4b7805573eb9f8230',
    REDIRECT_URI: 'http://127.0.0.1:3000/callback.html', // URI de redirecionamento CORRETO
    SCOPES: [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-recently-played',
        'user-top-read',
        'streaming'
    ].join(' ')
};

// URLs da API do Spotify
const SPOTIFY_URLS = {
    AUTHORIZE: 'https://accounts.spotify.com/authorize',
    TOKEN: 'https://accounts.spotify.com/api/token',
    API_BASE: 'https://api.spotify.com/v1'
};
