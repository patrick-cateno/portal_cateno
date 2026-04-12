---
sidebar_position: 3
title: Autenticação
---

# Autenticação

## Fluxo OAuth2 PKCE

O Portal Cateno usa OAuth2 com PKCE (Proof Key for Code Exchange) via Keycloak:

```
1. Portal gera code_verifier (64 bytes) + code_challenge (SHA256 base64url) + state
2. Redireciona para Keycloak /authorize com PKCE params
3. Usuário faz login no Keycloak
4. Callback → valida state → troca code por tokens via POST /token
5. Tokens salvos em memória (nunca em localStorage)
6. Interceptor injeta Bearer em toda chamada
7. Refresh silencioso antes do token expirar
```

## Estrutura do JWT

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Patrick Iarrocheski",
  "email": "patrick@cateno.com.br",
  "realm_access": {
    "roles": ["admin", "financeiro"]
  },
  "scope": "openid profile email",
  "iss": "https://auth.cateno.com.br",
  "exp": 1712930400,
  "iat": 1712926800
}
```

| Campo                | Descrição                                                  |
| -------------------- | ---------------------------------------------------------- |
| `sub`                | UUID imutável do usuário no Keycloak — usar como `user_id` |
| `name`               | Nome do usuário (ler em runtime, nunca persistir)          |
| `realm_access.roles` | Roles do usuário para autorização                          |
| `iss`                | Issuer — deve ser validado                                 |
| `exp`                | Timestamp de expiração                                     |

## Roles disponíveis

| Role         | Scopes                                   |
| ------------ | ---------------------------------------- |
| `admin`      | Todos                                    |
| `financeiro` | `fatura:read/write`, `conciliacao:read`  |
| `cartoes`    | `cartao:read/write`, `fatura:read/write` |
| `compliance` | `fraude:read/write`, `kyc:read/write`    |
| `analytics`  | `dashboard:read`, `metricas:read`        |
| `readonly`   | Apenas scopes `:read`                    |

## Validação no microsserviço

Seu microsserviço recebe o JWT já validado pelo API Gateway. Mas você deve:

1. **Validar assinatura** via JWKS (`IDP_JWKS_URL`)
2. **Verificar issuer** (`IDP_ISSUER`)
3. **Verificar expiração** (`exp`)
4. **Extrair roles** para autorização específica

:::warning Regras invioláveis

- Nunca implemente autenticação própria
- Nunca crie tabela de usuários
- Nunca persista nome, email ou cargo do JWT
- `user_id` em qualquer tabela = `sub` do JWT
  :::
