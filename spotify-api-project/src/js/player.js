// filepath: /spotify-api-project/spotify-api-project/src/js/player.js
document.addEventListener('DOMContentLoaded', () => {
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

    let currentPlaylist = [];
    let currentTrackIndex = 0;
    let isMuted = false;
    let lastVolume = 0.7;

    function loadTrack(track) {
        if (!track) return;

        currentTrackImage.src = track.albumArt;
        currentTrackName.textContent = track.title;
        currentTrackArtist.textContent = track.artist;

        audioPlayer.src = track.audioUrl;
        audioPlayer.currentTime = 0;

        audioPlayer.onloadedmetadata = () => {
            totalDurationElement.textContent = formatTime(audioPlayer.duration);
            updateProgress();
        };

        audioPlayer.onerror = (e) => {
            console.error("Error loading audio:", e);
            currentTrackName.textContent = "Error loading " + track.title;
        };

        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    function playTrack() {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Audio started playing");
            }).catch(error => {
                console.error("Error playing music:", error);
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
            icon.className = volume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
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

    function displaySection(playlist) {
        if (!mainContentArea) return;
        mainContentArea.innerHTML = '';
        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';
        playlist.forEach(item => {
            const cardCol = createContentCard(item);
            rowContainer.appendChild(cardCol);
        });
        mainContentArea.appendChild(rowContainer);
    }

    function createContentCard(item) {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-3 col-sm-4 col-6 mb-4';
        cardCol.innerHTML = `
            <div class="content-card text-decoration-none h-100">
                <div style="position:relative;">
                    <img src="${item.albumArt}" alt="Cover of ${item.title}" class="card-img-top">
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
            const track = currentPlaylist.find(t => t.id == item.id);
            if (track) {
                loadTrack(track);
                setTimeout(() => {
                    playTrack();
                }, 100);
            }
        });
        return cardCol;
    }

    function init() {
        // Fetch the playlist from the Spotify API
        fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': 'Bearer ' + accessToken // Assume accessToken is obtained from auth.js
            }
        })
        .then(response => response.json())
        .then(data => {
            currentPlaylist = data.items.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.owner.display_name,
                albumArt: item.images[0]?.url || '',
                audioUrl: item.tracks.items[0]?.track.preview_url || '' // Assuming we want the preview URL
            }));
            displaySection(currentPlaylist);
            if (currentPlaylist.length > 0) {
                loadTrack(currentPlaylist[0]);
            }
        })
        .catch(error => console.error('Error fetching playlists:', error));

        // Event Listeners
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

    init();
});