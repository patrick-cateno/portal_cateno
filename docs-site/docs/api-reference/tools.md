---
sidebar_position: 2
title: Tool Registry
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# API — Tool Registry

## POST /api/tools/register

Registra tools para o CatIA. Cada microsserviço pode registrar múltiplas tools de uma vez.

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
curl -X POST https://api.cateno.com.br/api/tools/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationSlug": "reservas",
    "tools": [
      {
        "name": "listar_reservas_hoje",
        "displayName": "Listar reservas de hoje",
        "description": "Use quando o usuário perguntar sobre reservas do dia...",
        "endpoint": "GET /reservas?date=today",
        "inputSchema": {
          "type": "object",
          "properties": {
            "date": { "type": "string", "format": "date" }
          }
        },
        "permissionRequired": "reserva:read"
      }
    ]
  }'
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
const response = await fetch('https://api.cateno.com.br/api/tools/register', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    applicationSlug: 'reservas',
    tools: [
      {
        name: 'listar_reservas_hoje',
        displayName: 'Listar reservas de hoje',
        description: 'Use quando o usuário perguntar sobre reservas do dia...',
        endpoint: 'GET /reservas?date=today',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
          },
        },
        permissionRequired: 'reserva:read',
      },
    ],
  }),
});
```

</TabItem>
</Tabs>

### Resposta

```json
{
  "registered": 1,
  "tools": [
    {
      "id": "tool_550e8400...",
      "name": "listar_reservas_hoje",
      "applicationSlug": "reservas",
      "status": "active"
    }
  ]
}
```

---

## GET /api/tools

Lista todas as tools registradas (filtradas por permissão do JWT).

```bash
curl https://api.cateno.com.br/api/tools \
  -H "Authorization: Bearer $TOKEN"
```

---

## PATCH /api/tools/&#123;id&#125;

Atualiza uma tool existente.

```bash
curl -X PATCH https://api.cateno.com.br/api/tools/tool_550e8400 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nova description melhorada...",
    "inputSchema": { ... }
  }'
```
