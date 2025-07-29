
document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores ---
    const mainContentArea = document.getElementById('main-content-area');
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
    const volumeBarContainer = document.getElementById('volume-bar-container');
    const volumeProgress = document.getElementById('volume-progress');
    const volumeIconBtn = document.getElementById('volume-icon-btn');

    // --- Estado da Aplicação ---
    let currentPlaylist = [];
    let currentTrackIndex = 0;
    let isMuted = false;
    let lastVolume = 0.7;

    // --- Dados (Fonte Única da Verdade) ---
    const playlistData = {
        name: "Feito para você",
        items: [
            { id: 1, title: "Chill Lofi Beat", artist: "Demo Artist", albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", audioUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3" },
            { id: 2, title: "Relaxing Piano", artist: "Piano Master", albumArt: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=300&fit=crop", audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3" },
            { id: 3, title: "Electronic Vibes", artist: "Electronic Producer", albumArt: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop", audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg" },
            { id: 4, title: "Ambient Sounds", artist: "Nature Sounds", albumArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop", audioUrl: "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3" },
            { id: 5, title: "Jazz Fusion", artist: "Jazz Collective", albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&brightness=1.2", audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race2.ogg" },
            { id: 6, title: "Classical Mix", artist: "Orchestra", albumArt: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop", audioUrl: "https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3" }
        ]
    };

    // --- Funções do Player ---

    function loadTrack(track) {
        if (!track) return;
        
        // Atualiza a interface
        currentTrackImage.src = track.albumArt;
        currentTrackName.textContent = track.title;
        currentTrackArtist.textContent = track.artist;
        
        // Encontra o índice da música atual na playlist
        currentTrackIndex = currentPlaylist.findIndex(t => t.id === track.id);
        
        // Carrega o áudio
        audioPlayer.src = track.audioUrl;
        audioPlayer.currentTime = 0;
        
        // Aguarda o carregamento dos metadados
        audioPlayer.onloadedmetadata = () => {
            totalDurationElement.textContent = formatTime(audioPlayer.duration);
            updateProgress();
        };
        
        // Tratamento de erro no carregamento
        audioPlayer.onerror = (e) => {
            console.error("Erro ao carregar o áudio:", e);
            currentTrackName.textContent = "Erro ao carregar " + track.title;
        };
        
        // Reset do botão play
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    function playTrack() {
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Áudio começou a tocar com sucesso
                console.log("Áudio começou a tocar");
            }).catch(error => {
                console.error("Erro ao tocar a música:", error);
                // Reset do botão se houver erro
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            });
        }
    }

    function pauseTrack() {
        audioPlayer.pause();
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            playTrack();
        } else {
            pauseTrack();
        }
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
        const trackToPlay = currentPlaylist[currentTrackIndex];
        loadTrack(trackToPlay);
        playTrack();
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        const trackToPlay = currentPlaylist[currentTrackIndex];
        loadTrack(trackToPlay);
        playTrack();
    }

    // --- Funções da UI ---

    function updateProgress() {
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
            currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
        } else {
            progressBar.style.width = '0%';
            currentTimeElement.textContent = "0:00";
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        if (audioPlayer.duration) {
            audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
        }
    }

    function setVolume(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const volume = clickX / width;
        audioPlayer.volume = volume;
        updateVolumeIcon(volume);
    }
    
    function updateVolumeIcon(volume) {
        const icon = volumeIconBtn.querySelector('i');
        if (volume === 0 || isMuted) {
            icon.className = 'fas fa-volume-mute';
            volumeProgress.style.width = '0%';
        } else {
            volumeProgress.style.width = `${volume * 100}%`;
            if (volume < 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (isMuted) {
            lastVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
        } else {
            audioPlayer.volume = lastVolume;
        }
        updateVolumeIcon(audioPlayer.volume);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // --- Renderização Dinâmica ---

    function createContentCard(item) {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-3 col-sm-4 col-6 mb-4';
        cardCol.innerHTML = `
            <div class="content-card text-decoration-none h-100">
                <div style="position:relative;">
                    <img src="${item.albumArt}" alt="Capa de ${item.title}" class="card-img-top">
                    <button class="play-button-overlay" data-track-id="${item.id}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="card-body p-2 mt-2">
                    <h5 class="card-title text-white">${item.title}</h5>
                    <p class="card-subtitle">${item.artist}</p>
                </div>
            </div>
        `;
        cardCol.querySelector('.play-button-overlay').addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Botão play clicado para:", item.title);
            const track = currentPlaylist.find(t => t.id == item.id);
            if (track) {
                console.log("Track encontrado:", track);
                loadTrack(track);
                // Aguarda um pouco para o áudio carregar antes de tentar tocar
                setTimeout(() => {
                    playTrack();
                }, 100);
            } else {
                console.log("Track não encontrado");
            }
        });
        return cardCol;
    }

    function displaySection(playlist, container) {
        if (!container) return;
        container.innerHTML = '';
        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';
        playlist.items.forEach(item => {
            const card = createContentCard(item);
            rowContainer.appendChild(card);
        });
        container.appendChild(rowContainer);
    }

    // --- Inicialização ---

    function init() {
        // Carrega a playlist principal
        currentPlaylist = playlistData.items;
        
        // Renderiza os cards na tela
        displaySection(playlistData, mainContentArea);
        
        // Carrega a primeira música no player, mas não toca
        if (currentPlaylist.length > 0) {
            loadTrack(currentPlaylist[0]);
        }

        // Configura o volume inicial
        audioPlayer.volume = lastVolume;
        updateVolumeIcon(lastVolume);

        // --- Event Listeners ---
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', prevTrack);
        nextBtn.addEventListener('click', nextTrack);
        
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', nextTrack);
        
        audioPlayer.addEventListener('play', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
        audioPlayer.addEventListener('pause', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        progressBarContainer.addEventListener('click', setProgress);
        volumeBarContainer.addEventListener('click', setVolume);
        volumeIconBtn.addEventListener('click', toggleMute);
    }

    // Inicia a aplicação
    init();
});


        
