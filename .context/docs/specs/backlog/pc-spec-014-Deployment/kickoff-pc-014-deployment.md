# Kickoff — PC-SPEC-014: Deployment (Docker Compose + CI/CD)

**Agente:** devops-specialist
**Wave:** 6 — última spec, consolida tudo
**Estimativa:** ~9h

## Antes de começar

Confirme que TODAS as specs anteriores estão completas.
Leia a spec completa:
```
.context/docs/specs/backlog/pc-014-Deployment/pc-spec-014-Deployment.md
```

## O que implementar

### 1. docker-compose.yml — versão final

Serviços: `postgres`, `keycloak`, `migrate`, `portal`, `health-checker`, `langflow` (profile ai)

**Padrão crítico de boot:**
```yaml
migrate:    # Roda prisma migrate deploy e ENCERRA
  command: npx prisma migrate deploy
  restart: "no"

portal:     # Sobe APÓS migrate completar com sucesso
  depends_on:
    migrate: { condition: service_completed_successfully }
  command: node server.js    # Sem migrate aqui
```

### 2. Dockerfile Next.js — multi-stage com standalone

```dockerfile
# Requer output: 'standalone' no next.config.ts
FROM node:22-alpine AS deps → build → runtime
CMD ["node", "server.js"]
```

### 3. Dockerfile health-checker

Multi-stage simples em `health-checker/Dockerfile`

### 4. next.config.ts

Adicionar `output: 'standalone'`

### 5. GitHub Actions — .github/workflows/deploy.yml

Jobs: `validate` (lint + types + tests) → `build-push` (matrix portal + health-checker) → `deploy`

### 6. .env.example

Documentar TODAS as variáveis: DATABASE_URL, KEYCLOAK_*, NEXTAUTH_*, HEALTH_CHECKER_SECRET, ANTHROPIC_API_KEY, GOOGLE_API_KEY, CATIA_*_PROVIDER, CATIA_*_MODEL

## Critérios de aceite

- [ ] `docker compose up` sobe tudo sem configuração manual
- [ ] Container migrate encerra antes do portal subir
- [ ] Portal sobe após migrate com service_completed_successfully
- [ ] Keycloak importa realm-cateno.json automaticamente
- [ ] Dockerfile Next.js com output standalone
- [ ] CI/CD valida lint + tipos + testes antes do deploy
- [ ] .env.example completo e documentado
- [ ] Validação E2E: `docker compose up` do zero até portal funcional

## Ao finalizar

```
workflow-advance({ outputs: ["docker-compose.yml", "Dockerfile", "health-checker/Dockerfile", ".github/workflows/deploy.yml"] })
```
