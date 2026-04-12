---
sidebar_position: 3
title: Tool Registry — CatIA
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tool Registry — Integrando com o CatIA

O CatIA é o assistente de IA do portal. Para que ele possa interagir com seu microsserviço, você precisa registrar **Tools** — ações que o CatIA pode executar.

## O que são Tools

Uma Tool é uma ação específica que o CatIA pode chamar no seu microsserviço. Exemplos:

- "Listar reservas de hoje" → chama `GET /reservas?date=today`
- "Cancelar fatura #123" → chama `POST /faturas/123/cancel`
- "Qual o saldo do cliente?" → chama `GET /clientes/{id}/saldo`

## Como o CatIA usa as Tools

1. No bootstrap, o CatIA busca `GET /catia/manifest` de cada microsserviço
2. Converte cada action do manifesto em uma tool para o LLM
3. **Remove tools** cujo `permission_required` o JWT do usuário não possui
4. Quando o usuário faz uma pergunta, o LLM decide qual tool usar
5. CatIA executa a tool chamando o endpoint real com o JWT do usuário
6. O resultado é formatado em linguagem natural

## Manifesto — `GET /catia/manifest`

Seu microsserviço deve expor este endpoint:

```json
{
  "service": {
    "slug": "reservas",
    "name": "Sistema de Reservas",
    "description": "Gerencia reservas de salas e estações",
    "icon_name": "Calendar"
  },
  "actions": [
    {
      "name": "listar_reservas_hoje",
      "display_name": "Listar reservas de hoje",
      "description": "Use quando o usuário perguntar sobre reservas do dia, salas ocupadas, ou disponibilidade de hoje. Frases como: 'quais reservas tenho hoje?', 'tem sala livre agora?', 'mostra minhas reservas'",
      "permission_required": "reserva:read",
      "http": {
        "method": "GET",
        "path": "/reservas?date=today&user_id={user_id}"
      },
      "parameters": [
        {
          "name": "user_id",
          "in": "query",
          "type": "string",
          "description": "ID do usuário (extraído do JWT automaticamente)",
          "required": false
        }
      ],
      "response_fields": [
        { "field": "reservas", "description": "Lista de reservas com sala, horário e status" }
      ],
      "examples": [
        { "user_says": "quais reservas tenho hoje?", "input": {} },
        { "user_says": "tem sala livre às 15h?", "input": { "time": "15:00" } }
      ],
      "confirmation_required": false
    }
  ]
}
```

## Campos da action

| Campo                   | Obrigatório | Descrição                                                 |
| ----------------------- | :---------: | --------------------------------------------------------- |
| `name`                  |     sim     | Identificador único, snake_case                           |
| `display_name`          |     sim     | Nome legível para exibição                                |
| `description`           |     sim     | **O campo mais crítico** — define quando o LLM usa a tool |
| `permission_required`   |     sim     | Scope necessário no JWT                                   |
| `http`                  |     sim     | Método e path do endpoint real                            |
| `parameters`            |     sim     | Parâmetros da chamada                                     |
| `response_fields`       |     sim     | O que a resposta contém                                   |
| `examples`              |     sim     | Frases do usuário que disparam a tool                     |
| `confirmation_required` |     sim     | Se `true`, CatIA pede confirmação antes de executar       |

## Escrevendo boas descriptions

A `description` da action é o que o LLM lê para decidir quando usá-la. Regras:

:::tip Boas práticas

1. **Escreva como se explicasse para alguém que nunca viu o sistema**
2. **Inclua frases reais** que o usuário diria
3. **Seja específico** — "reservas de salas" é melhor que "reservas"
4. **Cubra variações** — "reservas hoje", "salas ocupadas", "agenda do dia"
5. **Diferencie das outras tools** — se tem "listar" e "cancelar", deixe claro
   :::

### Exemplo ruim

```
"description": "Lista reservas"
```

### Exemplo bom

```
"description": "Use quando o usuário perguntar sobre reservas do dia, salas ocupadas, ou disponibilidade de hoje. Frases como: 'quais reservas tenho hoje?', 'tem sala livre agora?', 'mostra minhas reservas'"
```

## Autenticação

O JWT do usuário é **propagado automaticamente** pelo CatIA. Seu microsserviço recebe o mesmo JWT que receberia de uma chamada direta — nunca uma credencial do CatIA.

```
CatIA → POST /reservas (Authorization: Bearer <JWT do usuário>)
```

## Actions com confirmação

Para operações destrutivas, use `confirmation_required: true`:

```json
{
  "name": "cancelar_reserva",
  "description": "Cancela uma reserva existente...",
  "confirmation_required": true
}
```

O CatIA vai perguntar ao usuário "Tem certeza que deseja cancelar a reserva X?" antes de executar.
