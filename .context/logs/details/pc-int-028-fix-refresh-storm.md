# PC-INT-028 — Fix: Refresh Token Retry Storm

**Data:** 2026-04-06  
**Início:** 06:19 -03 | **Fim:** 06:20 -03

## Contexto

Usuário reportou logs do Keycloak com múltiplos `REFRESH_TOKEN_ERROR` ("Token is not active")
disparados em sequência rápida (~500ms entre cada).

## Diagnóstico

O JWT callback do NextAuth executa `refreshAccessToken()` para **cada request** quando o
token está a menos de 5 minutos de expirar. Com requests concorrentes:

1. Request A chama `refreshAccessToken()` → Keycloak rotaciona o refresh token
2. Requests B, C, D chamam `refreshAccessToken()` com o refresh token **antigo** (já invalidado)
3. Keycloak rejeita com "Token is not active" — gerando a storm nos logs

## Correção

Adicionado **singleton lock** em `src/lib/auth-refresh.ts`:
- Variável `inflightRefresh` guarda a Promise da chamada em andamento
- Se já existe um refresh em voo, chamadores concorrentes aguardam a mesma Promise
- `finally()` limpa o lock quando o refresh resolve (sucesso ou erro)
- Função interna `doRefresh()` contém a lógica original

## Validação

- `tsc --noEmit`: compilação limpa
- `vitest run src/__tests__/lib/auth-refresh.test.ts`: 4/4 testes passando
