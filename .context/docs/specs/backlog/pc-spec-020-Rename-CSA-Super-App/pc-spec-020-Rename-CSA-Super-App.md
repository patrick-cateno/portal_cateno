# SPEC-020 — Renomear Portal Cateno para CSA - CatIA Super App

**Status:** Draft
**Autor:** Patrick Iarrocheski
**Data:** 2026-04-06
**Prioridade:** Alta

---

## 1. Objetivo

Renomear o projeto de "Portal Cateno" para "CSA - CatIA Super App" em **todo** o
codigo-fonte, infraestrutura, configuracoes, Keycloak e banco de dados.
Documentos historicos em `.context/logs/` e `.context/docs/specs/` (ja aprovados)
permanecem inalterados como registro historico.

Tornar o nome completo e o nome reduzido **parametrizaveis** via variaveis de
ambiente, permitindo que administradores alterem os nomes sem modificar codigo.

---

## 2. Motivacao

O nome "Portal Cateno" nao reflete a evolucao do produto, que passou de um portal
simples para um Super App com assistente inteligente (CatIA), catalogo de
aplicacoes, documentacao integrada e orquestracao de microsservicos.

---

## 3. Requisitos

### 3.1 Parametrizacao do nome

| ID | Requisito | Tipo |
|----|-----------|------|
| R01 | `src/config/site.ts` deve expor `name` (nome completo) e `shortName` (nome reduzido) | Obrigatorio |
| R02 | `name` deve ler de `NEXT_PUBLIC_APP_NAME` com fallback `CatIA Super App` | Obrigatorio |
| R03 | `shortName` deve ler de `NEXT_PUBLIC_APP_SHORT_NAME` com fallback `CSA` | Obrigatorio |
| R04 | `description` deve ser atualizada para refletir o novo produto | Obrigatorio |
| R05 | Todos os pontos do codigo que exibem o nome do app devem usar `siteConfig.name` ou `siteConfig.shortName` — nenhum hardcode permitido | Obrigatorio |

### 3.2 Rename no codigo-fonte (`src/`)

| ID | Arquivo | De | Para |
|----|---------|-----|------|
| R10 | `src/config/site.ts` | `name: 'Portal Cateno'` | `name: process.env.NEXT_PUBLIC_APP_NAME ?? 'CatIA Super App'` |
| R11 | `src/app/(auth)/login/page.tsx` | `Bem-vindo ao Portal Cateno` | Usar `siteConfig.name` via import |
| R12 | `src/components/layout/header.tsx` | `title="Portal Cateno"` | Usar `siteConfig.shortName` |
| R13 | `src/lib/catia/prompts/responder.ts` | `Portal Cateno` | Usar `siteConfig.name` |
| R14 | `src/lib/catia/prompts/orchestrator.ts` | `Portal Cateno` | Usar `siteConfig.name` |
| R15 | `src/components/features/ajuda/*.tsx` | Hardcodes `Portal Cateno` | Usar `siteConfig.name` |
| R16 | `src/app/demo/page.tsx` | `Portal Cateno — Demo` | Usar `siteConfig.name` |
| R17 | `src/hooks/use-layout.tsx` | `portal-cateno-sidebar-collapsed` | `csa-sidebar-collapsed` |
| R18 | `src/types/index.ts`, `src/types/api.ts` | Comentarios `Portal Cateno` | `CSA - CatIA Super App` |
| R19 | `src/styles/design-tokens.css` | Comentario `Portal Cateno` | `CSA - CatIA Super App` |
| R20 | `src/__tests__/lib/site-config.test.ts` | `toBe('Portal Cateno')` | `toBe('CatIA Super App')` |
| R21 | `src/__tests__/app/login/login-page.test.tsx` | `Bem-vindo ao Portal Cateno` | Texto atualizado |

### 3.3 Rename na infraestrutura

| ID | Arquivo | Alteracao |
|----|---------|-----------|
| R30 | `package.json` | `"name": "csa-catia-super-app"` |
| R31 | `docker-compose.yml` | Comentarios `Portal Cateno` → `CSA`, `container_name` de `portal-cateno-*` → `csa-*`, `POSTGRES_DB` de `portal_cateno` → `csa`, `DATABASE_URL` atualizada |
| R32 | `.env.example` | `NEXT_PUBLIC_APP_NAME=CatIA Super App`, adicionar `NEXT_PUBLIC_APP_SHORT_NAME=CSA`, `DATABASE_URL` com `csa`, `AUTH_KEYCLOAK_ID=csa`, `AUTH_KEYCLOAK_SECRET=csa-dev-secret` |
| R33 | `.github/workflows/deploy.yml` | `name: Deploy CSA - CatIA Super App` |
| R34 | `infra/Caddyfile` | Dominio `portal.cateno.com.br` → manter (DNS e infra sao independentes do rename) |
| R35 | `scripts/setup.sh` e `scripts/setup.ps1` | Textos de banner atualizados |
| R36 | `prisma/schema.prisma` | Comentario de cabecalho |
| R37 | `.context/workflow/status.yaml` | `name: "CSA - CatIA Super App"` |

### 3.4 Rename no Keycloak

| ID | Arquivo | Alteracao |
|----|---------|-----------|
| R40 | `keycloak/cateno-realm.json` | `"clientId": "portal-cateno"` → `"clientId": "csa"`, `"secret": "portal-cateno-dev-secret"` → `"secret": "csa-dev-secret"` |
| R41 | `docker-compose.yml` | `AUTH_KEYCLOAK_ID: portal-cateno` → `AUTH_KEYCLOAK_ID: csa`, `AUTH_KEYCLOAK_SECRET` atualizado |
| R42 | `.env.example` | `AUTH_KEYCLOAK_ID=csa`, `AUTH_KEYCLOAK_SECRET=csa-dev-secret` |

### 3.5 Rename no banco de dados

| ID | Arquivo | Alteracao |
|----|---------|-----------|
| R50 | `docker-compose.yml` | `POSTGRES_DB: portal_cateno` → `POSTGRES_DB: csa` |
| R51 | `docker-compose.yml` | Todas as `DATABASE_URL` atualizadas com `csa` |
| R52 | `.env.example` | `DATABASE_URL` com `csa` em vez de `portal_cateno` |
| R53 | `prisma/scripts/pg_cron_retention.sql` | Se referenciar `portal_cateno`, atualizar |

### 3.6 Rename em documentacao ativa

| ID | Arquivo | Alteracao |
|----|---------|-----------|
| R60 | `CLAUDE.md` | `Portal Cateno` → `CSA - CatIA Super App` onde se refere ao nome do produto |
| R61 | `AGENTS.md` | Sem alteracao necessaria (nao menciona o nome do produto) |

### 3.7 Exclusoes — NAO alterar

| Escopo | Motivo |
|--------|--------|
| `.context/logs/` | Registro historico — era "Portal Cateno" naquela data |
| `.context/docs/specs/` (specs ja aprovadas, 001-019) | Documentos aprovados no passado |
| `criar-specs.ps1`, `git-specs-commit.ps1` | Scripts utilitarios locais/temporarios |
| `.env.local` / `.env` | Arquivos locais do desenvolvedor (cada dev atualiza o seu) |

---

## 4. Pre-requisitos para os desenvolvedores

Apos o merge desta branch, **todos os devs devem**:

```bash
# 1. Recriar volumes Docker (banco + Keycloak)
docker compose down -v

# 2. Subir servicos novamente (reimporta realm + recria banco)
docker compose up -d

# 3. Atualizar .env.local com as novas variaveis
#    AUTH_KEYCLOAK_ID=csa
#    AUTH_KEYCLOAK_SECRET=csa-dev-secret
#    DATABASE_URL="postgresql://cateno:cateno_dev@localhost:5432/csa?schema=public"
#    NEXT_PUBLIC_APP_NAME=CatIA Super App
#    NEXT_PUBLIC_APP_SHORT_NAME=CSA

# 4. Rodar migrations no novo banco
npx prisma db push

# 5. Seed (se houver)
npx prisma db seed
```

---

## 5. Cenarios de Teste

| ID | Cenario | Resultado esperado |
|----|---------|-------------------|
| T01 | `tsc --noEmit` | Compilacao limpa |
| T02 | `vitest run --reporter=verbose` | Todos os testes passando |
| T03 | Pagina de login renderiza | Mostra "Bem-vindo ao CatIA Super App" |
| T04 | Header tooltip do logo | Mostra "CSA" |
| T05 | Documentacao `/ajuda` | Referencias ao novo nome |
| T06 | Prompts do CatIA | Usam nome parametrizado |
| T07 | `NEXT_PUBLIC_APP_NAME=Outro Nome` | UI exibe "Outro Nome" em vez de "CatIA Super App" |
| T08 | `docker compose config` | Container names com prefixo `csa-` |
| T09 | `grep -r "Portal Cateno" src/` | Zero resultados |
| T10 | `docker compose down -v && docker compose up -d` | Keycloak importa realm com client `csa`, banco `csa` criado |
| T11 | Login via Keycloak | Funciona com client ID `csa` |
| T12 | `grep -r "portal-cateno" docker-compose.yml` | Zero resultados (exceto Caddyfile dominio) |

---

## 6. Consideracoes de Seguranca

| Risco | Mitigacao |
|-------|-----------|
| Env vars expostas no bundle | `NEXT_PUBLIC_*` sao intencionalmente publicas — contem apenas nomes de exibicao, sem secrets |
| Client secret do Keycloak | Muda de `portal-cateno-dev-secret` para `csa-dev-secret` — ambos sao valores de dev, nao usados em producao |
| Banco de dados | Volume recriado — dados de dev sao descartaveis. Em producao futura, exigira plano de migracao |

---

## 7. Plano de Implementacao

1. Atualizar `src/config/site.ts` com `name`, `shortName`, `description` parametrizaveis
2. Substituir todos os hardcodes em `src/` por referencias a `siteConfig`
3. Atualizar `keycloak/cateno-realm.json` (client ID e secret)
4. Atualizar `docker-compose.yml` (containers, banco, auth, comentarios)
5. Atualizar `.env.example` com novas variaveis e valores
6. Atualizar infra (workflows, scripts, prisma comment, workflow status)
7. Atualizar `CLAUDE.md`
8. Atualizar testes
9. Rodar `tsc --noEmit` + `vitest run --reporter=verbose`
10. Verificar com `grep` que nenhum hardcode restou em `src/`
11. Documentar instrucoes de recriacao de ambiente no commit/PR
