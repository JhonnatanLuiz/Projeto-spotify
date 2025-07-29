#!/usr/bin/env python3
import http.server
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"GET request para: {self.path}")
        print(f"Diretório atual: {os.getcwd()}")
        super().do_GET()

PORT = 3000
Handler = MyHTTPRequestHandler

print(f"Diretório de trabalho: {os.getcwd()}")
print(f"Conteúdo do diretório:")
for item in os.listdir('.'):
    print(f"  - {item}")

if os.path.exists('src'):
    print(f"Conteúdo da pasta src:")
    for item in os.listdir('src'):
        print(f"  - src/{item}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor rodando na porta {PORT}")
    print(f"Acesse: http://localhost:{PORT}/src/index.html")
    httpd.serve_forever()
