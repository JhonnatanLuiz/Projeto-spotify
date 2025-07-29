import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para servir arquivos estáticos
function serveFile(filePath, res) {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('500 - Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Criar servidor HTTP que redireciona para HTTPS
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
});

// Criar servidor HTTPS
const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
}, (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './spotify-api-project/src/index.html';
    }

    // Resolve o caminho do arquivo
    const fullPath = path.resolve(filePath);
    
    serveFile(fullPath, res);
});

// Iniciar servidores
httpServer.listen(3000, () => {
    console.log('Servidor HTTP rodando na porta 3000 (redireciona para HTTPS)');
});

httpsServer.listen(3001, () => {
    console.log('Servidor HTTPS rodando na porta 3001');
    console.log('Acesse: https://localhost:3001/spotify-api-project/src/index.html');
});

export default { httpServer, httpsServer };
