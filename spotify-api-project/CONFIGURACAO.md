# 🎵 Configuração do Spotify API - Instruções Atualizadas (2025)

## ⚠️ Importante: Mudanças na Documentação do Spotify

Baseado na documentação oficial do Spotify de 2025, o `localhost` não é mais permitido como Redirect URI. Devemos usar o IP de loopback `127.0.0.1`.

## � Configuração do Spotify Developer Dashboard

### 1. Acesse o Dashboard
- Vá para: https://developer.spotify.com/dashboard
- Entre com sua conta Spotify

### 2. Configure o Redirect URI
- Clique no seu app **"Spotify_clone"**
- Clique em **"Settings"**
- Na seção **"Redirect URIs"**, remova: `https://localhost:3000/callback`
- Adicione: **`http://127.0.0.1:3000/callback`**
- Clique em **"Save"**

### 3. Suas Credenciais (já configuradas)
```
Client ID: ec8f1fadc6924058a977b84e6d2bf776
Client Secret: f417409093fc4ae4b7805573eb9f8230
Redirect URI: http://127.0.0.1:3000/callback
```

## 🚀 Como Usar

### 1. Inicie o servidor
```bash
cd "C:\Users\Johnnie Desktop\OneDrive\Documents\GitHub\Outros-projetos\Projeto-spotify"
python -m http.server 3000
```

### 2. Acesse a aplicação
- **Aplicação principal**: http://127.0.0.1:3000/spotify-api-project/src/index.html
- **Página de teste**: http://127.0.0.1:3000/spotify-api-project/test-auth.html
- **Callback**: http://127.0.0.1:3000/callback
   - APIs: `Web API`
5. **Copie**:
   - Client ID (sempre visível)
   - Client Secret (clique em "Show Client Secret")

### 3. Teste a aplicação

1. **Salve** o arquivo `config.js` com suas credenciais
2. **Recarregue** a página: http://localhost:3000/spotify-api-project/src/index.html
3. **Clique** em "Fazer Login com Spotify"
4. **Autorize** a aplicação
5. **Aproveite** suas músicas reais do Spotify!

## 🎵 O que esperar

- **Sem login**: Funciona com dados de exemplo
- **Com login**: Carrega suas playlists reais
- **Músicas**: Previews de 30 segundos
- **Interface**: Idêntica ao Spotify original

## 🔧 Solução de Problemas

- **Erro 404**: Certifique-se que o servidor está rodando
- **Erro de autenticação**: Verifique Client ID e Client Secret
- **Redirect URI**: Deve ser exatamente `http://localhost:3000/callback`

## 📞 Ajuda

Se precisar de ajuda, me avise! Posso ajudar com:
- Configuração das credenciais
- Problemas de autenticação
- Adicionar mais funcionalidades
