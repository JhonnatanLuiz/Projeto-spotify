import React, { useState, useEffect } from 'react';
import SpotifyAuth from './services/auth';
import SpotifyAPI from './services/spotify-api';
import Player from './components/Player';
import ContentCard from './components/ContentCard';
import './App.css';

const auth = new SpotifyAuth();
const spotifyAPI = new SpotifyAPI(auth);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [mainContent, setMainContent] = useState(null);

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      auth.handleCallback();
      setIsAuthenticated(auth.isAuthenticated());
      window.history.replaceState({}, document.title, '/');
    }

    if (isAuthenticated) {
      spotifyAPI.getUserProfile().then(user => setUser(user));
      spotifyAPI.getUserPlaylists().then(playlists => setPlaylists(playlists.items));
      spotifyAPI.getRecentlyPlayed().then(recentlyPlayed => {
        setRecentlyPlayed(recentlyPlayed.items.map(item => item.track));
        setMainContent(recentlyPlayed.items.map(item => item.track));
      });
    }
  }, [isAuthenticated]);

  const login = () => {
    auth.login();
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo"><a href="#"><img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_White.png" alt="Spotify Logo" /></a></div>
        <nav>
          <ul>
            <li><a href="#" id="home-btn" className="active"><i className="fas fa-home"></i> Início</a></li>
            <li>
              <div className="search-bar">
                <input type="text" id="search-input" placeholder="O que você quer ouvir?" />
                <button id="search-button"><i className="fas fa-search"></i></button>
              </div>
            </li>
            <li><a href="#"><i className="fas fa-book"></i> Sua Biblioteca</a></li>
          </ul>
        </nav>
        <div className="playlists-section">
          <button className="create-playlist-btn"><i className="fas fa-plus"></i> Criar playlist</button>
          <button className="liked-songs-btn"><i className="fas fa-heart"></i> Músicas Curtidas</button>
          <hr style={{ borderColor: '#282828', margin: '20px 0' }} />
          <div id="user-playlists" className="mt-2" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}></div>
        </div>
      </aside>

      <main className="main-view">
        <div className="main-view-top-bar">
          <div className="nav-buttons">
            <button type="button" title="Voltar"><i className="fas fa-chevron-left"></i></button>
            <button type="button" title="Avançar"><i className="fas fa-chevron-right"></i></button>
          </div>
          <div className="ms-auto d-flex align-items-center">
            {isAuthenticated ? (
              <div id="user-profile" className="user-profile">
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={user ? user.images[0].url : "https://via.placeholder.com/28"} alt="Avatar" className="rounded-circle" />
                    <span id="user-name">{user ? user.display_name : "Usuário"}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                    <li><a className="dropdown-item" href="#">Conta</a></li>
                    <li><a className="dropdown-item" href="#">Perfil</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a id="logout-btn" className="dropdown-item" href="#" onClick={logout}>Sair</a></li>
                  </ul>
                </div>
              </div>
            ) : (
              <button id="login-btn" className="btn btn-success rounded-pill me-3" onClick={login}>
                <i className="fab fa-spotify"></i> Fazer Login com Spotify
              </button>
            )}
          </div>
        </div>
        <div id="main-content-area" className="p-4">
          <div className="row">
            {mainContent && mainContent.map(item => (
              <ContentCard key={item.id} item={{
                id: item.id,
                title: item.name,
                artist: item.artists ? item.artists.map(a => a.name).join(', ') : 'Artista',
                albumArt: item.album ? item.album.images[0]?.url : item.images[0]?.url,
                uri: item.uri
              }} play={(track) => {
                if (isAuthenticated) {
                  const player = document.getElementById('audio-player');
                  if (player) {
                    player.src = track.preview_url;
                    player.play();
                  }
                }
              }} />
            ))}
          </div>
        </div>
      </main>

      {isAuthenticated && <Player auth={auth} play={(track) => {
        if (isAuthenticated) {
          const player = document.getElementById('audio-player');
          if (player) {
            player.src = track.preview_url;
            player.play();
          }
        }
      }} />}
    </div>
  );
}

export default App;
