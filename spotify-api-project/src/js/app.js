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

    // --- Seletores ---
    const mainContentArea = document.getElementById('main-content-area');
    const loginBtn = document.getElementById('login-btn');
    const userProfileContainer = document.getElementById('user-profile');
    const userNameSpan = document.getElementById('user-name');
    const userAvatar = document.querySelector('#user-profile img');
    const logoutBtn = document.getElementById('logout-btn');
    const demoModeBtn = document.getElementById('demo-mode-btn');
    const realModeBtn = document.getElementById('real-mode-btn');
    
    // Player
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const currentTimeElement = document.getElementById('current-time');
    const totalDurationElement = document.getElementById('total-duration');
    const currentTrackImage = document.getElementById('current-track-image');
    const currentTrackName = document.getElementById('current-track-name');
    const currentTrackArtist = document.getElementById('current-track-artist');

    // --- Instâncias e Estado ---
    const auth = new SpotifyAuth();
    const spotifyAPI = new SpotifyAPI(auth);
    let currentPlaylist = [];
    let currentTrackIndex = 0;
    let isDemoMode = localStorage.getItem('demo_mode') === 'true'; // Estado do modo demo

    // --- Lógica de Autenticação e UI ---
    function updateUIForAuthState() {
        if (auth.isAuthenticated()) {
            loginBtn.style.display = 'none';
            userProfileContainer.style.display = 'block';
            loadUserProfile();
            
            // Controla a visibilidade dos botões de modo
            if (isDemoMode) {
                demoModeBtn.style.display = 'none';
                realModeBtn.style.display = 'block';
                loadFallbackData("Modo Demo Ativado - Usando dados fictícios");
            } else {
                demoModeBtn.style.display = 'block';
                realModeBtn.style.display = 'none';
                loadRealData();
            }
        } else {
            loginBtn.style.display = 'block';
            userProfileContainer.style.display = 'none';
            demoModeBtn.style.display = 'none';
            realModeBtn.style.display = 'none';
            loadFallbackData();
        }
    }

    async function loadUserProfile() {
        const profile = await spotifyAPI.getUserProfile();
        if (profile) {
            userNameSpan.textContent = profile.display_name || 'Usuário';
            const avatar = profile.images?.[0]?.url;
            if (avatar) userAvatar.src = avatar;
        }
    }

    // --- Carregamento de Dados ---
    async function loadRealData() {
        showLoadingMessage('Carregando suas músicas recentes...');
        try {
            // Carrega recently played tracks
            const recentlyPlayedData = await spotifyAPI.getRecentlyPlayed(20);
            
            if (recentlyPlayedData && recentlyPlayedData.items && recentlyPlayedData.items.length > 0) {
                const tracks = recentlyPlayedData.items
                    .filter(item => item.track && item.track.preview_url)
                    .map(item => ({
                        id: item.track.id,
                        title: item.track.name,
                        artist: item.track.artists.map(a => a.name).join(', '),
                        albumArt: item.track.album.images[0]?.url,
                        audioUrl: item.track.preview_url,
                        playedAt: item.played_at
                    }));

                if (tracks.length > 0) {
                    currentPlaylist = tracks;
                    displayTracks('Músicas Tocadas Recentemente');
                    loadTrack(currentPlaylist[0]);
                    loadUserPlaylists(); // Carrega playlists na sidebar
                    return;
                }
            }

            // Fallback: se não há recently played, carrega top tracks
            const topTracksData = await spotifyAPI.getTopTracks(20);
            if (topTracksData && topTracksData.items && topTracksData.items.length > 0) {
                const tracks = topTracksData.items
                    .filter(track => track.preview_url)
                    .map(track => ({
                        id: track.id,
                        title: track.name,
                        artist: track.artists.map(a => a.name).join(', '),
                        albumArt: track.album.images[0]?.url,
                        audioUrl: track.preview_url
                    }));

                if (tracks.length > 0) {
                    currentPlaylist = tracks;
                    displayTracks('Suas Músicas Mais Tocadas');
                    loadTrack(currentPlaylist[0]);
                    loadUserPlaylists();
                    return;
                }
            }

            // Se nenhum dos acima funcionou, usa fallback
            loadFallbackData("Nenhuma música com preview encontrada em seu histórico.");
        } catch (error) {
            console.error('Erro ao carregar dados reais:', error);
            loadFallbackData('Não foi possível carregar os dados do Spotify.');
        }
    }

    async function loadUserPlaylists() {
        try {
            const playlistsData = await spotifyAPI.getUserPlaylists(20);
            const userPlaylistsContainer = document.getElementById('user-playlists');
            
            if (playlistsData && playlistsData.items) {
                userPlaylistsContainer.innerHTML = '';
                
                playlistsData.items.forEach(playlist => {
                    const playlistElement = document.createElement('div');
                    playlistElement.className = 'playlist-item p-2 mb-1 rounded';
                    playlistElement.style.cursor = 'pointer';
                    playlistElement.innerHTML = `
                        <div class="d-flex align-items-center">
                            <img src="${playlist.images?.[0]?.url || 'https://placehold.co/40x40/1DB954/121212?text=P'}" 
                                 alt="${playlist.name}" class="rounded me-2" style="width: 40px; height: 40px;">
                            <div>
                                <div class="text-white small fw-bold">${playlist.name}</div>
                                <div class="text-muted" style="font-size: 0.75rem;">${playlist.tracks.total} músicas</div>
                            </div>
                        </div>
                    `;
                    
                    playlistElement.addEventListener('click', () => loadPlaylistTracks(playlist));
                    userPlaylistsContainer.appendChild(playlistElement);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar playlists do usuário:', error);
        }
    }

    async function loadPlaylistTracks(playlist) {
        showLoadingMessage(`Carregando "${playlist.name}"...`);
        
        try {
            const tracksData = await spotifyAPI.getPlaylistTracks(playlist.id, 50);
            const tracks = tracksData.items
                .filter(item => item.track && item.track.preview_url)
                .map(item => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map(a => a.name).join(', '),
                    albumArt: item.track.album.images[0]?.url,
                    audioUrl: item.track.preview_url
                }));

            if (tracks.length > 0) {
                currentPlaylist = tracks;
                displayTracks(playlist.name);
                loadTrack(currentPlaylist[0]);
            } else {
                showErrorMessage(`Nenhuma música com preview encontrada na playlist "${playlist.name}".`);
            }
        } catch (error) {
            console.error('Erro ao carregar tracks da playlist:', error);
            showErrorMessage(`Erro ao carregar a playlist "${playlist.name}".`);
        }
    }

    async function loadTopArtists() {
        showLoadingMessage('Carregando seus artistas favoritos...');
        
        try {
            const topArtistsData = await spotifyAPI.getTopArtists(20);
            
            if (topArtistsData && topArtistsData.items && topArtistsData.items.length > 0) {
                displayTopArtists(topArtistsData.items);
            } else {
                showErrorMessage('Nenhum artista favorito encontrado.');
            }
        } catch (error) {
            console.error('Erro ao carregar top artists:', error);
            if (error.message.includes('401') || error.message.includes('403')) {
                showErrorMessage('Esta funcionalidade requer permissões especiais do Spotify.');
            } else {
                showErrorMessage('Erro ao carregar seus artistas favoritos.');
            }
        }
    }

    function displayTopArtists(artists) {
        mainContentArea.innerHTML = '';
        
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <h2 class="text-white">Seus Artistas Favoritos</h2>
                </div>
            </div>
            <div class="row" id="artists-container"></div>
        `;
        
        const artistsContainer = container.querySelector('#artists-container');
        
        artists.forEach(artist => {
            const artistCard = createArtistCard(artist);
            artistsContainer.appendChild(artistCard);
        });
        
        mainContentArea.appendChild(container);
    }

    function createArtistCard(artist) {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-3 col-sm-4 col-6 mb-4';
        
        const artistImage = artist.images?.[0]?.url || 'https://placehold.co/300x300/1DB954/ffffff?text=Artist';
        
        cardCol.innerHTML = `
            <div class="content-card text-decoration-none h-100">
                <div style="position:relative;">
                    <img src="${artistImage}" alt="${artist.name}" class="card-img-top rounded-circle" style="aspect-ratio: 1; object-fit: cover;">
                    <button class="play-button-overlay" data-artist-id="${artist.id}"><i class="fas fa-play"></i></button>
                </div>
                <div class="card-body p-2 mt-2 text-center">
                    <h5 class="card-title text-white">${artist.name}</h5>
                    <p class="card-subtitle">${artist.followers?.total?.toLocaleString() || ''} seguidores</p>
                    <p class="card-text small text-muted">${artist.genres?.slice(0, 2).join(', ') || ''}</p>
                </div>
            </div>
        `;

        // Event listener para tocar músicas do artista (busca)
        cardCol.querySelector('.play-button-overlay').addEventListener('click', () => {
            searchAndPlayArtist(artist.name);
        });

        return cardCol;
    }

    async function searchAndPlayArtist(artistName) {
        try {
            const searchResults = await spotifyAPI.searchTracks(`artist:${artistName}`, 10);
            
            if (searchResults && searchResults.tracks && searchResults.tracks.items.length > 0) {
                const tracks = searchResults.tracks.items
                    .filter(track => track.preview_url)
                    .map(track => ({
                        id: track.id,
                        title: track.name,
                        artist: track.artists.map(a => a.name).join(', '),
                        albumArt: track.album.images[0]?.url,
                        audioUrl: track.preview_url
                    }));

                if (tracks.length > 0) {
                    currentPlaylist = tracks;
                    displayTracks(`Músicas de ${artistName}`);
                    loadTrack(currentPlaylist[0]);
                    playTrack();
                } else {
                    alert(`Nenhuma música com preview encontrada para ${artistName}.`);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar músicas do artista:', error);
            alert(`Erro ao carregar músicas de ${artistName}.`);
        }
    }

    function loadFallbackData(message = "Usando dados de exemplo.") {
        showErrorMessage(message);
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
        displayTracks('Músicas Demo');
        if (currentPlaylist.length > 0) loadTrack(currentPlaylist[0]);
    }

    // --- Renderização ---
    function showLoadingMessage(message) {
        mainContentArea.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white ms-3">${message}</p>
            </div>
        `;
    }

    function showErrorMessage(message) {
        // Mostra a mensagem de acordo com o contexto
        let alertClass = 'alert-warning';
        let icon = 'fas fa-exclamation-triangle';
        
        if (message.includes("Modo Demo")) {
            alertClass = 'alert-info';
            icon = 'fas fa-code';
        }
        
        mainContentArea.innerHTML = `
            <div class="alert ${alertClass} d-flex align-items-center">
                <i class="${icon} me-2"></i>
                <span>${message}</span>
            </div>`;
    }

    function displayTracks(title = '') {
        const container = document.createElement('div');
        container.className = 'row';
        
        // Adiciona título se fornecido
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'col-12 mb-4';
            titleElement.innerHTML = `<h2 class="text-white">${title}</h2>`;
            container.appendChild(titleElement);
        }
        
        // Adiciona os cards das músicas em uma nova row
        const tracksRow = document.createElement('div');
        tracksRow.className = 'row';
        currentPlaylist.forEach(item => tracksRow.appendChild(createContentCard(item)));
        container.appendChild(tracksRow);
        
        // Limpa a área de conteúdo antes de adicionar os novos cards
        const alert = mainContentArea.querySelector('.alert');
        if (alert) {
            mainContentArea.appendChild(container);
        } else {
            mainContentArea.innerHTML = '';
            mainContentArea.appendChild(container);
        }
    }

    function createContentCard(item) {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-3 col-sm-4 col-6 mb-4';
        cardCol.innerHTML = `
            <div class="content-card text-decoration-none h-100">
                <div style="position:relative;">
                    <img src="${item.albumArt || 'https://placehold.co/300x300/1DB954/121212?text=Musica'}" alt="Capa de ${item.title}" class="card-img-top">
                    <button class="play-button-overlay" data-track-id="${item.id}"><i class="fas fa-play"></i></button>
                </div>
                <div class="card-body p-2 mt-2">
                    <h5 class="card-title text-white">${item.title}</h5>
                    <p class="card-subtitle">${item.artist}</p>
                </div>
            </div>`;
        cardCol.querySelector('.play-button-overlay').addEventListener('click', () => {
            const track = currentPlaylist.find(t => t.id == item.id);
            if (track) {
                loadTrack(track);
                playTrack();
            }
        });
        return cardCol;
    }

    // --- Funções do Player ---
    function loadTrack(track) {
        if (!track) return;
        currentTrackImage.src = track.albumArt || 'https://via.placeholder.com/56';
        currentTrackName.textContent = track.title;
        currentTrackArtist.textContent = track.artist;
        currentTrackIndex = currentPlaylist.findIndex(t => t.id === track.id);
        audioPlayer.src = track.audioUrl;
        audioPlayer.onloadedmetadata = () => totalDurationElement.textContent = formatTime(audioPlayer.duration);
    }

    function playTrack() { audioPlayer.play().catch(e => console.error("Erro ao tocar:", e)); }
    function pauseTrack() { audioPlayer.pause(); }
    function togglePlayPause() { if (audioPlayer.paused) playTrack(); else pauseTrack(); }
    function nextTrack() { currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length; loadTrack(currentPlaylist[currentTrackIndex]); playTrack(); }
    function prevTrack() { currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length; loadTrack(currentPlaylist[currentTrackIndex]); playTrack(); }
    function updateProgress() {
        progressBar.style.width = `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`;
        currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
    }
    function setProgress(e) { audioPlayer.currentTime = (e.offsetX / this.clientWidth) * audioPlayer.duration; }
    function formatTime(s) { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; }

    // --- Funções de Modo Demo ---
    function activateDemoMode() {
        console.log("Ativando modo demo...");
        isDemoMode = true;
        localStorage.setItem('demo_mode', 'true');
        
        // Atualiza os botões
        demoModeBtn.style.display = 'none';
        realModeBtn.style.display = 'block';
        
        // Carrega dados fictícios
        loadFallbackData("Modo Demo Ativado - Usando dados fictícios");
    }

    function activateRealMode() {
        console.log("Ativando modo real...");
        isDemoMode = false;
        localStorage.setItem('demo_mode', 'false');
        
        // Atualiza os botões
        demoModeBtn.style.display = 'block';
        realModeBtn.style.display = 'none';
        
        // Carrega dados reais do Spotify
        loadRealData();
    }

    // --- Inicialização ---
    function init() {
        console.log("--- Executando a função init() ---");

        if (window.location.hash.includes('access_token')) {
            console.log("Token de acesso encontrado na URL, processando callback...");
            auth.handleCallback();
        }

        console.log("Atualizando a UI para o estado de autenticação...");
        updateUIForAuthState();

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

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => auth.logout());
        }

        // Event listeners para alternar entre modo demo e real
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activateDemoMode();
            });
        }

        if (realModeBtn) {
            realModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activateRealMode();
            });
        }

        // Event listeners para navegação
        if (searchNavBtn) {
            searchNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove classe active de todos os links
                document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
                // Adiciona classe active ao botão clicado
                searchNavBtn.classList.add('active');
                showSearchInterface();
            });
        }

        if (homeNavBtn) {
            homeNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove classe active de todos os links
                document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
                // Adiciona classe active ao botão clicado
                homeNavBtn.classList.add('active');
                // Recarrega a tela inicial
                updateUIForAuthState();
            });
        }

        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', prevTrack);
        nextBtn.addEventListener('click', nextTrack);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', nextTrack);
        audioPlayer.addEventListener('play', () => playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>');
        audioPlayer.addEventListener('pause', () => playPauseBtn.innerHTML = '<i class="fas fa-play"></i>');
        progressBarContainer.addEventListener('click', setProgress);
        
        console.log("--- Função init() concluída ---");
    }

    init();
});

