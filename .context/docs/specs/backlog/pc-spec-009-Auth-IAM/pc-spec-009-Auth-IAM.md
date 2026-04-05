# PC-SPEC-009 — Auth / IAM: Configuração Keycloak

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **ID**           | PC-SPEC-009            |
| **Status**       | Backlog                |
| **Prioridade**   | Alta                   |
| **Complexidade** | Média                  |
| **Autor**        | Patrick Iarrocheski    |
| **Branch**       | feat/PC-009-auth-iam   |

## 1. Objetivo

Configurar o realm Keycloak `cateno` com as roles, clients e service accounts necessários para o portal, e implementar o back-channel logout de forma completa. Esta spec complementa o NextAuth.js já implementado em PC-SPEC-002.

> **Decisão de arquitetura:** Manter NextAuth.js 5 + Keycloak OIDC. O Keycloak é o padrão de identidade da Cateno e o NextAuth resolve a integração com Next.js App Router sem código manual frágil.

## 2. O que já existe (PC-SPEC-002)

- NextAuth.js 5 integrado com Keycloak via `KeycloakProvider`
- Sincronização de roles do Keycloak para Prisma após login
- Refresh token automático
- Endpoint `/api/auth/backchannel-logout` criado (mas **incompleto** — ver seção 4.3)
- RBAC híbrido (roles Keycloak + Permission local)

## 3. O que esta spec cobre

### 3.1 Realm `cateno` — configuração

```json
{
  "realm": "cateno",
  "enabled": true,
  "accessTokenLifespan": 300,
  "refreshTokenMaxReuse": 0,
  "refreshTokenLifespan": 1800,
  "ssoSessionMaxLifespan": 36000,
  "bruteForceProtected": true
}
```

### 3.2 Client `portal-cateno` — configuração

```json
{
  "clientId": "portal-cateno",
  "enabled": true,
  "publicClient": false,
  "secret": "<KEYCLOAK_SECRET>",
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false,
  "redirectUris": [
    "https://portal.cateno.com.br/api/auth/callback/keycloak",
    "http://localhost:3000/api/auth/callback/keycloak"
  ],
  "webOrigins": [
    "https://portal.cateno.com.br",
    "http://localhost:3000"
  ]
}
```

### 3.3 Roles do realm

| Role | Descrição |
|------|-----------|
| `admin` | Acesso total — registra apps, gerencia usuários |
| `user` | Acesso padrão — vê todas as aplicações |
| `viewer` | Acesso restrito — vê apenas apps com Permission explícita |

### 3.4 Service account `health-checker`

```json
{
  "clientId": "health-checker",
  "enabled": true,
  "publicClient": false,
  "serviceAccountsEnabled": true,
  "standardFlowEnabled": false,
  "directAccessGrantsEnabled": false
}
```

> O Health Checker usa `client_credentials` para obter um token simples. Na prática, como o PATCH /health usa um `HEALTH_CHECKER_SECRET` estático (ver PC-SPEC-007), este client pode ser simplificado para apenas um secret compartilhado em `.env.local`.

### 3.5 Back-channel logout

No Keycloak, configurar no client `portal-cateno`:
- **Backchannel Logout URL:** `https://portal.cateno.com.br/api/auth/backchannel-logout`
- **Backchannel Logout Session Required:** `true`

### 3.6 Variáveis de ambiente

```env
# .env.local
KEYCLOAK_ID=portal-cateno
KEYCLOAK_SECRET=<secret-do-client-no-keycloak>
KEYCLOAK_ISSUER=https://auth.cateno.com.br/realms/cateno
NEXTAUTH_URL=https://portal.cateno.com.br
NEXTAUTH_SECRET=<secret-aleatorio-32-chars>
HEALTH_CHECKER_SECRET=<secret-para-o-health-checker>
```

### 3.7 Export do realm para versionamento

```bash
# Exportar configuração do realm para o repositório
docker exec keycloak /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export --realm cateno --users realm_file

# Salvar em:
keycloak/realm-cateno.json
```

## 4. Back-channel Logout — implementação obrigatória

O endpoint existe em PC-SPEC-002 mas está incompleto (TODO). Esta spec torna a implementação completa um critério de aceite obrigatório.

**Por que é crítico para uma fintech:** sem back-channel logout funcional, quando um admin revoga uma sessão no Keycloak (ex: funcionário demitido), o usuário continua com acesso ativo no portal até o token expirar naturalmente (até 30 min). Inaceitável.

### 4.1 Como funciona

```
Admin revoga sessão no Keycloak
  → Keycloak faz POST para /api/auth/backchannel-logout
  → Portal valida o logout_token (JWT assinado pelo Keycloak)
  → Portal invalida a sessão local no Prisma
  → Próxima requisição do usuário → redirecionado para /login
```

### 4.2 Implementação completa

```typescript
// src/app/api/auth/backchannel-logout/route.ts
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { prisma } from '@/lib/db';

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`)
);

export async function POST(request: Request) {
  const body = await request.formData();
  const logoutToken = body.get('logout_token') as string;

  if (!logoutToken) {
    return new Response('logout_token ausente', { status: 400 });
  }

  try {
    // Validar JWT assinado pelo Keycloak
    const { payload } = await jwtVerify(logoutToken, JWKS, {
      issuer: process.env.KEYCLOAK_ISSUER,
      audience: process.env.KEYCLOAK_ID,
    });

    // Garantir que é um logout token (não um access token)
    if (!(payload as any).events?.['http://schemas.openid.net/event/backchannel-logout']) {
      return new Response('Token inválido — não é um logout token', { status: 400 });
    }

    const keycloakSub = payload.sub;
    if (!keycloakSub) {
      return new Response('sub ausente no logout token', { status: 400 });
    }

    // Invalidar sessões locais do usuário
    const user = await prisma.user.findFirst({
      where: { keycloakSub },
    });

    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });

      await prisma.auditLog.create({
        data: {
          entity: 'Auth',
          action: 'backchannel_logout',
          userId: user.id,
          changes: { keycloakSub, initiatedBy: 'keycloak' },
        },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Erro no back-channel logout:', err);
    return new Response('Token inválido', { status: 400 });
  }
}
```

### 4.3 Configuração no Keycloak

No client `portal-cateno`, configurar:
- **Backchannel Logout URL:** `https://portal.cateno.com.br/api/auth/backchannel-logout`
- **Backchannel Logout Session Required:** `true`
- **Backchannel Logout Revoke Offline Sessions:** `true`

### 4.4 Dependência: campo `keycloakSub` no model User

O PC-SPEC-002 menciona `keycloakSub` no User — confirmar que o campo existe no schema e está sendo populado no callback de sincronização:

```prisma
model User {
  // ... campos existentes
  keycloakSub  String?  @unique  // sub do Keycloak para correlação no backchannel logout
}
```

## 5. Critérios de Aceite

- [ ] Realm `cateno` criado e exportado como `keycloak/realm-cateno.json`
- [ ] Client `portal-cateno` com redirect URIs corretos (dev e prod)
- [ ] Roles `admin`, `user`, `viewer` criadas no realm
- [ ] Back-channel logout configurado no Keycloak (URL + session required)
- [ ] **Back-channel logout implementado com validação JWT via JWKS** ← obrigatório
- [ ] Sessões Prisma invalidadas imediatamente após logout do Keycloak
- [ ] AuditLog registra o evento `backchannel_logout`
- [ ] Campo `keycloakSub` populado no User e indexado como unique
- [ ] Teste: revogar sessão no Keycloak → portal redireciona para /login
- [ ] `HEALTH_CHECKER_SECRET` definido em `.env.local` e `.env.example`
- [ ] Import automático via `docker compose up` (volume com realm-cateno.json)

## 6. Dependências

- **Depende de:** PC-SPEC-002 (NextAuth já implementado)
- **Bloqueante para:** PC-SPEC-011 (Health Checker precisa do secret)
