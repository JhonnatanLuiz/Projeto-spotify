#!/usr/bin/env python3

import http.server
import ssl
import socketserver
import os
import tempfile

# Porta para o servidor HTTPS
PORT = 3000

# Cria um certificado temporário
def create_self_signed_cert():
    import subprocess
    import tempfile
    
    # Cria diretório temporário para certificados
    cert_dir = tempfile.mkdtemp()
    
    # Caminhos para os arquivos
    key_file = os.path.join(cert_dir, 'key.pem')
    cert_file = os.path.join(cert_dir, 'cert.pem')
    
    # Comando para gerar certificado (requer OpenSSL)
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-keyout', key_file,
        '-out', cert_file, '-days', '365', '-nodes',
        '-subj', '/C=BR/ST=State/L=City/O=Organization/CN=localhost'
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return cert_file, key_file
    except:
        return None, None

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Headers CORS para permitir requisições de diferentes origens
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

def main():
    # Tenta criar certificado self-signed
    cert_file, key_file = create_self_signed_cert()
    
    if cert_file and key_file:
        print(f"Certificado SSL criado em: {cert_file}")
        print(f"Chave privada criada em: {key_file}")
        
        # Cria servidor HTTPS
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Servidor rodando na porta {PORT}")
            
            # Configura SSL
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.load_cert_chain(cert_file, key_file)
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            print(f"Servidor HTTPS iniciado em: https://localhost:{PORT}")
            print("Acesse: https://localhost:3000/spotify-api-project/src/index.html")
            print("Callback: https://localhost:3000/callback")
            print("Pressione Ctrl+C para parar o servidor")
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServidor parado.")
                
                # Limpa arquivos temporários
                if os.path.exists(cert_file):
                    os.remove(cert_file)
                if os.path.exists(key_file):
                    os.remove(key_file)
                print("Arquivos de certificado removidos.")
    else:
        print("❌ Erro: OpenSSL não encontrado ou erro ao criar certificado")
        print("Rodando servidor HTTP normal na porta 3000...")
        
        # Servidor HTTP normal como fallback
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Servidor HTTP iniciado em: http://localhost:{PORT}")
            print("Acesse: http://localhost:3000/spotify-api-project/src/index.html")
            print("Pressione Ctrl+C para parar o servidor")
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServidor parado.")

if __name__ == "__main__":
    main()
