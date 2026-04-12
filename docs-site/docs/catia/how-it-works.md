---
sidebar_position: 1
title: Como o CatIA funciona
---

# Como o CatIA funciona

O CatIA é o assistente de IA integrado ao Portal Cateno. Diferente de chatbots tradicionais, ele **não tem respostas hardcoded** — descobre dinamicamente o que pode fazer através das Tools registradas por cada microsserviço.

## O loop agentic

```
┌─────────────────────────────────────────────────────┐
│  1. Usuário envia mensagem                          │
│     "Quais reservas tenho hoje?"                    │
│                    ↓                                │
│  2. CatIA consulta tools disponíveis                │
│     (filtradas por permissão do JWT)                │
│                    ↓                                │
│  3. LLM decide qual tool usar                       │
│     → listar_reservas_hoje                          │
│                    ↓                                │
│  4. CatIA executa: GET /reservas?date=today         │
│     (com JWT do usuário)                            │
│                    ↓                                │
│  5. Microsserviço retorna dados                     │
│     → [{ sala: "A1", hora: "14:00" }, ...]          │
│                    ↓                                │
│  6. LLM formata resposta em linguagem natural       │
│     "Você tem 2 reservas hoje: Sala A1 às 14h..."   │
└─────────────────────────────────────────────────────┘
```

## Descoberta de Tools

No bootstrap, o CatIA faz `GET /catia/manifest` em cada microsserviço registrado no Service Registry. Cada manifesto declara as actions disponíveis.

O CatIA então:

1. Converte cada action em uma `tool_definition` para o LLM
2. **Remove tools** cujo `permission_required` o JWT do usuário não possui
3. Mantém apenas as tools que o usuário pode usar

## Segurança

- O JWT do usuário é **propagado** para o microsserviço — nunca uma credencial do CatIA
- Tools com `confirmation_required: true` pedem confirmação antes de executar
- Toda chamada é registrada em **audit log** (user_id, action, input, timestamp, resultado)
- O CatIA **nunca expõe ao LLM** tools que o usuário não tem permissão

## Limitações

- O CatIA não navega pela interface — ele executa ações via API
- Respostas dependem da qualidade das `descriptions` das tools
- Se nenhuma tool corresponder à pergunta, ele responde que não pode ajudar
- Upload de arquivos requer tools específicas com suporte a multipart
