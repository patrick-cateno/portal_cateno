---
sidebar_position: 1
title: Registrar Microsserviço
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Registrar Microsserviço

Para seu microsserviço aparecer no portal, ele precisa ser registrado no Service Registry.

## Endpoint

```
POST https://api.cateno.com.br/registry/v1/apps
Authorization: Bearer <REGISTRY_ADMIN_TOKEN>
Content-Type: application/json
```

:::info Quando registrar
O registro deve acontecer no **CI/CD**, nunca no boot do microsserviço. Use o `REGISTRY_ADMIN_TOKEN` de service account.
:::

## Campos obrigatórios

| Campo              | Tipo   | Descrição                                                |
| ------------------ | ------ | -------------------------------------------------------- |
| `name`             | string | Nome de exibição (ex: "Gestão Ágil")                     |
| `slug`             | string | Identificador permanente, kebab-case (ex: "gestao-agil") |
| `description`      | string | Descrição curta para o catálogo                          |
| `category_slug`    | string | Categoria (ex: "financeiro", "operacional")              |
| `icon_name`        | string | Nome do ícone [Lucide](https://lucide.dev/icons/)        |
| `integration_type` | string | `redirect` \| `embed` \| `modal`                         |
| `health_check_url` | string | URL do endpoint `/health`                                |
| `permissions`      | array  | Roles e permissões                                       |

## Campos opcionais

| Campo           | Tipo   | Descrição                                               |
| --------------- | ------ | ------------------------------------------------------- |
| `frontend_url`  | string | URL do frontend (obrigatório para `redirect` e `embed`) |
| `api_base_url`  | string | URL base da API (obrigatório para `modal`)              |
| `version`       | string | Versão atual do serviço                                 |
| `display_order` | number | Ordem no catálogo (menor = primeiro)                    |
| `tags`          | array  | Tags de metadados `[{ key, value }]`                    |

## Exemplo completo

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
curl -X POST https://api.cateno.com.br/registry/v1/apps \
  -H "Authorization: Bearer $REGISTRY_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gestão Ágil",
    "slug": "gestao-agil",
    "description": "Gerenciamento de sprints, squads e cerimônias",
    "category_slug": "operacional",
    "icon_name": "Kanban",
    "integration_type": "redirect",
    "frontend_url": "https://gestao-agil.cateno.com.br",
    "health_check_url": "https://api.cateno.com.br/gestao-agil/health",
    "version": "1.0.0",
    "permissions": [
      { "role": "admin", "can_view": true, "can_execute": true },
      { "role": "analytics", "can_view": true, "can_execute": false }
    ],
    "tags": [
      { "key": "squad", "value": "Platform" }
    ]
  }'
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
const response = await fetch('https://api.cateno.com.br/registry/v1/apps', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.REGISTRY_ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Gestão Ágil',
    slug: 'gestao-agil',
    description: 'Gerenciamento de sprints, squads e cerimônias',
    category_slug: 'operacional',
    icon_name: 'Kanban',
    integration_type: 'redirect',
    frontend_url: 'https://gestao-agil.cateno.com.br',
    health_check_url: 'https://api.cateno.com.br/gestao-agil/health',
    version: '1.0.0',
    permissions: [
      { role: 'admin', can_view: true, can_execute: true },
      { role: 'analytics', can_view: true, can_execute: false },
    ],
    tags: [{ key: 'squad', value: 'Platform' }],
  }),
});

const app = await response.json();
console.log(`App registrado: ${app.slug}`);
```

</TabItem>
</Tabs>

## Tipos de integração

| Tipo       | `frontend_url` | `api_base_url` | Como o portal abre                    |
| ---------- | :------------: | :------------: | ------------------------------------- |
| `redirect` |  obrigatório   |    opcional    | `window.location.href = frontend_url` |
| `embed`    |  obrigatório   |    opcional    | `<iframe src={frontend_url} />`       |
| `modal`    |    opcional    |  obrigatório   | Chama API e renderiza dados inline    |

## Resposta

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "gestao-agil",
  "name": "Gestão Ágil",
  "status": "online",
  "created_at": "2026-04-12T10:00:00Z"
}
```

## Erros comuns

| HTTP | Código                | Causa                                          |
| ---- | --------------------- | ---------------------------------------------- |
| 400  | `VALIDATION_ERROR`    | Campo obrigatório faltando ou formato inválido |
| 401  | `UNAUTHORIZED`        | Token ausente ou inválido                      |
| 409  | `SLUG_ALREADY_EXISTS` | Já existe um app com esse slug                 |
