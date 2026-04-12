---
sidebar_position: 3
title: Troubleshooting
---

# Troubleshooting

## App não aparece no catálogo

**Causa mais comum:** permissões incorretas no registro.

1. Verifique se o registro foi feito corretamente:

   ```bash
   curl https://api.cateno.com.br/registry/v1/apps/seu-slug \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

2. Verifique se o role do usuário está na lista de `permissions` com `can_view: true`

3. Verifique se o JWT do usuário contém os roles esperados

---

## 403 no health endpoint

**Causa:** o endpoint `/health` está protegido por JWT.

**Solução:** o health check deve funcionar **sem autenticação**. Se você usa Kong:

```yaml
# Kong route para health — SEM plugin jwt
routes:
  - name: meu-servico-health
    paths:
      - /meu-servico/health
    strip_path: true
    # NÃO adicionar plugin jwt nesta rota
```

---

## CatIA não usa minha tool

**Causa provável:** a `description` da tool não é boa o suficiente.

1. **Verifique o manifesto:**

   ```bash
   curl https://api.cateno.com.br/meu-servico/catia/manifest
   ```

2. **Revise a description** — inclua frases reais do usuário:

   ```
   # Ruim
   "description": "Lista items"

   # Bom
   "description": "Use quando o usuário perguntar sobre items disponíveis, estoque atual, ou o que tem em inventário. Frases: 'o que tem disponível?', 'mostra o estoque', 'quantos items temos?'"
   ```

3. **Verifique permissões** — se o JWT não tem o scope, a tool nem aparece

4. **Reinicie o CatIA** — ele busca manifestos no bootstrap

---

## Status mostra "offline" mas serviço está rodando

1. **Verifique a URL de health:**

   ```bash
   curl -v https://api.cateno.com.br/meu-servico/health
   ```

2. **Verifique o timeout** — resposta deve ser < 200ms

3. **Verifique o formato** — deve retornar JSON com `"status": "online"`

4. **Verifique o Kong** — a rota pode não estar configurada corretamente

---

## Token expirado / refresh loop

Se o portal entra em loop de refresh:

1. Verifique se o Keycloak está acessível
2. Verifique se o `refresh_token` não expirou (default: 30 min)
3. Se `refresh_token` retorna `400 invalid_grant`, a sessão expirou — redirecionar para login é o comportamento correto

---

## Erro "SLUG_ALREADY_EXISTS" no registro

Cada slug é único e permanente. Se receber este erro:

1. Verifique se o serviço já está registrado:

   ```bash
   curl https://api.cateno.com.br/registry/v1/apps/seu-slug
   ```

2. Se precisar atualizar os dados, use `PATCH` em vez de `POST`:
   ```bash
   curl -X PATCH https://api.cateno.com.br/registry/v1/apps/seu-slug \
     -H "Authorization: Bearer $TOKEN" \
     -d '{ "description": "Nova descrição" }'
   ```
