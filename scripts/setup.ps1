# ═══════════════════════════════════════════
# CSA - CatIA Super App — Setup Script (PowerShell)
# Roda após git clone para configurar tudo
# ═══════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 CSA - CatIA Super App — Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# 1. Instalar dependências
Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
npm install

# 2. Configurar Husky
Write-Host "`n🐶 Configurando Husky..." -ForegroundColor Yellow
npx husky

# 3. Copiar .env se não existir
if (-not (Test-Path ".env.local")) {
    Write-Host "`n📝 Criando .env.local a partir de .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  Edite .env.local com seus valores antes de continuar!" -ForegroundColor Red
}

# 4. Subir PostgreSQL
Write-Host "`n🐘 Subindo PostgreSQL via Docker..." -ForegroundColor Yellow
docker compose up -d

# 5. Aguardar PostgreSQL estar pronto
Write-Host "`n⏳ Aguardando PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 6. Gerar Prisma Client + Migrate
Write-Host "`n🔧 Gerando Prisma Client e rodando migrations..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate dev --name init

# 7. Seed
Write-Host "`n🌱 Populando banco com dados iniciais..." -ForegroundColor Yellow
npx prisma db seed

Write-Host "`n✅ Setup completo! Execute: npm run dev" -ForegroundColor Green
