# PC-INT-031 — Fix: Bearer JWT auth para endpoints admin

**Data:** 2026-04-06
**Inicio:** 22:48 -03 | **Fim:** 22:53 -03
**Branch:** fix/CSA-022-bearer-jwt-admin-endpoints

## Problema

O endpoint POST /api/applications (e outros admin) falhava com 500 quando
recebia um Bearer JWT de service account sem sessao NextAuth ativa.
A funcao auth() do NextAuth lanca excecao nesse cenario.

## Solucao

Criado `src/lib/api-auth.ts` com funcao `authenticateRequest()`:
1. Tenta sessao NextAuth via auth() (catch para evitar excecao)
2. Se nao houver sessao, valida Bearer JWT contra Keycloak JWKS
3. Extrai roles de realm_access e resource_access do token
4. Aceita roles `admin` ou `admin:registry`

## Endpoints corrigidos

- `POST /api/applications` — registrar aplicacoes
- `POST /api/tools` — registrar tools de microsservicos
- `PATCH /api/tools/[id]` — atualizar tools

## Alteracoes

- `src/lib/api-auth.ts` — novo: authenticateRequest()
- `src/lib/keycloak.ts` — exportou getJwks() (antes era interna)
- `src/app/api/applications/route.ts` — POST usa authenticateRequest
- `src/app/api/tools/route.ts` — POST usa authenticateRequest
- `src/app/api/tools/[id]/route.ts` — PATCH usa authenticateRequest

## Validacao

- tsc --noEmit: limpo
- vitest (9 files, 55 tests): passando
- Suite completa nao executada por limitacao de memoria (Docker + dev server)
