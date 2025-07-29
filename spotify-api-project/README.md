# Spotify Clone com API Real

Este projeto é um clone do Spotify que utiliza a API real do Spotify para carregar músicas, playlists e informações do usuário.

## 🚀 Funcionalidades

- ✅ **Autenticação com Spotify**: Login usando OAuth 2.0
- ✅ **Playlists Reais**: Carrega playlists em destaque do Spotify
- ✅ **Player Funcional**: Reproduz previews de 30 segundos das músicas
- ✅ **Interface Responsiva**: Design similar ao Spotify original
- ✅ **Fallback**: Usa dados de exemplo quando não há autenticação

## 📋 Pré-requisitos

1. **Conta no Spotify Developer Dashboard**
   - Acesse: https://developer.spotify.com/dashboard
   - Crie uma nova aplicação
   - Anote o `Client ID` e `Client Secret`

2. **Configuração da Aplicação no Spotify**
   - **Redirect URI**: `http://localhost:3000/callback`
   - **Scopes necessários**: user-read-private, user-read-email, playlist-read-private, streaming, etc.

## ⚙️ Configuração

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd spotify-api-project
   ```

2. **Configure as credenciais**
   
   Abra o arquivo `config/config.js` e substitua:
   ```javascript
   const SPOTIFY_CONFIG = {
       CLIENT_ID: 'SEU_CLIENT_ID_AQUI',
       CLIENT_SECRET: 'SEU_CLIENT_SECRET_AQUI', 
       REDIRECT_URI: 'http://localhost:3000/callback',
       // ...
   };
   ```

3. **Instale um servidor local**
   ```bash
   # Usando Python (se tiver instalado)
   python -m http.server 3000
   
   # Ou usando Node.js
   npx http-server -p 3000
   
   # Ou usando Live Server no VS Code
   ```

4. **Acesse a aplicação**
   - Abra: `http://localhost:3000/src/index.html`

## 🎵 Como usar

1. **Primeira vez (sem login)**:
   - A aplicação carrega com dados de exemplo
   - Todas as funcionalidades do player funcionam normalmente

2. **Com login no Spotify**:
   - Clique no botão "Fazer Login com Spotify"
   - Autorize a aplicação
   - A aplicação carregará suas playlists e músicas reais
   - **Nota**: Só funcionarão músicas que têm preview de 30 segundos

## 📁 Estrutura do Projeto

```
spotify-api-project/
├── config/
│   └── config.js          # Configurações da API
├── src/
│   ├── css/
│   │   └── styles.css     # Estilos (usa o CSS do projeto principal)
│   ├── js/
│   │   ├── app.js         # Aplicação principal
│   │   ├── auth.js        # Sistema de autenticação
│   │   └── spotify-api.js # Chamadas para a API
│   └── index.html         # Página principal
├── package.json
└── README.md
```

## 🔧 Funcionalidades Implementadas

### Autenticação
- [x] Login com Spotify OAuth 2.0
- [x] Armazenamento seguro de tokens
- [x] Renovação automática de tokens
- [x] Logout

### API do Spotify
- [x] Buscar playlists em destaque
- [x] Carregar músicas de playlists
- [x] Obter informações do usuário
- [x] Buscar músicas/artistas/álbuns
- [x] Músicas mais tocadas
- [x] Histórico de reprodução

### Player
- [x] Reprodução de previews (30 segundos)
- [x] Controles de play/pause
- [x] Navegação entre músicas
- [x] Barra de progresso
- [x] Controle de volume
- [x] Informações da música atual

## 🚨 Limitações

1. **Previews apenas**: A API do Spotify só permite reprodução de previews de 30 segundos
2. **Spotify Premium**: Para reprodução completa, seria necessário usar o Spotify Web Playback SDK
3. **CORS**: Algumas operações podem precisar de um servidor backend
4. **Rate Limiting**: A API tem limites de requisições por minuto

## 🔄 Fallback

Quando não há autenticação ou quando há erros na API, a aplicação usa:
- Dados de exemplo com músicas de teste
- Todas as funcionalidades continuam funcionando
- Interface idêntica ao modo autenticado

## 📚 Próximos Passos

- [ ] Implementar busca em tempo real
- [ ] Adicionar mais categorias de música
- [ ] Implementar sistema de favoritos
- [ ] Adicionar suporte ao Spotify Web Playback SDK
- [ ] Criar backend para gerenciar tokens de forma segura

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Faça push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é apenas para fins educacionais e demonstração da API do Spotify.
├── .gitignore              # Files and directories to ignore by Git
├── package.json            # npm configuration file
└── README.md               # Documentation for the project
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd spotify-api-project
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env` file in the root directory and add your Spotify API credentials:
     ```
     SPOTIFY_CLIENT_ID=<your-client-id>
     SPOTIFY_CLIENT_SECRET=<your-client-secret>
     SPOTIFY_REDIRECT_URI=<your-redirect-uri>
     ```

4. **Run the application**:
   - Open `src/index.html` in your web browser to view the application.

## Usage
- Upon loading the application, users will be prompted to log in with their Spotify account.
- Once authenticated, users can browse playlists and tracks, and play their favorite music directly from the application.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.