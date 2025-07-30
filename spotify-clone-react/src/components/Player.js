import React, { useState, useEffect, useRef } from 'react';
import SpotifyAPI from '../services/spotify-api';

const Player = ({ auth }) => {
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const spotifyAPI = new SpotifyAPI(auth);
    const audioPlayer = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            if (auth.isAuthenticated()) {
                const token = auth.getAccessToken();
                const player = new window.Spotify.Player({
                    name: 'Spotify Clone Player',
                    getOAuthToken: cb => { cb(token); }
                });

                setPlayer(player);

                player.addListener('initialization_error', ({ message }) => { console.error(message); });
                player.addListener('authentication_error', ({ message }) => { console.error(message); });
                player.addListener('account_error', ({ message }) => { console.error(message); });
                player.addListener('playback_error', ({ message }) => { console.error(message); });

                player.addListener('player_state_changed', state => {
                    if (!state) {
                        return;
                    }
                    setCurrentTrack(state.track_window.current_track);
                    setIsPlaying(!state.paused);
                    setProgress(state.position);
                    setDuration(state.duration);
                });

                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    setDeviceId(device_id);
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.connect();
            }
        };
    }, [auth]);

    const play = (track) => {
        if (deviceId) {
            spotifyAPI.play(deviceId, track.uri);
        }
    };

    const togglePlay = () => {
        if (player) {
            player.togglePlay();
        }
    };

    const nextTrack = () => {
        if (player) {
            player.nextTrack();
        }
    };

    const prevTrack = () => {
        if (player) {
            player.previousTrack();
        }
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <footer className="now-playing-bar">
            <div className="song-info">
                <img id="current-track-image" src={currentTrack ? currentTrack.album.images[0].url : "https://placehold.co/56x56/181818/1DB954?text=_"} alt="Capa" />
                <div>
                    <div id="current-track-name" className="track-name">{currentTrack ? currentTrack.name : "Nenhuma música tocando"}</div>
                    <div id="current-track-artist" className="artist-name">{currentTrack ? currentTrack.artists.map(artist => artist.name).join(', ') : ""}</div>
                </div>
                <button className="like-btn ms-3" title="Curtir"><i className="far fa-heart"></i></button>
            </div>
            <div className="player-controls">
                <div className="buttons">
                    <button title="Aleatório"><i className="fas fa-random"></i></button>
                    <button id="prev-btn" title="Anterior" onClick={prevTrack}><i className="fas fa-step-backward"></i></button>
                    <button id="play-pause-btn" className="play-pause-btn" title="Play" onClick={togglePlay}>
                        {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                    </button>
                    <button id="next-btn" title="Próxima" onClick={nextTrack}><i className="fas fa-step-forward"></i></button>
                    <button title="Repetir"><i className="fas fa-redo"></i></button>
                </div>
                <div className="playback-bar">
                    <span id="current-time">{formatTime(progress / 1000)}</span>
                    <div className="progress-bar-container" id="progress-bar-container">
                        <div className="progress" id="progress-bar" style={{ width: `${(progress / duration) * 100}%` }}></div>
                    </div>
                    <span id="total-duration">{formatTime(duration / 1000)}</span>
                </div>
            </div>
            <div className="player-right-controls">
                <button title="Fila"><i className="fas fa-bars"></i></button>
                <button title="Dispositivos"><i className="fas fa-desktop"></i></button>
                <button id="volume-icon-btn" title="Volume"><i className="fas fa-volume-up"></i></button>
                <div className="volume-bar-container" id="volume-bar-container"><div className="volume-progress" id="volume-progress"></div></div>
            </div>
            <audio id="audio-player" ref={audioPlayer} style={{ display: 'none' }}></audio>
        </footer>
    );
};

export default Player;
