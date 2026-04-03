#!/bin/bash
# ═══════════════════════════════════════════
# Portal Cateno — Setup Script
# Roda após git clone para configurar tudo
# ═══════════════════════════════════════════

set -e

echo "🚀 Portal Cateno — Setup"
echo "========================"

# 1. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# 2. Configurar Husky
echo ""
echo "🐶 Configurando Husky..."
npx husky

# 3. Copiar .env se não existir
if [ ! -f .env.local ]; then
  echo ""
  echo "📝 Criando .env.local a partir de .env.example..."
  cp .env.example .env.local
  echo "⚠️  Edite .env.local com seus valores antes de continuar!"
fi

# 4. Subir PostgreSQL
echo ""
echo "🐘 Subindo PostgreSQL via Docker..."
docker compose up -d

# 5. Aguardar PostgreSQL estar pronto
echo ""
echo "⏳ Aguardando PostgreSQL..."
sleep 3

# 6. Gerar Prisma Client + Migrate
echo ""
echo "🔧 Gerando Prisma Client e rodando migrations..."
npx prisma generate
npx prisma migrate dev --name init

# 7. Seed
echo ""
echo "🌱 Populando banco com dados iniciais..."
npx prisma db seed

echo ""
echo "✅ Setup completo! Execute: npm run dev"
