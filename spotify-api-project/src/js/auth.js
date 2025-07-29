// Sistema de Autenticação do Spotify
class SpotifyAuth {
    constructor() {
        if (typeof SPOTIFY_CONFIG === 'undefined') {
            throw new Error('SPOTIFY_CONFIG não está definido. Carregue config.js primeiro.');
        }
        this.CLIENT_ID = SPOTIFY_CONFIG.CLIENT_ID;
        this.REDIRECT_URI = SPOTIFY_CONFIG.REDIRECT_URI;
        this.SCOPES = SPOTIFY_CONFIG.SCOPES;
        
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.tokenExpiry = localStorage.getItem('spotify_token_expiry');
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            scope: this.SCOPES,
            show_dialog: 'true'
        });
        return `${SPOTIFY_URLS.AUTHORIZE}?${params.toString()}`;
    }

    login() {
        console.log("--- SpotifyAuth.login() CHAMADO ---");
        const authUrl = this.getAuthUrl();
        console.log("URL de Autorização:", authUrl);
        console.log("Redirecionando para autorização do Spotify...");
        window.location.href = authUrl;
    }

    handleCallback() {
        console.log('Processando callback de autenticação...');
        
        // Verifica se há código de autorização (Authorization Code Flow)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            console.error('Erro na autenticação:', error);
            alert(`Erro de autenticação do Spotify: ${error}`);
            window.history.replaceState({}, document.title, window.location.pathname);
            return false;
        }
        
        if (authCode) {
            console.log('Código de autorização recebido, trocando por token...');
            return this.exchangeCodeForToken(authCode);
        }
        
        // Fallback: verifica se há token no hash (fluxo antigo)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        const accessToken = hashParams.get('access_token');
        const expiresIn = hashParams.get('expires_in');
        const hashError = hashParams.get('error');

        if (hashError) {
            console.error('Erro na autenticação (hash):', hashError);
            alert(`Erro de autenticação do Spotify: ${hashError}`);
            window.location.hash = '';
            return false;
        }
        
        if (accessToken) {
            this.accessToken = accessToken;
            const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
            this.tokenExpiry = expiryTime;
            
            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('spotify_token_expiry', expiryTime);
            
            console.log('Token recebido e salvo com sucesso!');
            window.location.hash = '';
            return true;
        }
        
        console.warn('Nenhum código ou token encontrado no callback');
        return false;
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(SPOTIFY_URLS.TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(SPOTIFY_CONFIG.CLIENT_ID + ':' + SPOTIFY_CONFIG.CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.REDIRECT_URI
                })
            });

            if (response.ok) {
                const tokenData = await response.json();
                
                this.accessToken = tokenData.access_token;
                const expiryTime = Date.now() + (tokenData.expires_in * 1000);
                this.tokenExpiry = expiryTime;
                
                localStorage.setItem('spotify_access_token', tokenData.access_token);
                localStorage.setItem('spotify_token_type', tokenData.token_type);
                localStorage.setItem('spotify_token_expiry', expiryTime);
                
                console.log('Token obtido com sucesso via Authorization Code Flow!');
                
                // Limpa a URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                return true;
            } else {
                const errorData = await response.json();
                console.error('Erro ao trocar código por token:', errorData);
                alert(`Erro na autenticação: ${errorData.error_description || errorData.error}`);
                return false;
            }
        } catch (error) {
            console.error('Erro de rede ao trocar código por token:', error);
            alert(`Erro de rede: ${error.message}`);
            return false;
        }
    }

    isAuthenticated() {
        if (!this.accessToken || !this.tokenExpiry) {
            return false;
        }
        return Date.now() < this.tokenExpiry;
    }

    getAccessToken() {
        if (this.isAuthenticated()) {
            return this.accessToken;
        }
        this.logout();
        return null;
    }

    logout() {
        this.accessToken = null;
        this.tokenExpiry = null;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
        localStorage.removeItem('demo_mode'); // Remove também o estado do modo demo
        console.log('Logout realizado. Recarregando a página.');
        window.location.href = 'index.html';
    }
}
