---
sidebar_position: 3
title: Conceitos Fundamentais
---

# Conceitos Fundamentais

## Service Registry

O Service Registry é a **fonte de verdade** de quais microsserviços existem no ecossistema Cateno. Ele:

- Armazena metadados de cada aplicação (nome, slug, tipo de integração, URLs)
- Controla quem pode ver cada app (baseado em roles do JWT)
- Fornece o status de saúde em tempo real

:::info Importante
O Service Registry **filtra apps por role no servidor**. O portal nunca decide no frontend quem pode ver o quê.
:::

## Health Check

Todo microsserviço deve expor `GET /health` **sem autenticação**. O portal consulta este endpoint a cada 30 segundos para atualizar o status no catálogo.

Respostas possíveis:

| Status        | HTTP           | Significado              |
| ------------- | -------------- | ------------------------ |
| `online`      | 200            | Serviço operacional      |
| `maintenance` | 503            | Em manutenção programada |
| `offline`     | 5xx ou timeout | Fora do ar               |

## CatIA e Tools

O **CatIA** é o assistente de IA integrado ao portal. Ele não tem respostas hardcoded — em vez disso, descobre dinamicamente o que pode fazer através de **Tools** registradas por cada microsserviço.

Uma Tool é uma ação que o CatIA pode executar. Exemplo: "listar reservas de hoje", "cancelar fatura #123".

O fluxo é:

1. Microsserviço registra suas tools no Tool Registry
2. CatIA filtra tools por permissão do usuário (JWT)
3. Usuário faz pergunta em linguagem natural
4. CatIA escolhe a tool certa e chama o endpoint real
5. Resultado é formatado em linguagem natural

## JWT e Autenticação

Toda autenticação é feita pelo **Keycloak** via OAuth2 PKCE. O fluxo:

```
Browser → Portal (Keycloak login) → JWT
  → API Gateway (valida via JWKS) → JWT propagado → Microsserviço
```

Seu microsserviço **recebe o JWT já validado** pelo gateway. Basta extrair o `sub` (user_id) e os roles para autorização.

:::warning Nunca

- Nunca implemente autenticação própria
- Nunca crie tabela de usuários — identidade é do Keycloak
- Nunca confie em claims do JWT sem validar a assinatura
  :::

## Slug

O `slug` é o identificador permanente de cada microsserviço no Service Registry. Ele:

- É definido no momento do registro
- **Nunca muda** após o registro
- É usado em URLs, referências de API e no CatIA
- Deve ser kebab-case (ex: `gestao-agil`, `reservas`)
