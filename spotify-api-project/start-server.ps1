Set-Location "c:\Users\Johnnie Desktop\OneDrive\Documents\GitHub\Outros-projetos\Projeto-spotify\spotify-api-project"
Write-Host "Iniciando servidor na porta 3000..." -ForegroundColor Green
Write-Host "Acesse: http://127.0.0.1:3000/src/index.html" -ForegroundColor Yellow
python -m http.server 3000
