# RES-FE-SPEC-007 — Reserva de Sala de Reunião (Usuário)

> Status: Aguardando aprovação
> Role exigida: qualquer usuário autenticado
> Rotas:
>   - `/reservas/nova-reserva/sala` — criar nova reserva
>   - `/reservas/minhas-salas` — listar minhas reservas de sala
> Depende de: RES-FE-001

---

## 1. Objetivo

Permitir que qualquer colaborador autenticado faça reserva de sala de reunião
por faixa de horário, visualize suas reservas, edite (enquanto não encerradas)
e cancele reservas.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint                     | Uso                               |
|--------|------------------------------|-----------------------------------|
| GET    | `/v1/salas`                  | Listar salas por escritório        |
| GET    | `/v1/reservas-salas`         | Verificar disponibilidade da sala  |
| POST   | `/v1/reservas-salas`         | Criar reserva                     |
| PATCH  | `/v1/reservas-salas/:id`     | Editar reserva                    |
| DELETE | `/v1/reservas-salas/:id`     | Cancelar reserva                  |
| GET    | `/v1/reservas-salas/minhas`  | Listar minhas reservas            |
| GET    | `/v1/escritorios`            | Popular select                    |

**Body de criação:**
```json
{
  "sala_id": "uuid-da-sala",
  "titulo": "Alinhamento Q2",
  "data_hora_inicio": "2026-04-10T09:00:00.000Z",
  "data_hora_fim": "2026-04-10T10:30:00.000Z"
}
```

**Body de edição (PATCH):**
```json
{
  "titulo": "Novo título",
  "data_hora_inicio": "2026-04-10T10:00:00.000Z",
  "data_hora_fim": "2026-04-10T11:00:00.000Z"
}
```

---

## 3. Tela: Nova Reserva de Sala (`/reservas/nova-reserva/sala`)

> **`dynamic()` obrigatório nos componentes pesados:**
> ```typescript
> import dynamic from 'next/dynamic'
> const GradeHorarios = dynamic(
>   () => import('../_components/GradeHorarios'),
>   { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl" /> }
> )
> const CardsSalas = dynamic(
>   () => import('../_components/CardsSalas'),
>   { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
> )
> ```
> Ambos os componentes são puramente interativos (seleção de sala e range de horário).
> SSR desnecessário — renderizam apenas no cliente.

### 3.1 Fluxo em 3 passos (Stepper)

```
[1. Escolher Data e Escritório] → [2. Escolher Sala e Horário] → [3. Título e Confirmação]
```

**Passo 1 — Escolher Data e Escritório**
- Select de Escritório (ativos)
- Date Picker para a data da reunião
  - Mínima: hoje (permite reservar no mesmo dia)
  - Máxima: hoje + 30 dias
  - Fins de semana desabilitados
- Botão "Ver salas disponíveis →"

**Passo 2 — Escolher Sala e Horário**

Layout em dois painéis:

*Painel esquerdo — Escolher sala:*

Cards de sala:
```
┌────────────────────────────────┐
│ 📷 [foto ou placeholder]       │
│ Sala Athenas                   │
│ 🏢 SP Paulista                 │
└────────────────────────────────┘
```
- Card selecionado: borda `#0D9488` dupla (2px), background `#F0FDFA`

*Painel direito — Escolher horário:*

Grade de slots de 30 minutos das 08:00 às 18:00:

```
08:00 ── 08:30 ── 09:00 ── 09:30 ── 10:00 ── ...
[LIVRE] [LIVRE] [OCUP.] [OCUP.] [LIVRE] ...
```

Status de cada slot:
| Status   | Cor                       | Interação  |
|----------|---------------------------|------------|
| livre    | `#F0FDFA` borda `#0D9488` | Clicável   |
| ocupado  | `#FEE2E2` borda `#EF4444` | Bloqueado  |
| selecion.| `#0D9488` texto branco     | Selecionado|

Seleção de range de horário: usuário clica no slot de início e depois no de fim.
Slots intermediários ficam "selecionados" (teal) automaticamente.

Consulta de disponibilidade feita via:
`GET /v1/reservas-salas?sala_id=<uuid>&data_inicio=2026-04-10&data_fim=2026-04-10`

**Passo 3 — Título e Confirmação**

Campos:
- **Título da reunião** (obrigatório, min 3, max 200)

Card de resumo:
```
Sala:    Athenas — SP Paulista
Data:    Sexta, 10 de Abril de 2026
Horário: 09:00 até 10:30 (1h30)
Título:  Alinhamento Q2
```

Botões: [← Voltar] e [Confirmar Reserva]

---

## 4. Tela: Minhas Reservas de Sala (`/reservas/minhas-salas`)

### 4.1 Page Header
```
[Título: "Minhas Salas"]         [Botão: "+ Nova Reserva"]
```

### 4.2 Filtros
```
[Tabs: Futuras | Passadas | Todas]
```

### 4.3 Cards de reserva

```
┌─────────────────────────────────────────────────┐
│ 📅 Sexta, 10 de Abril de 2026 • 09:00 – 10:30  │
│ 🏢 Sala Athenas — SP Paulista                   │
│ 📌 Alinhamento Q2                               │
│                                             │
│ ● ATIVA            [Editar]  [Cancelar]         │
└─────────────────────────────────────────────────┘
```

**Badge de situação:**
| is_active | Situação  | Badge                    |
|-----------|-----------|--------------------------|
| true      | ativa     | Verde "Ativa"            |
| false     | cancelada | Cinza "Cancelada"        |

**Botão "Editar":**
- Visível se `is_active = true` E `data_hora_fim > now()`
- Abre modal de edição (inline, sem mudar de página)

**Botão "Cancelar":**
- Visível se `is_active = true` E `data_hora_fim > now()`
- AlertDialog antes de chamar `DELETE`

### 4.4 Modal de Edição

Campos editáveis:
- **Título** (opcional alterar)
- **Data** (date picker)
- **Horário início** e **Horário fim** (selects de 30 em 30 min, 08:00–18:00)

> A sala não pode ser alterada na edição (somente título e horário).
> Para mudar de sala: cancelar e criar nova reserva.

---

## 5. Regras de Negócio (frontend)

**RN-FE-007-001** — Horários disponíveis: somente múltiplos de 30 minutos entre 08:00 e 18:00. `data_hora_fim` deve ser posterior a `data_hora_inicio`.

**RN-FE-007-002** — Duração mínima: 30 minutos (fim = início + 30min no mínimo).

**RN-FE-007-003** — Se a API retornar `409 SALA_CONFLITO_HORARIO`, exibir toast "Sala indisponível no horário selecionado. Escolha outro horário."

**RN-FE-007-004** — Se a API retornar `422 FERIADO_NA_DATA`, exibir toast "Esta data é feriado em {escritório}."

**RN-FE-007-005** — Edição é permitida apenas se `data_hora_fim > now()` (validação no cliente).

**RN-FE-007-006** — Ao editar, se o novo horário conflitar (`409`), exibir inline no modal "Horário indisponível — escolha outro."

**RN-FE-007-007** — Datas e horas são sempre enviadas em UTC (ISO 8601 com timezone). O portal converte para UTC antes de enviar e para o timezone local do usuário ao exibir.

---

## 6. Critérios de Aceite

**CA-001**
- Dado que seleciono escritório e data e clico em "Ver salas disponíveis"
- Quando passo 2 carrega
- Então `GET /v1/salas?escritorio_id=<uuid>&is_active=true` é chamado e cards de salas são exibidos

**CA-002**
- Dado que seleciono sala "Athenas" e clico nos slots 09:00 e 10:30
- Quando seleciono o range
- Então slots de 09:00, 09:30 e 10:00 ficam teal (selecionados) e 10:30 como fim

**CA-003**
- Dado que preencho título "Alinhamento Q2" e confirmo
- Quando `POST /v1/reservas-salas` retorna 201
- Então tela de sucesso é exibida

**CA-004**
- Dado que o slot 09:00–09:30 já está ocupado (outra reserva)
- Quando renderizo a grade de horários
- Então esse slot aparece em vermelho e não é clicável

**CA-005**
- Dado que a API retorna `409 SALA_CONFLITO_HORARIO`
- Quando submeto a criação
- Então toast "Sala indisponível no horário selecionado" é exibido e permaneço no passo 3

**CA-006**
- Dado que tenho uma reserva futura ativa
- Quando clico em "Editar"
- Então modal abre com campos de título e horário pré-preenchidos

**CA-007**
- Dado que edito o horário e `PATCH /v1/reservas-salas/:id` retorna 200
- Quando a resposta chega
- Então o card é atualizado com novo horário e toast "Reserva atualizada" é exibido

**CA-008**
- Dado que uma reserva tem `data_hora_fim < now()`
- Quando renderizo o card
- Então botões "Editar" e "Cancelar" NÃO aparecem (reunião já encerrada)

**CA-009**
- Dado que clico em "Cancelar" e confirmo no AlertDialog
- Quando `DELETE /v1/reservas-salas/:id` retorna 200
- Então badge muda para "Cancelada" e botões desaparecem

**CA-010**
- Dado que seleciono horário fim igual ao horário início
- Quando valido no cliente
- Então erro inline "Horário fim deve ser posterior ao início" é exibido sem chamar a API
