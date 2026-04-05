# PC-SPEC-014 — Deployment

| Campo            | Valor                    |
| ---------------- | ------------------------ |
| **ID**           | PC-SPEC-014              |
| **Status**       | Backlog                  |
| **Prioridade**   | Baixa — última etapa     |
| **Complexidade** | Média                    |
| **Autor**        | Patrick Iarrocheski      |
| **Branch**       | feat/PC-014-deployment   |

## 1. Objetivo

Estruturar o deployment completo do portal: evolução do docker-compose.yml existente para incluir todos os serviços, Dockerfile otimizado do Next.js, e pipeline CI/CD no GitHub Actions.

## 2. O que já existe (PC-SPEC-001)

```yaml
services:
  postgres:   # PostgreSQL 16
  langflow:   # Langflow (profile ai)
```

## 3. Docker Compose — versão final

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cateno
      POSTGRES_PASSWORD: cateno_dev
      POSTGRES_DB: portal_cateno
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cateno"]
      interval: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports: ["8080:8080"]
    volumes: ["./keycloak/realm-cateno.json:/opt/keycloak/data/import/realm.json"]

  # Container dedicado para migration — roda antes do portal
  # Evita race condition quando múltiplas instâncias do portal sobem simultaneamente
  migrate:
    build: .
    command: npx prisma migrate deploy
    depends_on:
      postgres: { condition: service_healthy }
    environment:
      DATABASE_URL: postgresql://cateno:cateno_dev@postgres:5432/portal_cateno
    restart: "no"   # Roda uma vez e encerra

  portal:
    build: .
    depends_on:
      migrate: { condition: service_completed_successfully }
      keycloak: { condition: service_started }
    environment:
      DATABASE_URL: postgresql://cateno:cateno_dev@postgres:5432/portal_cateno
      KEYCLOAK_ISSUER: http://keycloak:8080/realms/cateno
    ports: ["3000:3000"]
    command: node server.js   # Sem migrate — já foi feito pelo container migrate

  health-checker:
    build: ./health-checker
    depends_on: [portal]
    environment:
      PORTAL_URL: http://portal:3000
      HEALTH_CHECKER_SECRET: ${HEALTH_CHECKER_SECRET}
    restart: unless-stopped

  langflow:
    image: langflowai/langflow:latest
    ports: ["7860:7860"]
    volumes: [langflow_data:/app/langflow]
    profiles: [ai]

volumes:
  postgres_data:
  langflow_data:
```

## 4. Dockerfile Next.js (multi-stage)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

> Requer `output: 'standalone'` no `next.config.ts`

## 5. CI/CD — GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Portal Cateno

on:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build e push imagem portal
        run: |
          docker build -t cateno/portal:${{ github.sha }} .
          docker push cateno/portal:${{ github.sha }}
      - name: Build e push health-checker
        run: |
          docker build -t cateno/health-checker:${{ github.sha }} ./health-checker
          docker push cateno/health-checker:${{ github.sha }}
```

## 6. Ordem de boot

```
postgres → migrate (prisma migrate deploy) → keycloak → portal → health-checker
```

> O container `migrate` encerra com `service_completed_successfully` antes do portal subir. Isso garante que migrations sejam aplicadas exatamente uma vez, mesmo com múltiplas réplicas do portal.

## 7. Critérios de Aceite

- [ ] `docker compose up` sobe tudo sem configuração manual
- [ ] Container `migrate` executa `prisma migrate deploy` e encerra antes do portal subir
- [ ] Portal sobe apenas após `migrate` completar com sucesso (`service_completed_successfully`)
- [ ] Keycloak importa realm-cateno.json automaticamente
- [ ] Dockerfile multi-stage com output standalone do Next.js
- [ ] CI/CD valida lint + tipos + testes antes do deploy
- [ ] `.env.example` com todas as variáveis documentadas

## 8. Dependências

- **Depende de:** Todas as specs anteriores
