# PC-SPEC-016 — Back-channel Logout (Implementação Completa)

| Campo            | Valor                             |
| ---------------- | --------------------------------- |
| **ID**           | PC-SPEC-016                       |
| **Status**       | Concluída (2026-04-05)            |
| **Prioridade**   | Alta — segurança crítica fintech  |
| **Complexidade** | Média                             |
| **Origem**       | Falha A4 nos testes manuais       |
| **Autor**        | Patrick Iarrocheski               |
| **Branch**       | feat/PC-016-backchannel-logout    |

## 1. Problema identificado nos testes

**Teste A4 falhou:** após fazer Sign Out de uma sessão ativa no Keycloak Admin Console,
o portal continuou funcionando normalmente — a sessão não foi invalidada.

**Causa raiz:** O endpoint `/api/auth/backchannel-logout` valida o JWT do `logout_token`
corretamente, mas a busca da sessão no Prisma usa `keycloakSub` que pode não estar
sendo populado corretamente, ou o `prisma.session.deleteMany` não está encontrando
os registros corretos.

**Por que é crítico para fintech:** funcionário desligado pode ter acesso revogado
no Keycloak, mas continuar com sessão ativa no portal por até 30 minutos (TTL do token).

## 2. O que já existe (não reescrever)

- `src/app/api/auth/backchannel-logout/route.ts` — endpoint existe, valida JWT via `jose`
- `keycloakSub` no model `User` — campo existe no schema
- Callback de sincronização no `src/lib/auth.ts` — popula dados do Keycloak no login

## 3. Diagnóstico detalhado

### 3.1 Verificar se keycloakSub está sendo populado

```bash
# Após fazer login, verificar se o campo está preenchido
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT id, email, \"keycloakSub\" FROM \"User\" LIMIT 5;"
```

Se `keycloakSub` estiver `NULL`, o callback do NextAuth não está salvando o campo.

### 3.2 Verificar estrutura da sessão no Prisma

```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT s.id, s.\"userId\", s.expires FROM \"Session\" s LIMIT 5;"
```

### 3.3 Verificar se o Keycloak está chamando o endpoint

No Keycloak Admin Console → Realm Settings → Events → Admin events:
verificar se há evento de backchannel logout sendo disparado.

## 4. Correções necessárias

### 4.1 Garantir que keycloakSub é salvo no login

Verificar `src/lib/auth.ts` callback `jwt` e `signIn`:

```typescript
// src/lib/auth.ts — callback jwt
async jwt({ token, account, profile }) {
  if (account && profile) {
    token.keycloakSub = profile.sub;  // ← garantir que está aqui
    // salvar no banco
    await prisma.user.update({
      where: { id: token.id as string },
      data: { keycloakSub: profile.sub },
    });
  }
  return token;
},
```

### 4.2 Corrigir invalidação de sessão no endpoint

```typescript
// src/app/api/auth/backchannel-logout/route.ts
export async function POST(request: Request) {
  const body = await request.formData();
  const logoutToken = body.get('logout_token') as string;

  if (!logoutToken) {
    return new Response('logout_token ausente', { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(logoutToken, JWKS, {
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      audience: process.env.AUTH_KEYCLOAK_ID,
    });

    // Verificar que é um logout token
    const events = (payload as any).events;
    if (!events?.['http://schemas.openid.net/event/backchannel-logout']) {
      return new Response('Não é um logout token', { status: 400 });
    }

    const keycloakSub = payload.sub;
    if (!keycloakSub) {
      return new Response('sub ausente', { status: 400 });
    }

    // Buscar usuário pelo keycloakSub
    const user = await prisma.user.findFirst({
      where: { keycloakSub },
    });

    if (user) {
      // Invalidar TODAS as sessões do usuário
      const deleted = await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      await prisma.auditLog.create({
        data: {
          entity: 'Auth',
          action: 'backchannel_logout',
          userId: user.id,
          changes: {
            keycloakSub,
            sessionsDeleted: deleted.count,
            initiatedBy: 'keycloak',
          },
        },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error('[backchannel-logout] Erro:', err.message);
    return new Response('Token inválido', { status: 400 });
  }
}
```

### 4.3 Configurar Keycloak para enviar backchannel logout

No Keycloak Admin Console:
1. Selecionar realm `cateno`
2. Clients → `portal-cateno` → Settings
3. Em **Logout Settings**:
   - **Backchannel Logout URL:** `http://host.docker.internal:3000/api/auth/backchannel-logout`
   - **Backchannel Logout Session Required:** ON
   - **Backchannel Logout Revoke Offline Sessions:** ON
4. Salvar

> Em produção, trocar `host.docker.internal:3000` pela URL real do portal.

### 4.4 Exportar realm atualizado

Após configurar o Keycloak:

```bash
docker exec portal-cateno-keycloak \
  /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export --realm cateno --users realm_file

docker cp portal-cateno-keycloak:/tmp/export/cateno-realm.json \
  ./keycloak/realm-cateno.json
```

Commitar o `realm-cateno.json` atualizado para que futuros `docker compose up`
configurem o backchannel automaticamente.

## 5. Teste de validação

```bash
# 1. Fazer login no portal
# 2. No Keycloak Admin Console → Users → [usuário] → Sessions → Sign Out
# 3. Verificar nos logs do portal:
docker compose logs portal --tail=20 | grep -i "backchannel"
# Esperado: "[backchannel-logout] sessionsDeleted: 1"

# 4. Verificar no banco que a sessão foi removida:
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT COUNT(*) FROM \"Session\";"
# Esperado: COUNT menor que antes

# 5. Tentar fazer qualquer ação no portal com a aba aberta
# Esperado: redirecionado para /login imediatamente
```

## 6. Critérios de aceite

- [ ] `keycloakSub` preenchido na tabela `User` após login
- [ ] Endpoint `/api/auth/backchannel-logout` retorna 200 ao receber logout_token válido
- [ ] `prisma.session.deleteMany` remove sessões do usuário correto
- [ ] AuditLog registra `backchannel_logout` com `sessionsDeleted`
- [ ] Keycloak configurado com Backchannel Logout URL
- [ ] `realm-cateno.json` atualizado e commitado
- [ ] **Teste A4 aprovado:** Sign Out no Keycloak → portal redireciona para /login

## 7. Dependências

- **Depende de:** PC-SPEC-009 (Auth/IAM — Keycloak), PC-SPEC-002 (NextAuth)
- **Não é bloqueante** para outras specs
