---
sidebar_position: 2
title: Escrevendo boas Tools
---

# Escrevendo boas Tools para o CatIA

A qualidade da interação do CatIA com seu microsserviço depende diretamente de como você escreve as Tools. Este guia cobre as melhores práticas.

## O campo `description` é tudo

O LLM decide qual tool usar baseado **exclusivamente na description**. Uma description ruim = o CatIA ignora sua tool.

### Anatomia de uma boa description

```
"Use quando o usuário [situação]. Frases como: '[exemplo 1]', '[exemplo 2]', '[exemplo 3]'"
```

### Exemplos por caso de uso

#### Tool de listagem (GET)

```json
{
  "name": "listar_faturas_pendentes",
  "description": "Use quando o usuário perguntar sobre faturas em aberto, contas a pagar, ou valores pendentes. Frases como: 'quais faturas estão pendentes?', 'quanto devo?', 'mostra minhas contas em aberto'",
  "http": { "method": "GET", "path": "/faturas?status=pendente" }
}
```

#### Tool de criação (POST)

```json
{
  "name": "criar_reserva_sala",
  "description": "Use quando o usuário quiser reservar uma sala de reunião. Precisa saber: qual sala, data e horário. Frases como: 'reserva a sala A1 para amanhã às 14h', 'quero agendar uma reunião', 'preciso de uma sala'",
  "http": { "method": "POST", "path": "/reservas" },
  "confirmation_required": true
}
```

#### Tool de consulta específica

```json
{
  "name": "consultar_saldo_cliente",
  "description": "Use quando o usuário perguntar sobre saldo, crédito disponível, ou limite de um cliente específico. Precisa do ID ou nome do cliente. Frases como: 'qual o saldo do cliente X?', 'quanto de crédito o cliente tem?'",
  "http": { "method": "GET", "path": "/clientes/{client_id}/saldo" }
}
```

## Diferenciando tools similares

Se seu microsserviço tem tools parecidas, a description deve deixar claro quando usar cada uma:

```json
// Tool 1
"description": "Use para LISTAR todas as reservas do dia — quando o usuário quer uma visão geral"

// Tool 2
"description": "Use para CANCELAR uma reserva específica — quando o usuário quer desfazer uma reserva já feita"

// Tool 3
"description": "Use para CRIAR uma nova reserva — quando o usuário quer agendar algo novo"
```

## Parâmetros

Defina parâmetros claros com descriptions que ajudem o LLM a preenchê-los:

```json
"parameters": [
  {
    "name": "date",
    "in": "query",
    "type": "string",
    "description": "Data no formato YYYY-MM-DD. Se o usuário disser 'hoje', use a data atual. Se disser 'amanhã', calcule.",
    "required": true
  },
  {
    "name": "sala_id",
    "in": "query",
    "type": "string",
    "description": "ID da sala. Se o usuário disser o nome (ex: 'Sala A1'), use o slug correspondente.",
    "required": false
  }
]
```

## Testando suas tools

1. Registre a tool no manifesto
2. Reinicie o CatIA para ele buscar o manifesto atualizado
3. Faça perguntas variadas no chat e veja se a tool é acionada
4. Se não for, revise a `description` — provavelmente não está cobrindo as frases certas

## Checklist

- [ ] Description cobre 3+ frases reais do usuário
- [ ] Description diferencia esta tool das similares
- [ ] Parâmetros têm descriptions claras
- [ ] `confirmation_required: true` para operações destrutivas
- [ ] `permission_required` correto para o scope necessário
- [ ] `examples` com pelo menos 2 cenários
