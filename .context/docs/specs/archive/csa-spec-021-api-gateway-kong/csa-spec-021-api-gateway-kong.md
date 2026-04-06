# PC-SPEC-021 — API Gateway Kong OSS

> **Status:** Rascunho — aguardando aprovação
> **Autor:** Patrick Iarrocheski
> **Data:** 2026-04-06
> **Versão:** 1.0

---

## 1. Visão Geral

### 1.1 Propósito

Substituir o papel de roteamento atualmente assumido pelo Next.js (catFetch)
por um API Gateway real (Kong OSS), centralizando validação de JWT, rate limiting,
roteamento para microsserviços e rastreabilidade de requisições.

### 1.2 O que esta spec cobre

- Adição do Kong OSS ao `docker-compose.yml` do Portal Cateno
- Reconfiguração do Caddy para apontar para o Kong
- Configuração de serviços e rotas no Kong para o Portal Shell e microsserviços
- Plugin de JWT centralizado no Kong
- Plugin de rate limiting por serviço
- Plugin de correlation ID para rastreabilidade
- Script de setup do Kong (`scripts/kong-setup.sh`)

### 1.3 O que esta spec NÃO cobre

- Migração de microsserviços existentes (cada um terá sua própria spec de adaptação)
- Kong Enterprise (usar OSS)
- Substituição do Keycloak — Kong apenas valida o JWT emitido pelo Keycloak
- Kubernetes Ingress — manter Docker Compose por ora

### 1.4 Motivação

Com o crescimento do ecossistema de microsserviços, o Next.js não deve ser o
ponto de entrada de cada chamada de API. O Kong resolve:

| Problema atual | Solução com Kong |
|---|---|
| JWT validado em cada microsserviço individualmente | JWT validado uma vez no Kong |
| Sem rate limiting por serviço | Rate limit configurável por rota/serviço |
| Sem visibilidade de tráfego entre serviços | Logs centralizados no Kong |
| API Routes no Next.js para cada microsserviço | Roteamento declarativo no Kong |

---

## 2. Arquitetura

### 2.1 Antes

```
Internet → Caddy :443 → Next.js :3000 → (microsserviços via catFetch)
```

### 2.2 Depois

```
Internet
    ↓ HTTPS
  Caddy :443          ← TLS automático (sem mudança)
    ↓ HTTP
  Kong :8000          ← gateway: JWT, rate limit, roteamento, logs
    ↙              ↘
Next.js :3000    ms-reservas :3000
(portal shell)   ms-outro :3000
                 ms-outro :3000
```

### 2.3 Fluxo de uma requisição ao ms-reservas

```
1. Browser → Caddy (HTTPS)
2. Caddy   → Kong (HTTP interno)
3. Kong    → valida JWT via Keycloak JWKS
4. Kong    → checa rate limit
5. Kong    → injeta X-Consumer-ID, X-Request-ID
6. Kong    → roteia para ms-reservas:3000
7. ms-reservas → processa sem precisar validar JWT novamente
8. Resposta sobe o mesmo caminho
```

---

## 3. Alterações no docker-compose.yml

### 3.1 Adicionar serviços

```yaml
services:

  # ── Kong Database ──────────────────────────────────────
  kong-db:
    image: postgres:16-alpine
    container_name: cateno-kong-db
    environment:
      POSTGRES_DB: kong
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: ${KONG_DB_PASSWORD}
    volumes:
      - kong_data:/var/lib/postgresql/data
    networks:
      - cateno-internal
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "kong"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ── Kong Migration ─────────────────────────────────────
  kong-migration:
    image: kong:3.6-alpine
    container_name: cateno-kong-migration
    command: kong migrations bootstrap
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_DATABASE: kong
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: ${KONG_DB_PASSWORD}
    networks:
      - cateno-internal
    depends_on:
      kong-db:
        condition: service_healthy
    restart: on-failure

  # ── Kong Gateway ───────────────────────────────────────
  kong:
    image: kong:3.6-alpine
    container_name: cateno-kong
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_DATABASE: kong
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: ${KONG_DB_PASSWORD}
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_PROXY_LISTEN: 0.0.0.0:8000
      KONG_ADMIN_LISTEN: 127.0.0.1:8001
    ports:
      - "8000:8000"    # proxy — Caddy aponta aqui
      - "8001:8001"    # admin API — localhost only
    networks:
      - cateno-internal
    depends_on:
      - kong-migration
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  kong_data:

networks:
  cateno-internal:
    driver: bridge
```

### 3.2 Variáveis de ambiente (.env)

```env
# Kong
KONG_DB_PASSWORD=kong_senha_segura_aqui
```

---

## 4. Alteração no Caddyfile

```caddyfile
# Antes
portal-cateno.com.br {
    reverse_proxy portal:3000
}

# Depois — Caddy aponta para o Kong
portal-cateno.com.br {
    reverse_proxy kong:8000
}
```

O Caddy continua responsável apenas por TLS e entrada HTTP/HTTPS.

---

## 5. Script de configuração do Kong

Criar `scripts/kong-setup.sh` — executado uma vez após o Kong subir.
Em CI/CD, executar após `docker-compose up -d kong`.

```bash
#!/bin/bash
set -e

KONG_ADMIN="http://localhost:8001"

echo "Aguardando Kong inicializar..."
until curl -s $KONG_ADMIN/status > /dev/null; do sleep 2; done
echo "Kong pronto."

# ── JWKS URI para validação de JWT ───────────────────────
# Kong precisa do JWKS para validar tokens do Keycloak
JWKS_URI="${IDP_JWKS_URL:-https://auth.cateno.com.br/.well-known/jwks.json}"

# ── Serviço: Portal Shell (Next.js) ──────────────────────
echo "Configurando portal-shell..."
curl -s -X POST $KONG_ADMIN/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "portal-shell",
    "url": "http://portal:3000"
  }'

curl -s -X POST $KONG_ADMIN/services/portal-shell/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "portal-route",
    "paths": ["/"],
    "strip_path": false,
    "priority": 0
  }'

# ── Serviço: ms-reservas ─────────────────────────────────
echo "Configurando ms-reservas..."
curl -s -X POST $KONG_ADMIN/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ms-reservas",
    "url": "http://ms-reservas:3000"
  }'

curl -s -X POST $KONG_ADMIN/services/ms-reservas/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "reservas-route",
    "paths": ["/api/reservas"],
    "strip_path": true,
    "priority": 10
  }'

# Plugin JWT no ms-reservas
curl -s -X POST $KONG_ADMIN/services/ms-reservas/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "jwt",
    "config": {
      "key_claim_name": "kid",
      "claims_to_verify": ["exp"],
      "header_names": ["authorization"]
    }
  }'

# Rate limiting no ms-reservas
curl -s -X POST $KONG_ADMIN/services/ms-reservas/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rate-limiting",
    "config": {
      "minute": 100,
      "hour": 2000,
      "policy": "local",
      "fault_tolerant": true
    }
  }'

# ── Plugin global: Correlation ID ────────────────────────
echo "Configurando plugins globais..."
curl -s -X POST $KONG_ADMIN/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "correlation-id",
    "config": {
      "header_name": "X-Request-ID",
      "generator": "uuid",
      "echo_downstream": true
    }
  }'

echo ""
echo "Kong configurado com sucesso."
echo "Serviços registrados:"
curl -s $KONG_ADMIN/services | python3 -c "
import json, sys
data = json.load(sys.stdin)
for s in data['data']:
    print(f'  - {s[\"name\"]} → {s[\"url\"]}')
"
```

Tornar executável:
```bash
chmod +x scripts/kong-setup.sh
```

---

## 6. Impacto nos microsserviços

### 6.1 Regra para todos os microsserviços integrados via Kong

O middleware de autenticação Fastify simplifica — não precisa mais validar
JWT via JWKS. Lê apenas os headers que o Kong injeta:

```typescript
// src/api/middlewares/auth.ts — versão simplificada para uso com Kong
import { FastifyRequest, FastifyReply } from 'fastify';

export interface KongUser {
  sub: string;       // X-Consumer-Custom-ID (sub do Keycloak)
  name: string;      // X-Consumer-Username
  roles: string[];   // X-Authenticated-Groups (parsear)
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const consumerId = request.headers['x-consumer-custom-id'] as string;

  if (!consumerId) {
    return reply.status(401).send({
      code: 'UNAUTHORIZED',
      message: 'Token JWT ausente ou inválido'
    });
  }

  const groups = request.headers['x-authenticated-groups'] as string ?? '';

  request.user = {
    sub: consumerId,
    name: request.headers['x-consumer-username'] as string ?? '',
    roles: groups ? groups.split(',').map(r => r.trim()) : []
  };
}
```

### 6.2 O que remover das variáveis de ambiente dos microsserviços

```env
# REMOVER — Kong assume a validação:
# IDP_JWKS_URL=...
# IDP_ISSUER=...

# MANTER — ainda necessário para registro no Service Registry:
REGISTRY_BASE_URL=https://api.cateno.com.br/registry/v1
REGISTRY_ADMIN_TOKEN=...
```

### 6.3 O que muda na rota /health

A rota `/health` deve ser excluída do plugin JWT no Kong:

```bash
# Adicionar rota separada para /health SEM autenticação
curl -s -X POST $KONG_ADMIN/services/ms-reservas/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "reservas-health-route",
    "paths": ["/api/reservas/health"],
    "strip_path": true,
    "priority": 20
  }'
# Nota: esta rota tem priority maior — Kong usa ela antes da reservas-route
# e não tem plugin JWT aplicado
```

---

## 7. Regras de Negócio

### RN-001 — Kong como único validador de JWT para microsserviços
O plugin JWT do Kong é a única camada de validação de token para requisições
a microsserviços. Microsserviços não fazem chamadas ao JWKS do Keycloak.

### RN-002 — Portal Shell mantém validação própria
O Next.js (NextAuth.js) continua validando JWT para as rotas do portal shell.
O Kong não aplica plugin JWT na rota do portal-shell.

### RN-003 — /health sem autenticação
A rota `GET /api/{slug}/health` deve ter rota separada no Kong sem plugin JWT,
com priority maior que a rota principal do serviço.

### RN-004 — Admin API do Kong não exposta externamente
A porta 8001 (Admin API) deve escutar apenas em `127.0.0.1`, nunca em `0.0.0.0`.

### RN-005 — Rate limit tolerante a falhas
`fault_tolerant: true` — se o Kong não conseguir verificar o rate limit,
a requisição passa. Disponibilidade tem prioridade sobre rate limiting.

---

## 8. Critérios de Aceite

### CA-001 — Kong sobe e responde
**Dado** `docker-compose up -d kong`
**Quando** `curl http://localhost:8001/status`
**Então** HTTP 200 com `{ "database": { "reachability": true } }`

### CA-002 — Rota do portal shell funciona via Kong
**Dado** Kong configurado com portal-route
**Quando** `curl http://localhost:8000/`
**Então** Resposta do Next.js (portal shell)

### CA-003 — Rota do ms-reservas funciona com JWT válido
**Dado** Kong configurado com reservas-route e plugin JWT ativo
**Quando** `curl http://localhost:8000/api/reservas/espacos -H "Authorization: Bearer <jwt-válido>"`
**Então** HTTP 200 com lista de espaços do ms-reservas

### CA-004 — Rota do ms-reservas rejeita sem JWT
**Dado** Plugin JWT ativo na rota do ms-reservas
**Quando** `curl http://localhost:8000/api/reservas/espacos` (sem token)
**Então** HTTP 401 do Kong (antes de chegar no Fastify)

### CA-005 — /health acessível sem JWT
**Dado** Rota health com priority maior e sem plugin JWT
**Quando** `curl http://localhost:8000/api/reservas/health`
**Então** HTTP 200 com `{ "status": "online", ... }`

### CA-006 — Rate limiting ativo
**Dado** Rate limit de 100 req/min configurado
**Quando** 101 requisições em menos de 1 minuto
**Então** A 101ª retorna HTTP 429 com header `X-RateLimit-Remaining-Minute: 0`

### CA-007 — Correlation ID injetado
**Dado** Plugin correlation-id global ativo
**Quando** Qualquer requisição passando pelo Kong
**Então** Resposta contém header `X-Request-ID` com UUID v4

### CA-008 — Admin API não acessível externamente
**Dado** KONG_ADMIN_LISTEN: 127.0.0.1:8001
**Quando** Tentativa de acesso à porta 8001 de fora do host
**Então** Conexão recusada

---

## 9. Plano de Implementação

### Fase 1 — Infraestrutura
- [ ] Adicionar `kong-db`, `kong-migration` e `kong` ao `docker-compose.yml`
- [ ] Adicionar `KONG_DB_PASSWORD` ao `.env` e `.env.example`
- [ ] Adicionar `kong_data` aos volumes
- [ ] Adicionar rede `cateno-internal` ao compose
- [ ] Verificar CA-001 (Kong sobe)

### Fase 2 — Configuração
- [ ] Criar `scripts/kong-setup.sh`
- [ ] Configurar serviço e rota do `portal-shell`
- [ ] Verificar CA-002 (portal shell via Kong)
- [ ] Atualizar Caddyfile para apontar para Kong
- [ ] Verificar acesso via domínio com TLS

### Fase 3 — ms-reservas
- [ ] Configurar serviço, rota principal e rota de health do `ms-reservas`
- [ ] Aplicar plugin JWT na rota principal
- [ ] Aplicar plugin rate-limiting
- [ ] Verificar CA-003, CA-004, CA-005, CA-006

### Fase 4 — Plugins globais e segurança
- [ ] Configurar plugin correlation-id global
- [ ] Verificar CA-007
- [ ] Confirmar Admin API não exposta — CA-008
- [ ] Documentar como registrar novos microsserviços no Kong

### Fase 5 — Atualizar documentação
- [ ] Atualizar `CLAUDE.md` do Portal Cateno — seção de auth
- [ ] Atualizar `portal-cateno-microservice-guide.md` — seção de autenticação
- [ ] Atualizar `CLAUDE-global.md` — JWT validado pelo Kong, não pelo microsserviço
- [ ] Atualizar skills `cateno-ms-analyzer` e `cateno-ms-implementer`
- [ ] Criar template de middleware Fastify simplificado para uso com Kong

---

## 10. Referências

| Artefato | Relação |
|---|---|
| PC-spec-013-API-Gateway | Spec do Caddy — mantida, Caddyfile alterado |
| PC-spec-014-Deployment | docker-compose.yml — adicionar serviços Kong |
| RES-spec-001-setup | Middleware auth simplificado, sem IDP_JWKS_URL |
| portal-cateno-microservice-guide.md | Atualizar seção de autenticação |
