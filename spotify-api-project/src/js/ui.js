/**
 * @module UI
 * @description This module handles all UI-related tasks, such as showing loading messages, displaying tracks, and updating the UI based on the authentication state.
 */
const UI = (() => {
    const mainContentArea = document.getElementById('main-content-area');
    const loginBtn = document.getElementById('login-btn');
    const userProfileContainer = document.getElementById('user-profile');
    const userNameSpan = document.getElementById('user-name');
    const userAvatar = document.querySelector('#user-profile img');
    const logoutBtn = document.getElementById('logout-btn');
    const demoModeBtn = document.getElementById('demo-mode-btn');
    const realModeBtn = document.getElementById('real-mode-btn');

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

    function createContentCard(item, isDemoMode, playTrackCallback) {
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
            playTrackCallback(item, isDemoMode);
        });
        return cardCol;
    }

    function displayTracks(playlist, isDemoMode, playTrackCallback) {
        const container = document.createElement('div');
        container.className = 'row';
        playlist.forEach(item => container.appendChild(createContentCard(item, isDemoMode, playTrackCallback)));

        mainContentArea.innerHTML = '';
        mainContentArea.appendChild(container);
    }

    function updateUIForAuthState(isAuthenticated, isDemoMode, loadUserProfile, loadFallbackData, loadRealData) {
        if (isAuthenticated) {
            loginBtn.style.display = 'none';
            userProfileContainer.style.display = 'block';
            loadUserProfile();

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

    function updateUserProfile(profile) {
        if (profile) {
            userNameSpan.textContent = profile.display_name || 'Usuário';
            const avatar = profile.images?.[0]?.url;
            if (avatar) userAvatar.src = avatar;
        }
    }

    return {
        showLoadingMessage,
        showErrorMessage,
        displayTracks,
        updateUIForAuthState,
        updateUserProfile
    };
})();
