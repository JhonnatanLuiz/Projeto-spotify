// Aplicação principal do Spotify Clone
document.addEventListener('DOMContentLoaded', () => {
    // --- Verificação de Configuração ---
    if (typeof SPOTIFY_CONFIG === 'undefined' || typeof SPOTIFY_URLS === 'undefined') {
        document.body.innerHTML = '<div style="color: white; background-color: #c0392b; padding: 20px; text-align: center; font-size: 1.2em; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;">' +
                                  '<strong>ERRO CRÍTICO:</strong> O arquivo de configuração <code>config.js</code> não foi carregado.' +
                                  '<br>Verifique se o arquivo está em <code>spotify-api-project/config/config.js</code> e se o caminho no HTML está correto.' +
                                  '</div>';
        console.error("ERRO CRÍTICO: SPOTIFY_CONFIG ou SPOTIFY_URLS não está definido.");
        return; // Interrompe a execução
    }

    // --- Instâncias e Estado ---
    const auth = new SpotifyAuth();
    const spotifyAPI = new SpotifyAPI(auth);
    const player = Player(spotifyAPI);
    const ui = UI;
    let currentPlaylist = [];
    let isDemoMode = localStorage.getItem('demo_mode') === 'true'; // Estado do modo demo

    // --- Lógica de Autenticação e UI ---
    function updateUI() {
        ui.updateUIForAuthState(auth.isAuthenticated(), isDemoMode, loadUserProfile, loadFallbackData, loadRealData);
    }

    async function loadUserProfile() {
        const profile = await spotifyAPI.getUserProfile();
        ui.updateUserProfile(profile);
        loadUserPlaylists();
    }

    // --- Carregamento de Dados ---
    async function loadRealData() {
        ui.showLoadingMessage('Carregando suas músicas recentes do Spotify...');
        try {
            const recentlyPlayedData = await spotifyAPI.getRecentlyPlayed();
            if (recentlyPlayedData && recentlyPlayedData.items.length > 0) {
                const tracks = recentlyPlayedData.items.map(item => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map(a => a.name).join(', '),
                    albumArt: item.track.album.images[0]?.url,
                    uri: item.track.uri,
                    audioUrl: item.track.preview_url
                }));
                currentPlaylist = tracks;
                ui.displayTracks(currentPlaylist, isDemoMode, player.playTrack);
            } else {
                // If no recent tracks, load top artists
                loadTopArtists();
            }
        } catch (error) {
            console.error('Erro ao carregar músicas recentes:', error);
            loadTopArtists(); // Fallback to top artists
        }
    }

    async function loadTopArtists() {
        ui.showLoadingMessage('Carregando seus artistas favoritos do Spotify...');
        try {
            const topArtistsData = await spotifyAPI.getTopArtists();
            if (topArtistsData && topArtistsData.items.length > 0) {
                const artists = topArtistsData.items.map(artist => ({
                    id: artist.id,
                    title: artist.name,
                    artist: 'Artista',
                    albumArt: artist.images[0]?.url,
                    uri: artist.uri
                }));
                ui.displayTracks(artists, isDemoMode, player.playTrack);
            } else {
                throw new Error("Nenhum artista encontrado.");
            }
        } catch (error) {
            console.error('Erro ao carregar artistas:', error);
            loadFallbackData('Não foi possível carregar seus artistas favoritos.');
        }
    }

    function loadFallbackData(message = "Usando dados de exemplo.") {
        ui.showErrorMessage(message);
        currentPlaylist = [
            { 
                id: 1, 
                title: "Bohemian Rhapsody", 
                artist: "Queen", 
                albumArt: "https://placehold.co/300x300/1db954/ffffff?text=Queen", 
                audioUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3" 
            },
            { 
                id: 2, 
                title: "Imagine", 
                artist: "John Lennon", 
                albumArt: "https://placehold.co/300x300/ff6b6b/ffffff?text=Lennon", 
                audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3" 
            },
            { 
                id: 3, 
                title: "Billie Jean", 
                artist: "Michael Jackson", 
                albumArt: "https://placehold.co/300x300/4ecdc4/ffffff?text=MJ", 
                audioUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3" 
            },
            { 
                id: 4, 
                title: "Hotel California", 
                artist: "Eagles", 
                albumArt: "https://placehold.co/300x300/45b7d1/ffffff?text=Eagles", 
                audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3" 
            }
        ];
        ui.displayTracks(currentPlaylist, isDemoMode, player.playTrack);
        if (currentPlaylist.length > 0) player.loadTrack(currentPlaylist[0]);
    }

    async function loadUserPlaylists() {
        const playlistsData = await spotifyAPI.getUserPlaylists();
        if (playlistsData && playlistsData.items) {
            const userPlaylists = document.getElementById('user-playlists');
            userPlaylists.innerHTML = '';
            playlistsData.items.forEach(playlist => {
                const playlistElement = document.createElement('a');
                playlistElement.href = '#';
                playlistElement.className = 'list-group-item list-group-item-action bg-transparent border-0 text-white';
                playlistElement.textContent = playlist.name;
                playlistElement.addEventListener('click', async (e) => {
                    e.preventDefault();
                    ui.showLoadingMessage(`Carregando a playlist "${playlist.name}"...`);
                    const tracksData = await spotifyAPI.getPlaylistTracks(playlist.id);
                    const tracks = tracksData.items.filter(item => item.track && (item.track.preview_url || item.track.uri));
                    if (tracks.length > 0) {
                        currentPlaylist = tracks.map(item => ({
                            id: item.track.id,
                            title: item.track.name,
                            artist: item.track.artists.map(a => a.name).join(', '),
                            albumArt: item.track.album.images[0]?.url,
                            uri: item.track.uri,
                            audioUrl: item.track.preview_url
                        }));
                        ui.displayTracks(currentPlaylist, isDemoMode, player.playTrack);
                        if (!isDemoMode && currentPlaylist.length > 0) {
                            player.playTrack(currentPlaylist[0]);
                        }
                    } else {
                        ui.showErrorMessage(`A playlist "${playlist.name}" não contém músicas com preview.`);
                    }
                });
                userPlaylists.appendChild(playlistElement);
            });
        }
    }

    // --- Search ---
    async function handleSearch() {
        const query = document.getElementById('search-input').value;
        if (query) {
            ui.showLoadingMessage(`Buscando por "${query}"...`);
            try {
                const results = await spotifyAPI.search(query);
                displaySearchResults(results);
            } catch (error) {
                console.error('Erro ao buscar:', error);
                ui.showErrorMessage('Não foi possível realizar a busca.');
            }
        }
    }

    function displaySearchResults(results) {
        if (results.tracks.items.length > 0) {
            const tracks = results.tracks.items.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artists.map(a => a.name).join(', '),
                albumArt: item.album.images[0]?.url,
                uri: item.uri,
                audioUrl: item.preview_url
            }));
            currentPlaylist = tracks;
            ui.displayTracks(currentPlaylist, isDemoMode, player.playTrack);
        } else {
            ui.showErrorMessage('Nenhum resultado encontrado.');
        }
    }

    // --- Funções de Modo Demo ---
    function activateDemoMode() {
        console.log("Ativando modo demo...");
        isDemoMode = true;
        localStorage.setItem('demo_mode', 'true');
        updateUI();
    }

    function activateRealMode() {
        console.log("Ativando modo real...");
        isDemoMode = false;
        localStorage.setItem('demo_mode', 'false');
        updateUI();
    }

    // --- Inicialização ---
    function init() {
        console.log("--- Executando a função init() ---");

        if (window.location.hash.includes('access_token')) {
            console.log("Token de acesso encontrado na URL, processando callback...");
            auth.handleCallback();
        }

        console.log("Atualizando a UI para o estado de autenticação...");
        updateUI();

        player.init(auth);

        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            console.log("Botão de login encontrado. Adicionando ouvinte de clique.");
            loginBtn.addEventListener('click', () => {
                console.log("Botão de login CLICADO. Chamando auth.login().");
                auth.login();
            });
            console.log("Ouvinte de clique adicionado ao botão de login.");
        } else {
            console.error("ERRO CRÍTICO: Botão de login com id 'login-btn' NÃO FOI ENCONTRADO no DOM.");
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => auth.logout());
        }

        document.getElementById('home-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (auth.isAuthenticated() && !isDemoMode) {
                loadRealData();
            } else {
                loadFallbackData();
            }
        });

        // Event listeners para alternar entre modo demo e real
        const demoModeBtn = document.getElementById('demo-mode-btn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activateDemoMode();
            });
        }

        const realModeBtn = document.getElementById('real-mode-btn');
        if (realModeBtn) {
            realModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activateRealMode();
            });
        }

        document.getElementById('search-button').addEventListener('click', handleSearch);
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        console.log("--- Função init() concluída ---");
    }

    init();
});
