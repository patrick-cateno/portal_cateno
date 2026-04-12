---
sidebar_position: 2
title: Quickstart
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart — 5 minutos para integrar

Neste guia você vai registrar seu microsserviço no Portal Cateno e vê-lo aparecer no catálogo.

## Pré-requisitos

- Microsserviço rodando com um endpoint acessível
- Token de admin do Service Registry (`REGISTRY_ADMIN_TOKEN`)
- Endpoint `GET /health` implementado (ver [Health Check](../integrating/health-check))

## Passo 1 — Implementar o Health Check

Seu microsserviço deve expor `GET /health` **sem autenticação**:

<Tabs>
<TabItem value="typescript" label="TypeScript (Fastify)" default>

```typescript
app.get('/health', async () => {
  return {
    status: 'online',
    response_time_ms: 45,
    uptime_pct: 99.97,
    version: '1.0.0',
    checked_at: new Date().toISOString(),
  };
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
        "response_time_ms": 45,
        "uptime_pct": 99.97,
        "version": "1.0.0",
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
```

</TabItem>
</Tabs>

## Passo 2 — Registrar no Service Registry

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
curl -X POST https://api.cateno.com.br/registry/v1/apps \
  -H "Authorization: Bearer $REGISTRY_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Serviço",
    "slug": "meu-servico",
    "description": "Descrição do que o serviço faz",
    "category_slug": "financeiro",
    "icon_name": "CreditCard",
    "integration_type": "redirect",
    "frontend_url": "https://meu-servico.cateno.com.br",
    "health_check_url": "https://api.cateno.com.br/meu-servico/health",
    "permissions": [
      { "role": "admin", "can_view": true, "can_execute": true },
      { "role": "financeiro", "can_view": true, "can_execute": true }
    ]
  }'
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
const response = await fetch('https://api.cateno.com.br/registry/v1/apps', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${REGISTRY_ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Meu Serviço',
    slug: 'meu-servico',
    description: 'Descrição do que o serviço faz',
    category_slug: 'financeiro',
    icon_name: 'CreditCard',
    integration_type: 'redirect',
    frontend_url: 'https://meu-servico.cateno.com.br',
    health_check_url: 'https://api.cateno.com.br/meu-servico/health',
    permissions: [
      { role: 'admin', can_view: true, can_execute: true },
      { role: 'financeiro', can_view: true, can_execute: true },
    ],
  }),
});
```

</TabItem>
</Tabs>

## Passo 3 — Verificar no portal

1. Acesse o Portal Cateno
2. Seu microsserviço deve aparecer no catálogo de cards
3. O status (online/offline) atualiza a cada 30 segundos

:::tip Pronto!
Seu microsserviço está integrado. Para expor ações ao CatIA, continue com [Tool Registry](../integrating/tool-registry).
:::

## Próximos passos

- [Registrar Tools para o CatIA](../integrating/tool-registry)
- [Tipos de integração em detalhe](../guides/integration-types)
- [Referência completa da API](../api-reference/applications)
