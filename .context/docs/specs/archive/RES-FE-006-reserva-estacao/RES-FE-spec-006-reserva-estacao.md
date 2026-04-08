# RES-FE-SPEC-006 — Reserva de Estação de Trabalho (Usuário)

> Status: Aguardando aprovação
> Role exigida: qualquer usuário autenticado
> Rotas:
>   - `/reservas/nova-reserva/estacao` — criar nova reserva
>   - `/reservas/minhas-estacoes` — listar minhas reservas
> Depende de: RES-FE-001

---

## 1. Objetivo

Permitir que qualquer colaborador autenticado faça reserva de estação de trabalho
para um dia específico, visualize suas reservas futuras e passadas, realize check-in
e cancele reservas.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint                                    | Uso                             |
|--------|---------------------------------------------|---------------------------------|
| GET    | `/v1/reservas-estacoes/disponibilidade`     | Mapa de estações por data       |
| POST   | `/v1/reservas-estacoes`                     | Criar reserva                   |
| DELETE | `/v1/reservas-estacoes/:id`                 | Cancelar reserva                |
| POST   | `/v1/reservas-estacoes/:id/checkin`         | Registrar check-in              |
| GET    | `/v1/reservas-estacoes/minhas`              | Listar minhas reservas          |
| GET    | `/v1/escritorios`                           | Popular select de escritório    |

**Query params disponibilidade:** `escritorio_id` (obrigatório) + `data` (YYYY-MM-DD, obrigatório)

**Body criação:**
```json
{
  "estacao_id": "uuid-da-estacao",
  "data_reserva": "2026-04-10"
}
```

**Resposta disponibilidade:**
```json
{
  "escritorioId": "...",
  "data": "2026-04-10",
  "estacoes": [
    { "id": "...", "nome": "A-01", "status": "livre" },
    { "id": "...", "nome": "A-02", "status": "reservada", "reservaId": "...", "userId": "..." },
    { "id": "...", "nome": "A-03", "status": "bloqueada" }
  ]
}
```

**Situação de reserva:** `confirmada` | `cancelada` | `concluida`

---

## 3. Tela: Nova Reserva de Estação (`/reservas/nova-reserva/estacao`)

> **`dynamic()` obrigatório nos componentes pesados:**
> ```typescript
> import dynamic from 'next/dynamic'
> const GradeEstacoes = dynamic(
>   () => import('../_components/GradeEstacoes'),
>   { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
> )
> ```
> A grade renderiza exclusivamente no cliente (interação de seleção de estação).
> SSR é desnecessário e aumentaria o bundle inicial desnecessariamente.

### 3.1 Fluxo em 3 passos (Stepper)

```
[1. Escolher Data e Escritório] → [2. Escolher Estação] → [3. Confirmação]
```

**Passo 1 — Escolher Data e Escritório**
- Select de Escritório (escritórios ativos)
- Date Picker para a data de reserva
  - Data mínima: amanhã (não permite reserva para hoje)
  - Data máxima: +30 dias a partir de hoje
  - Fins de semana desabilitados no calendar
- Botão "Ver disponibilidade →" → avança para passo 2

**Passo 2 — Escolher Estação**

Grade visual de estações (cards 80×80px) organizadas por nome:

```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ A-01 │  │ A-02 │  │ A-03 │  │ A-04 │
│ LIVRE│  │RESERV│  │BLOQ  │  │ LIVRE│
└──────┘  └──────┘  └──────┘  └──────┘
```

Legenda de cores:
| Status    | Cor do card              | Interação         |
|-----------|--------------------------|-------------------|
| livre     | `#F0FDFA` borda `#0D9488`| Clicável          |
| reservada | `#F1F5F9` borda `#CBD5E1`| Não clicável      |
| bloqueada | `#FEF3C7` borda `#F59E0B`| Não clicável      |
| inativa   | `#F8FAFC` borda `#E2E8F0`| Não clicável, oculta por padrão |

Estação selecionada: `background: #0D9488`, texto branco, borda `#0F766E`.

**Passo 3 — Confirmação**

Card de resumo:
```
Escritório: São Paulo — Paulista
Data:       Sexta, 10 de Abril de 2026
Estação:    A-01
```

Botões:
- [← Voltar] — ghost
- [Confirmar Reserva] — botão primário teal

---

## 4. Tela: Minhas Reservas de Estação (`/reservas/minhas-estacoes`)

### 4.1 Page Header
```
[Título: "Minhas Estações"]       [Botão: "+ Nova Reserva"]
```

### 4.2 Filtros
```
[Tabs: Futuras | Passadas | Todas]   [Date range picker opcional]
```

### 4.3 Cards de reserva

Cada reserva exibida como card:
```
┌─────────────────────────────────────────────┐
│ 📅 Sexta, 10 de Abril de 2026               │
│ 🏢 São Paulo — Paulista                     │
│ 💺 Estação A-01                             │
│                                             │
│ ● CONFIRMADA     [Check-in]  [Cancelar]     │
└─────────────────────────────────────────────┘
```

**Badge de situação:**
| Situação  | Cor                        |
|-----------|----------------------------|
| confirmada| Verde `#10B981`            |
| concluida | Teal `#0D9488`             |
| cancelada | Cinza `#64748B`            |

**Botão "Check-in":**
- Visível apenas se `situacao = confirmada` E `data_reserva = hoje`
- Oculto se `checkin_realizado = true` (exibe "✓ Check-in realizado" no lugar)

**Botão "Cancelar":**
- Visível apenas se `situacao = confirmada` E `data_reserva >= hoje`
- Exibe AlertDialog antes de chamar `DELETE`

---

## 5. Regras de Negócio (frontend)

**RN-FE-006-001** — Data de reserva mínima: amanhã. Máxima: hoje + 30 dias. Fins de semana desabilitados no datepicker.

**RN-FE-006-002** — Se a API retornar `409 RESERVA_JA_EXISTE_NA_DATA`, exibir toast "Você já tem uma reserva para este dia."

**RN-FE-006-003** — Se a API retornar `422 FERIADO_NA_DATA`, exibir toast "Esta data é feriado em {escritório}."

**RN-FE-006-004** — Check-in só é possível no dia da reserva (validação no cliente antes de chamar a API).

**RN-FE-006-005** — Após confirmar reserva com sucesso, exibir tela de sucesso com opção "Ver minhas reservas" e "Fazer nova reserva".

**RN-FE-006-006** — Na grade de disponibilidade, estações com status `reservada` do próprio usuário são destacadas com borda dupla teal.

---

## 6. Critérios de Aceite

**CA-001**
- Dado que seleciono escritório "SP Paulista" e data "10/04/2026" (uma sexta)
- Quando clico em "Ver disponibilidade"
- Então `GET /v1/reservas-estacoes/disponibilidade?escritorio_id=<uuid>&data=2026-04-10` é chamado
- E a grade de estações é renderizada com status coloridos

**CA-002**
- Dado que seleciono estação "A-01" (livre) e confirmo
- Quando `POST /v1/reservas-estacoes` retorna 201
- Então tela de sucesso é exibida com resumo da reserva

**CA-003**
- Dado que já tenho reserva nessa data e clico em confirmar
- Quando a API retorna `409 RESERVA_JA_EXISTE_NA_DATA`
- Então toast "Você já tem uma reserva para este dia" é exibido e permaneço no passo 3

**CA-004**
- Dado que a data selecionada é um feriado
- Quando a API retorna `422 FERIADO_NA_DATA`
- Então toast de erro é exibido com o nome do feriado

**CA-005**
- Dado que tenho reserva confirmada para hoje
- Quando acesso "Minhas Estações"
- Então o botão "Check-in" aparece no card da reserva de hoje

**CA-006**
- Dado que clico em "Check-in" e `POST /v1/reservas-estacoes/:id/checkin` retorna 200
- Quando a resposta chega
- Então o botão "Check-in" é substituído por "✓ Check-in realizado" e toast de sucesso é exibido

**CA-007**
- Dado que clico em "Cancelar" e confirmo no AlertDialog
- Quando `DELETE /v1/reservas-estacoes/:id` retorna 200
- Então o badge muda para "cancelada" (cinza) e os botões desaparecem

**CA-008**
- Dado que tento selecionar uma data no passado no datepicker
- Quando clico na data
- Então a data não é selecionável (desabilitada no calendário)
