# PC-SPEC-013 — API Gateway / Infraestrutura de Borda

| Campo            | Valor                    |
| ---------------- | ------------------------ |
| **ID**           | PC-SPEC-013              |
| **Status**       | Concluída                |
| **Prioridade**   | Média                    |
| **Complexidade** | Baixa                    |
| **Autor**        | Patrick Iarrocheski      |
| **Branch**       | feat/PC-013-api-gateway  |

## 1. Objetivo

Configurar a camada de borda entre a internet e o portal Next.js: TLS termination, reverse proxy, rate limiting global e logging de acesso. Com o monolito Next.js, o gateway é muito mais simples — apenas um proxy na frente de um único serviço.

## 2. Recomendação: Caddy

Caddy é o mais adequado para este cenário:
- Zero configuração de TLS (renovação automática via Let's Encrypt)
- Config declarativa simples (Caddyfile)
- Native suporte a SSE/streaming — necessário para o CatIA
- Sem necessidade de nginx.conf complexo

## 3. Caddyfile

```caddyfile
{
  admin off
  log {
    output stdout
    format json
  }
}

portal.cateno.com.br {
  # Rate limit global: 500 req/min por IP
  rate_limit {remote.ip} 500r/m

  # Next.js
  reverse_proxy portal:3000 {
    header_up X-Real-IP {remote.ip}
    header_up X-Request-ID {http.request.uuid}

    # SSE para o CatIA — sem buffering
    flush_interval -1
  }

  # Health check do gateway
  handle /healthz {
    respond `{"status":"ok"}` 200
  }
}
```

## 4. Docker Compose (produção)

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - portal

  portal:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      # ... demais vars
    expose:
      - "3000"    # Não exposto publicamente — apenas via Caddy
```

## 5. Middleware Next.js (rate limiting por usuário)

Além do rate limit global do Caddy, o Next.js middleware aplica limites por rota autenticada:

```typescript
// src/middleware.ts — adicionar rate limiting
import { Ratelimit } from '@upstash/ratelimit';

// Rota CatIA: 30 req/min por usuário
// Rota applications/status: 10 req/min por IP
```

## 6. Critérios de Aceite

- [ ] HTTPS automático com Let's Encrypt via Caddy
- [ ] SSE do /api/catia/chat funciona sem buffering (flush_interval -1)
- [ ] GET /healthz responde 200 sem passar pelo Next.js
- [ ] Acesso log em JSON estruturado
- [ ] Rate limit global 500 req/min por IP
- [ ] Portal não exposto diretamente (apenas via Caddy)

## 7. Dependências

- **Depende de:** PC-SPEC-014 (Deployment)
- **Não é bloqueante** para desenvolvimento local
