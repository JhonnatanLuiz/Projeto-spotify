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
    
    // Navegação
    const searchNavBtn = document.querySelector('nav ul li:nth-child(2) a'); // Botão "Buscar"
    const homeNavBtn = document.querySelector('nav ul li:nth-child(1) a'); // Botão "Início"
    
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
        showLoadingMessage('Carregando suas músicas do Spotify...');
        try {
            const playlistsData = await spotifyAPI.getFeaturedPlaylists(1);
            if (!playlistsData || playlistsData.playlists.items.length === 0) {
                throw new Error("Nenhuma playlist em destaque encontrada.");
            }
            const playlist = playlistsData.playlists.items[0];
            const tracksData = await spotifyAPI.getPlaylistTracks(playlist.id, 50);
            const tracks = tracksData.items.filter(item => item.track && item.track.preview_url);

            if (tracks.length > 0) {
                currentPlaylist = tracks.map(item => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map(a => a.name).join(', '),
                    albumArt: item.track.album.images[0]?.url,
                    audioUrl: item.track.preview_url
                }));
                displayTracks();
                loadTrack(currentPlaylist[0]);
            } else {
                loadFallbackData("Nenhuma música com preview encontrada.");
            }
        } catch (error) {
            console.error('Erro ao carregar dados reais:', error);
            loadFallbackData('Não foi possível carregar os dados do Spotify.');
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
        displayTracks();
        if (currentPlaylist.length > 0) loadTrack(currentPlaylist[0]);
    }

    // --- Renderização ---
    function showLoadingMessage(message) {
        mainContentArea.innerHTML = `<div class="text-center text-white p-5"><div class="spinner-border text-success"></div><p class="mt-3">${message}</p></div>`;
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

    function displayTracks() {
        const container = document.createElement('div');
        container.className = 'row';
        currentPlaylist.forEach(item => container.appendChild(createContentCard(item)));
        
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

    // --- Funções de Busca ---
    function showSearchInterface() {
        mainContentArea.innerHTML = `
            <div class="search-container">
                <h2 class="text-white mb-4">Buscar Música</h2>
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="input-group">
                            <input type="text" id="search-input" class="form-control form-control-lg" 
                                   placeholder="Digite o nome da música, artista ou álbum..." 
                                   style="background-color: #242424; border-color: #404040; color: white;">
                            <button id="search-btn" class="btn btn-success btn-lg" type="button">
                                <i class="fas fa-search"></i> Buscar
                            </button>
                        </div>
                    </div>
                </div>
                <div id="search-results" class="row"></div>
            </div>
        `;

        // Event listeners para busca
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Foco no campo de busca
        searchInput.focus();
    }

    async function performSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const query = searchInput.value.trim();

        if (!query) {
            alert('Digite alguma coisa para buscar!');
            return;
        }

        // Loading
        searchResults.innerHTML = `
            <div class="col-12 text-center text-white p-5">
                <div class="spinner-border text-success"></div>
                <p class="mt-3">Buscando "${query}"...</p>
            </div>
        `;

        try {
            if (!auth.isAuthenticated() || isDemoMode) {
                // Busca demo/fictícia
                performDemoSearch(query);
                return;
            }

            // Busca real no Spotify
            const results = await spotifyAPI.searchTracks(query, 20);
            
            if (results && results.tracks && results.tracks.items.length > 0) {
                displaySearchResults(results.tracks.items);
            } else {
                searchResults.innerHTML = `
                    <div class="col-12 text-center text-white p-5">
                        <i class="fas fa-search fa-3x mb-3" style="color: #404040;"></i>
                        <h4>Nenhum resultado encontrado</h4>
                        <p>Tente buscar com outros termos.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            searchResults.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Erro ao buscar: ${error.message}
                    </div>
                </div>
            `;
        }
    }

    function performDemoSearch(query) {
        const searchResults = document.getElementById('search-results');
        
        // Simulação de busca em dados demo
        const demoResults = [
            { 
                id: 'demo_1', 
                name: "Bohemian Rhapsody", 
                artists: [{ name: "Queen" }],
                album: { 
                    images: [{ url: "https://placehold.co/300x300/1db954/ffffff?text=Queen" }],
                    name: "A Night at the Opera"
                },
                preview_url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
            },
            { 
                id: 'demo_2', 
                name: "Imagine", 
                artists: [{ name: "John Lennon" }],
                album: { 
                    images: [{ url: "https://placehold.co/300x300/ff6b6b/ffffff?text=Lennon" }],
                    name: "Imagine"
                },
                preview_url: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3"
            }
        ].filter(track => 
            track.name.toLowerCase().includes(query.toLowerCase()) ||
            track.artists[0].name.toLowerCase().includes(query.toLowerCase())
        );

        if (demoResults.length > 0) {
            displaySearchResults(demoResults);
        } else {
            searchResults.innerHTML = `
                <div class="col-12 text-center text-white p-5">
                    <i class="fas fa-search fa-3x mb-3" style="color: #404040;"></i>
                    <h4>Nenhum resultado encontrado</h4>
                    <p>Tente buscar por "Queen", "Bohemian", "John Lennon" ou "Imagine".</p>
                </div>
            `;
        }
    }

    function displaySearchResults(tracks) {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        tracks.forEach(track => {
            const trackCard = createSearchResultCard(track);
            searchResults.appendChild(trackCard);
        });
    }

    function createSearchResultCard(track) {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-3 col-sm-4 col-6 mb-4';
        
        const albumArt = track.album?.images?.[0]?.url || 'https://placehold.co/300x300/1DB954/121212?text=Musica';
        const artistNames = track.artists?.map(artist => artist.name).join(', ') || 'Artista Desconhecido';
        
        cardCol.innerHTML = `
            <div class="content-card text-decoration-none h-100">
                <div style="position:relative;">
                    <img src="${albumArt}" alt="Capa de ${track.name}" class="card-img-top">
                    <button class="play-button-overlay" data-track-search='${JSON.stringify(track)}'><i class="fas fa-play"></i></button>
                </div>
                <div class="card-body p-2 mt-2">
                    <h5 class="card-title text-white">${track.name}</h5>
                    <p class="card-subtitle">${artistNames}</p>
                    <p class="card-text small text-muted">${track.album?.name || ''}</p>
                </div>
            </div>
        `;

        cardCol.querySelector('.play-button-overlay').addEventListener('click', () => {
            const trackData = JSON.parse(cardCol.querySelector('.play-button-overlay').dataset.trackSearch);
            playSearchedTrack(trackData);
        });

        return cardCol;
    }

    function playSearchedTrack(track) {
        const trackToPlay = {
            id: track.id,
            title: track.name,
            artist: track.artists?.map(a => a.name).join(', ') || 'Artista Desconhecido',
            albumArt: track.album?.images?.[0]?.url,
            audioUrl: track.preview_url
        };

        if (trackToPlay.audioUrl) {
            loadTrack(trackToPlay);
            playTrack();
        } else {
            alert('Preview não disponível para esta música.');
        }
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

