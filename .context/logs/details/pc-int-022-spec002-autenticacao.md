# PC-INT-022 — SPEC-002: Sistema de Autenticacao Keycloak + NextAuth v5

| Campo          | Valor                    |
| -------------- | ------------------------ |
| **ID**         | PC-INT-022               |
| **Inicio**     | 2026-04-03T20:19 -03     |
| **Fim**        | 2026-04-03T21:12 -03     |
| **Duracao**    | ~53 min                  |
| **Branch**     | feat/PC-002-autenticacao |
| **Tokens in**  | ~2.500                   |
| **Tokens out** | ~12.000                  |

## Contexto

Implementacao completa da SPEC-002 (Sistema de Autenticacao). Inclui NextAuth.js 5 com Keycloak como IdP, proxy.ts (Next.js 16), RBAC hibrido, pagina de login, back-channel logout e testes.

## O que foi feito

### Pacotes instalados
- `next-auth@beta` (v5)
- `@auth/prisma-adapter`
- `jose` (validacao JWT)

### Arquivos criados (17 novos)

| Arquivo | Descricao |
| --- | --- |
| `src/types/next-auth.d.ts` | Type augmentation: Session.user com id/roles/permissions, JWT com tokens |
| `src/lib/keycloak.ts` | Utilitarios: logout URL, token endpoint, JWKS validation, extractKeycloakRoles |
| `src/lib/audit.ts` | createAuditLog() + AUTH_ACTIONS constants + getClientInfo() |
| `src/lib/auth-refresh.ts` | refreshAccessToken() via Keycloak token endpoint |
| `src/lib/auth.ts` | NextAuth config: KeycloakProvider, PrismaAdapter, JWT/session callbacks, events, role sync |
| `src/lib/auth-helpers.ts` | requireAuth(), requireRole(), requirePermission() com unauthorized()/forbidden() |
| `src/lib/auth-actions.ts` | Server actions: loginAction(), logoutAction() |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth GET/POST handlers |
| `src/app/api/auth/backchannel-logout/route.ts` | POST handler: valida logout_token JWT, invalida sessoes |
| `src/proxy.ts` | Protecao de rotas com getToken() — usa proxy.ts (Next.js 16, nao middleware.ts) |
| `src/components/providers/session-provider.tsx` | Client wrapper do SessionProvider |
| `src/app/(auth)/login/page.tsx` | Pagina de login: gradient teal, card branco, CatenoLogo |
| `src/app/(auth)/login/login-button.tsx` | Client component: botao "Entrar com Login Cateno" com loading/error |
| `src/app/unauthorized.tsx` | Pagina 401 |
| `src/app/forbidden.tsx` | Pagina 403 |

### Arquivos modificados (2)

| Arquivo | Acao |
| --- | --- |
| `next.config.ts` | Adicionado `experimental: { authInterrupts: true }` |
| `src/app/layout.tsx` | Adicionado SessionProvider wrapper |

### Testes criados (6 arquivos, 49 novos testes)

| Arquivo | Testes |
| --- | --- |
| `src/__tests__/lib/audit.test.ts` | 6 |
| `src/__tests__/lib/keycloak.test.ts` | 6 |
| `src/__tests__/lib/auth-refresh.test.ts` | 4 |
| `src/__tests__/lib/auth-helpers.test.ts` | 10 |
| `src/__tests__/app/login/login-page.test.tsx` | 6 |
| `src/__tests__/proxy.test.ts` | 7 |

### Fixes durante build

- `src/lib/keycloak.ts`: env vars lidas em runtime (nao top-level) para funcionar em testes
- `src/lib/audit.ts`: `changes` usa `Prisma.JsonNull` em vez de `null` raw; `getClientInfo` retorna `undefined` em vez de `null`
- `src/components/ui/input.tsx`: `Omit<..., 'size'>` para evitar conflito com `HTMLInputElement.size: number`

## Resultados

- **Build**: OK (Next.js 16.2.2 Turbopack)
- **Testes**: 118/118 passando (17 test files)
- **Rotas geradas**: `/login` (static), `/api/auth/[...nextauth]` (dynamic), `/api/auth/backchannel-logout` (dynamic)

## Decisoes tecnicas

1. **proxy.ts (nao middleware.ts)** — Next.js 16 deprecou middleware
2. **JWT strategy** — session validation via JWT, PrismaAdapter para persistir User/Account
3. **authInterrupts: true** — habilita unauthorized()/forbidden() do next/navigation
4. **Role sync a cada login** — Keycloak roles sincronizadas via JWT callback
5. **Permissions locais** — model Permission no banco do portal
