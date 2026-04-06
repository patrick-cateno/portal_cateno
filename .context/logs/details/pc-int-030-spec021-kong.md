# PC-INT-030 — CSA-SPEC-021: API Gateway Kong OSS

**Data:** 2026-04-06
**Inicio:** 14:47 -03 | **Fim:** 15:11 -03
**Branch:** feat/CSA-021-api-gateway-kong

## Implementacao

### Fase 1 — Infraestrutura
- Adicionados `kong-db`, `kong-migration` e `kong` ao `docker-compose.yml`
- Imagem: `kong:3.9` (spec original dizia `kong:3.6-alpine` que nao existe)
- Containers: `csa-kong-db`, `csa-kong-migration`, `csa-kong`
- Volume `kong_data` adicionado
- `KONG_DB_PASSWORD` no `.env.example`

### Fase 2 — Configuracao
- Criado `scripts/kong-setup.sh` — idempotente (PUT para services, POST com check para routes/plugins)
- Service `portal-shell` → `http://host.docker.internal:3000`
- Caddyfile atualizado: `reverse_proxy kong:8000` (antes era `portal:3000`)

### Fase 3 — ms-reservas (preparatorio)
- Service `ms-reservas` → `http://ms-reservas:3000`
- Rota `/api/reservas/health` — sem JWT (Kong nao bloqueia)
- Rota `/api/reservas` — com plugin JWT + rate-limiting na ROTA (nao no service)
- Correcao: campo `priority` removido (nao suportado no Kong 3.9)
- Correcao: plugins movidos de service-level para route-level para que /health funcione sem JWT

### Fase 4 — Plugins globais
- Plugin `correlation-id` global → header `X-Request-ID` com UUID

### Fase 5 — PULADA (documentacao ja atualizada externamente)

## Criterios de Aceite Validados

| CA | Resultado |
|----|-----------|
| CA-001 | OK — Kong sobe, `database.reachable: true` |
| CA-002 | OK — `curl -L http://localhost:8000/` retorna 200 (Next.js via Kong) |
| CA-004 | OK — `curl http://localhost:8000/api/reservas/espacos` retorna 401 (sem JWT) |
| CA-005 | Parcial — retorna 503 (ms nao existe), mas NAO 401, confirmando que a rota health nao tem JWT |
| CA-007 | OK — header `X-Request-ID` com UUID presente em todas as respostas |
| CA-008 | Parcial — em dev, porta 8001 exposta (necessario para setup). Em prod, remover a linha |

## Pendente para quando ms-reservas existir

- CA-003: testar com JWT valido → 200
- CA-005: confirmar 200 com body `{"status":"online"}`
- CA-006: testar rate limiting (101 req/min → 429)
