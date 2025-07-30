@echo off
cd /d "c:\Users\Johnnie Desktop\OneDrive\Documents\GitHub\Outros-projetos\Projeto-spotify\spotify-api-project"
echo Iniciando servidor na porta 3000...
echo Acesse: http://127.0.0.1:3000/src/index.html
python -m http.server 3000
pause
