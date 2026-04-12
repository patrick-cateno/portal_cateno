---
sidebar_position: 2
title: RBAC — Controle de Acesso
---

# RBAC — Controlando quem vê o quê

O Portal Cateno usa Role-Based Access Control (RBAC) em **4 camadas**. Autorização nunca é decidida no frontend.

## As 4 camadas

```
1. API Gateway      → valida assinatura JWT via JWKS
2. Service Registry → filtra apps por roles do JWT
3. CatIA Backend    → remove tools sem permissão
4. Microsserviço    → re-valida JWT e verifica scope
```

## Como configurar permissões

Ao registrar seu microsserviço, defina quais roles podem ver e executar:

```json
"permissions": [
  { "role": "admin", "can_view": true, "can_execute": true },
  { "role": "financeiro", "can_view": true, "can_execute": true },
  { "role": "analytics", "can_view": true, "can_execute": false },
  { "role": "readonly", "can_view": true, "can_execute": false }
]
```

| Permissão           | Significado                        |
| ------------------- | ---------------------------------- |
| `can_view: true`    | App aparece no catálogo do usuário |
| `can_execute: true` | Usuário pode abrir/usar o app      |
| `can_view: false`   | App invisível para este role       |

## No CatIA

Para tools, use o campo `permission_required`:

```json
{
  "name": "cancelar_fatura",
  "permission_required": "fatura:write"
}
```

Se o JWT do usuário não tem o scope `fatura:write`, o CatIA nem mostra essa tool.

## No microsserviço

Mesmo que o gateway valide o JWT, **re-valide** no microsserviço:

```typescript
// Fastify hook
app.addHook('preHandler', async (request) => {
  const roles = request.jwt.realm_access.roles;

  if (!roles.includes('financeiro') && !roles.includes('admin')) {
    throw { statusCode: 403, code: 'FORBIDDEN', message: 'Sem permissão' };
  }
});
```

:::danger Nunca

- Nunca decida `can_view` ou `can_execute` no frontend
- Nunca esconda elementos de UI sem validação server-side correspondente
- Nunca confie em claims do JWT sem validar a assinatura
  :::
