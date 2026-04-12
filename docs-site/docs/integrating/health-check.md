---
sidebar_position: 2
title: Health Check
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Health Check

O portal monitora o status de cada microsserviço a cada 30 segundos. Para isso, seu serviço deve expor o endpoint `GET /health`.

## Contrato

```
GET /health
```

- **Sem autenticação** — o health check não passa pelo gateway de JWT
- **Resposta em < 200ms** — timeout indica offline
- **Formato JSON** obrigatório

## Resposta esperada

### Online (HTTP 200)

```json
{
  "status": "online",
  "response_time_ms": 45,
  "uptime_pct": 99.97,
  "version": "1.0.0",
  "checked_at": "2026-04-12T14:30:00Z"
}
```

### Manutenção (HTTP 503)

```json
{
  "status": "maintenance",
  "message": "Manutenção programada até 18h"
}
```

### Offline

Qualquer erro de conexão, timeout, ou HTTP 5xx sem body válido é interpretado como `offline`.

## Implementação

<Tabs>
<TabItem value="fastify" label="Fastify (Node.js)" default>

```typescript
import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const start = Date.now();

    // Opcional: verificar conexão com banco
    // await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'online',
      response_time_ms: Date.now() - start,
      uptime_pct: 99.97,
      version: process.env.APP_VERSION ?? '1.0.0',
      checked_at: new Date().toISOString(),
    };
  });
}
```

</TabItem>
<TabItem value="express" label="Express (Node.js)">

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    response_time_ms: 0,
    uptime_pct: 99.97,
    version: process.env.APP_VERSION ?? '1.0.0',
    checked_at: new Date().toISOString(),
  });
});
```

</TabItem>
<TabItem value="python" label="Python (FastAPI)">

```python
from datetime import datetime, timezone

@app.get("/health")
async def health():
    return {
        "status": "online",
        "response_time_ms": 0,
        "uptime_pct": 99.97,
        "version": "1.0.0",
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
```

</TabItem>
</Tabs>

## Como o portal exibe

| Status        | Visual no portal     |
| ------------- | -------------------- |
| `online`      | Badge verde com glow |
| `maintenance` | Badge amarelo        |
| `offline`     | Badge vermelho       |

:::warning Gateway e Health Check
Se seu microsserviço está atrás do Kong, configure a rota `/health` **sem o plugin de JWT**. O health check deve funcionar sem autenticação.
:::
