# PC-INT-029 — SPEC-020: Rename Portal Cateno → CSA - CatIA Super App

**Data:** 2026-04-06
**Inicio:** 12:29 -03 | **Fim:** 13:10 -03
**Branch:** feat/PC-020-rename-csa-super-app

## Contexto

Renomear o projeto de "Portal Cateno" para "CSA - CatIA Super App" em todo o
codigo-fonte, infraestrutura e configuracoes. Nome parametrizavel via env vars.

## Alteracoes realizadas

### Codigo-fonte (src/)
- `src/config/site.ts` — `name` e `shortName` parametrizaveis via env vars
- `src/app/(auth)/login/page.tsx` — "Bem-vindo ao CatIA Super App"
- `src/components/layout/header.tsx` — title "CSA"
- `src/lib/catia/prompts/responder.ts` e `orchestrator.ts` — usam siteConfig.name
- `src/components/features/ajuda/*.tsx` — todas as referencias atualizadas
- `src/app/demo/page.tsx` — "CSA — Demo"
- `src/hooks/use-layout.tsx` — storage key `csa-sidebar-collapsed`
- `src/types/index.ts`, `api.ts`, `design-tokens.css` — comentarios atualizados
- Testes: `site-config.test.ts`, `login-page.test.tsx` atualizados

### Infraestrutura
- `package.json` — name `csa-catia-super-app`
- `package-lock.json` — regenerado
- `docker-compose.yml` — containers `csa-*`, banco `csa`, client `csa`
- `.env.example` — novas variaveis e valores
- `.github/workflows/deploy.yml` — nome atualizado
- `scripts/setup.sh` e `setup.ps1` — banners atualizados
- `prisma/schema.prisma` e `pg_cron_retention.sql` — comentarios

### Keycloak
- `keycloak/cateno-realm.json` — clientId `csa`, secret `csa-dev-secret`

### Documentacao
- `CLAUDE.md` — nome do projeto atualizado
- `README.md` — titulo e descricao

### NAO alterados (historico)
- `.context/logs/` e `.context/docs/specs/` existentes

## Validacao
- `tsc --noEmit` — compilacao limpa
- `vitest run --reporter=verbose` — 37 files, 241 testes passando
- `grep "Portal Cateno" src/` — zero resultados
