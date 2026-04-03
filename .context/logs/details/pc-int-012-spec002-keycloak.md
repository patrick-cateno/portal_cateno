# PC-INT-012 — SPEC-002: integração Keycloak como IdP + RBAC híbrido

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-012                      |
| **Início**     | 2026-04-03T11:30 -03            |
| **Fim**        | 2026-04-03T11:45 -03            |
| **Duração**    | ≈15 min                         |
| **Branch**     | —                               |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick percebeu que Keycloak não constava na SPEC-002 de autenticação: "na spec002, eu esqueci de mencionar sobre a utilização de keycloak, a spec está aderente?"

## Decisões (via AskUserQuestion)

1. **Papel do Keycloak**: IdP (Identity Provider) — toda gestão de identidade no Keycloak
2. **Modelo de roles**: RBAC Híbrido — realm roles no Keycloak + Permission granular local
3. **Gestão de credenciais**: Todas via Keycloak (login, reset, MFA, brute force)
4. **Status**: Keycloak já operacional no ambiente

## O que foi feito

Reescrita extensiva da SPEC-002:

### Removido

- CredentialsProvider do NextAuth
- Campo `password` no model User
- Model PasswordReset
- bcrypt como dependência
- Páginas forgot-password/reset-password
- Tabs na página de login
- Rate limiting local (Keycloak controla brute force)

### Adicionado

- KeycloakProvider via OIDC com scope "openid profile email roles"
- Campo `keycloakSub` no model User
- Model Permission para RBAC granular local
- Endpoint `/api/auth/backchannel-logout` (back-channel logout)
- Front-channel logout para Keycloak
- Token refresh via Keycloak refresh_token
- Resiliência para indisponibilidade do Keycloak
- Env vars: AUTH_KEYCLOAK_ID, AUTH_KEYCLOAK_SECRET, AUTH_KEYCLOAK_ISSUER
- Login simplificado: botão único "Entrar com Login Cateno"
- 13 cenários de teste (eram 10)

## Arquivos modificados

- `pc-spec-002-autenticacao.md` — reescrita completa
