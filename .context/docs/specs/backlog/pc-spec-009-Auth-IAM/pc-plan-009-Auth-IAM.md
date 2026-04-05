# PC-PLAN-009 — Auth / IAM

**Status:** Backlog
**Agente:** security-auditor
**Prioridade:** Alta
**Depende de:** PC-SPEC-002 (NextAuth já feito)

## Critérios de aceitação

- [ ] realm-cateno.json versionado no repositório
- [ ] Client portal-cateno com redirect URIs dev e prod
- [ ] Roles admin, user, viewer no realm
- [ ] Back-channel logout configurado no Keycloak (URL + session required)
- [ ] **Back-channel logout implementado com validação JWT via JWKS** ← obrigatório
- [ ] Sessões Prisma invalidadas imediatamente após revogação
- [ ] AuditLog registra evento backchannel_logout
- [ ] Teste ponta a ponta: revogar no Keycloak → portal redireciona
- [ ] Import automático via docker compose

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Configurar realm cateno no Keycloak local | 1h |
| 2 | Client portal-cateno com roles e redirect URIs | 1h |
| 3 | Configurar back-channel logout no Keycloak | 30min |
| 4 | Confirmar campo keycloakSub no User (schema + callback) | 30min |
| 5 | Implementar validação JWT com `jose` no endpoint | 2h |
| 6 | Invalidação de sessões Prisma + AuditLog | 1h |
| 7 | Exportar realm para keycloak/realm-cateno.json | 30min |
| 8 | Volume no docker-compose.yml para import automático | 30min |
| 9 | Teste E2E: revogar sessão no Keycloak Admin → verificar redirect | 1h |
| 10 | Documentar variáveis em .env.example | 30min |
| **Total** | | **~8.5h** |

## Artefatos de saída

- `keycloak/realm-cateno.json`
- `src/app/api/auth/backchannel-logout/route.ts` — implementação completa
- `.env.example` atualizado
