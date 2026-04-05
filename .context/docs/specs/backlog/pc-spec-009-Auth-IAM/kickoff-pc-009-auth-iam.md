# Kickoff — PC-SPEC-009: Auth / IAM — Configuração Keycloak

**Agente:** security-auditor
**Wave:** 1 — pode iniciar em paralelo com pc-008
**Estimativa:** ~8.5h

## Antes de começar

Leia a spec completa:
```
.context/docs/specs/backlog/pc-009-Auth-IAM/pc-spec-009-Auth-IAM.md
```

## O que já existe — NÃO alterar

PC-SPEC-002 já implementou: NextAuth.js 5, KeycloakProvider, PrismaAdapter,
sincronização de roles, endpoint `/api/auth/backchannel-logout` (incompleto).

## O que implementar

1. Configurar realm `cateno` no Keycloak local (Docker)
2. Client `portal-cateno` com PKCE S256, redirect URIs dev e prod
3. Roles: `admin`, `user`, `viewer` no realm
4. Back-channel logout no Keycloak: URL + session required + revoke offline sessions
5. **Implementar `/api/auth/backchannel-logout/route.ts` completo** (ver spec seção 4.2)
   - Validar JWT com `jose` via JWKS do Keycloak
   - Invalidar sessões Prisma
   - Registrar no AuditLog
6. Confirmar campo `keycloakSub` no model User (spec seção 4.4)
7. Exportar realm para `keycloak/realm-cateno.json`
8. Volume no `docker-compose.yml` para import automático do realm
9. `HEALTH_CHECKER_SECRET` em `.env.example`

## Critério crítico — segurança fintech

O back-channel logout com validação JWT via JWKS é **obrigatório**.
Sem ele, sessões revogadas no Keycloak continuam ativas no portal.
Instalar: `npm install jose`

## Critérios de aceite

- [ ] realm-cateno.json versionado no repositório
- [ ] Client com redirect URIs corretos (dev e prod)
- [ ] Roles admin, user, viewer criadas
- [ ] Back-channel logout configurado no Keycloak
- [ ] Endpoint implementado com validação JWT via JWKS
- [ ] Sessões Prisma invalidadas após revogação
- [ ] AuditLog registra backchannel_logout
- [ ] Teste E2E: revogar no Keycloak → portal redireciona para /login
- [ ] Import automático via docker compose

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "security-auditor", to: "backend-specialist", artifacts: ["keycloak/realm-cateno.json", "src/app/api/auth/backchannel-logout/route.ts"] })
```
