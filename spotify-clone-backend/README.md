# Spotify Clone Backend

Este é o servidor backend para o projeto Spotify Clone.

## 📋 Pré-requisitos

Você precisa ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## 🛠️ Instalação

1. **Verificar se o Node.js está instalado:**
   ```bash
   node --version
   npm --version
   ```

2. **Se o Node.js não estiver instalado:**
   - Baixe e instale de: https://nodejs.org/
   - Reinicie o terminal após a instalação

3. **Instalar as dependências:**
   ```bash
   cd spotify-clone-backend
   npm install
   ```

## 🚀 Como executar

### Modo de desenvolvimento:
```bash
npm run dev
```

### Modo de produção:
```bash
npm start
```

O servidor será iniciado em: `http://localhost:5000`

## 📡 Endpoints disponíveis

- `GET /` - Informações do servidor
- `GET /health` - Status de saúde do servidor
- `POST /api/spotify/token` - Proxy para troca de tokens do Spotify
- `ALL /api/spotify/*` - Proxy para chamadas da API do Spotify

## 🔧 Resolução de problemas

### Se o npm não estiver funcionando:

1. **Instalar Node.js:**
   - Vá para https://nodejs.org/
   - Baixe a versão LTS (recomendada)
   - Execute o instalador
   - Reinicie o terminal

2. **Verificar instalação:**
   ```bash
   node --version
   npm --version
   ```

3. **Se ainda não funcionar:**
   - Reinicie o computador
   - Abra um novo terminal como administrador
   - Tente novamente

### Dependências necessárias:
- **express**: Framework web para Node.js
- **axios**: Cliente HTTP para fazer requisições
- **cors**: Middleware para habilitar CORS
- **nodemon**: (dev) Reinicia o servidor automaticamente

## 📝 Estrutura do projeto

```
spotify-clone-backend/
├── package.json          # Configurações e dependências
├── server.js             # Servidor principal
└── README.md            # Este arquivo
```

## 🔗 Integração com o Frontend

O backend foi configurado para trabalhar com o frontend localizado em `../spotify-api-project/src/`. 

As chamadas para a API do Spotify são feitas através do backend para evitar problemas de CORS.

## 📞 Suporte

Se você continuar tendo problemas com o npm, certifique-se de que:
1. Node.js está instalado
2. O terminal está sendo executado como administrador (se necessário)
3. Não há conflitos com outras versões do Node.js
