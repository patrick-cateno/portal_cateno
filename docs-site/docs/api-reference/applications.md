---
sidebar_position: 1
title: Catálogo de Aplicações
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# API — Catálogo de Aplicações

## GET /registry/v1/apps

Retorna o catálogo de aplicações visíveis para o usuário autenticado.

:::info Filtragem por role
O servidor filtra automaticamente baseado nos roles do JWT. O frontend **nunca** filtra apps.
:::

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
curl https://api.cateno.com.br/registry/v1/apps \
  -H "Authorization: Bearer $TOKEN"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
const response = await catFetch('/registry/v1/apps');
const catalog = await response.json();
```

</TabItem>
</Tabs>

### Resposta

```json
{
  "total": 12,
  "categories": [
    { "slug": "financeiro", "name": "Financeiro", "count": 5 },
    { "slug": "operacional", "name": "Operacional", "count": 7 }
  ],
  "apps": [
    {
      "id": "550e8400-...",
      "slug": "gestao-agil",
      "name": "Gestão Ágil",
      "description": "Gerenciamento de sprints e squads",
      "category": { "slug": "operacional", "name": "Operacional" },
      "icon_name": "Kanban",
      "integration_type": "redirect",
      "frontend_url": "https://gestao-agil.cateno.com.br",
      "status": "online",
      "display_order": 1,
      "tags": [{ "key": "squad", "value": "Platform" }],
      "metrics": { "active_users": 45, "trend_pct": 12.5, "period": "last_7_days" }
    }
  ]
}
```

---

## GET /registry/v1/apps/&#123;slug&#125;

Retorna detalhes de uma aplicação específica.

```bash
curl https://api.cateno.com.br/registry/v1/apps/gestao-agil \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta

Inclui todos os campos de `AppSummary` mais:

```json
{
  "...campos de AppSummary",
  "api_base_url": "https://api.cateno.com.br/gestao-agil",
  "health_check_url": "https://api.cateno.com.br/gestao-agil/health",
  "version": "1.2.0",
  "health": {
    "status": "online",
    "response_time_ms": 42,
    "uptime_pct": 99.98,
    "last_checked_at": "2026-04-12T14:30:00Z",
    "error_message": null
  },
  "permissions": [
    { "role": "admin", "can_view": true, "can_execute": true },
    { "role": "analytics", "can_view": true, "can_execute": false }
  ]
}
```

---

## POST /registry/v1/apps

Registra um novo microsserviço. Requer `REGISTRY_ADMIN_TOKEN`.

Ver [Registrar Microsserviço](../integrating/register-microservice) para detalhes completos e exemplos.

---

## GET /registry/v1/apps/status

Retorna o status de saúde de todas as aplicações. Usado pelo portal para polling a cada 30s.

```bash
curl https://api.cateno.com.br/registry/v1/apps/status \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta

```json
{
  "summary": { "online": 10, "maintenance": 1, "offline": 1 },
  "apps": [
    { "slug": "gestao-agil", "status": "online", "response_time_ms": 42 },
    { "slug": "reservas", "status": "online", "response_time_ms": 58 },
    { "slug": "conciliacao", "status": "maintenance", "response_time_ms": null }
  ]
}
```

---

## GET /registry/v1/categories

Retorna as categorias disponíveis para filtro.

```bash
curl https://api.cateno.com.br/registry/v1/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta

```json
[
  { "slug": "financeiro", "name": "Financeiro", "count": 5 },
  { "slug": "operacional", "name": "Operacional", "count": 7 },
  { "slug": "compliance", "name": "Compliance", "count": 3 }
]
```

---

## Formato de erros

Todos os endpoints retornam erros no formato:

```json
{
  "code": "SLUG_ALREADY_EXISTS",
  "message": "Já existe uma aplicação com o slug 'gestao-agil'",
  "details": {}
}
```

| HTTP | Quando                        |
| ---- | ----------------------------- |
| 400  | Validação de input            |
| 401  | Token ausente ou inválido     |
| 403  | Sem permissão para a operação |
| 404  | App não encontrado            |
| 409  | Conflito (slug duplicado)     |
| 500  | Erro interno                  |
