# RES-FE-SPEC-005 — Gestão de Feriados (Admin)

> Status: Aguardando aprovação
> Role exigida: `reservas:admin` ou `admin`
> Rota: `/reservas/admin/feriados`
> Depende de: RES-FE-001, RES-FE-002

---

## 1. Objetivo

Tela de administração para listar, criar, editar e desativar feriados por escritório.
Feriados com `escritorio_id = null` são nacionais e bloqueiam reservas em todos os escritórios.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint              | Uso                     |
|--------|-----------------------|-------------------------|
| GET    | `/v1/feriados`        | Listar                  |
| POST   | `/v1/feriados`        | Criar                   |
| PATCH  | `/v1/feriados/:id`    | Editar                  |
| DELETE | `/v1/feriados/:id`    | Desativar               |
| GET    | `/v1/escritorios`     | Popular select           |

**Query params:** `page`, `limit`, `escritorio_id`, `ano`, `is_active`

**Body de criação:**
```json
{
  "nome": "Natal",
  "data": "2025-12-25",
  "escritorio_id": null
}
```

> `escritorio_id: null` = feriado nacional (aplica a todos os escritórios)

---

## 3. Layout da Tela

### 3.1 Page Header
```
[Título: "Feriados"]                    [Botão: "+ Novo Feriado"]
```

### 3.2 Filtros
```
[Select: Ano (2024/2025/2026...)]   [Select: Escritório (Todos/Nacional/Escritório X)]
```

- O filtro "Escritório" tem a opção especial **"Nacional"** (sem escritório) além dos escritórios cadastrados
- O filtro de Ano padrão: ano corrente

### 3.3 Tabela de listagem

Colunas:
| Data | Nome | Abrangência | Status | Ações |

- **Data**: formatada como "25/12/2025 (Quinta-feira)"
- **Abrangência**: Badge "🌐 Nacional" (teal) ou "🏢 {Nome do Escritório}" (azul)
- **Status**: "Ativo" (verde) / "Inativo" (cinza)
- **Ações**: editar + desativar

Ordenação padrão: por data ASC.

### 3.4 Modal: Criar / Editar Feriado

Campos:
- **Nome** (obrigatório, min 2, max 100) — ex: "Natal", "Aniversário de São Paulo"
- **Data** (obrigatório) — `date picker`, formato YYYY-MM-DD
- **Abrangência** — radio button:
  - 🌐 Nacional (aplica a todos os escritórios) → envia `escritorio_id: null`
  - 🏢 Escritório específico → exibe select de escritórios ativos

---

## 4. Regras de Negócio (frontend)

**RN-FE-005-001** — Quando "Nacional" é selecionado no radio, o select de escritório é ocultado e `escritorio_id` é enviado como `null`.

**RN-FE-005-002** — O ano do filtro é gerado dinamicamente: ano atual − 1 até ano atual + 2.

**RN-FE-005-003** — Ao desativar, AlertDialog: "Feriado desativado não bloqueará mais reservas nesta data."

**RN-FE-005-004** — Data não pode ser no passado ao criar. Ao editar, a data atual é preservada mesmo que esteja no passado (não pode alterar data de feriado passado — apenas nome e abrangência).

---

## 5. Estados de UI

| Estado          | Comportamento                                              |
|-----------------|------------------------------------------------------------|
| Carregando      | Skeleton de 5 linhas                                       |
| Lista vazia     | "Nenhum feriado cadastrado para este período"              |
| Sucesso criar   | Toast "Feriado criado" + item aparece na lista             |
| Sucesso editar  | Toast "Feriado atualizado"                                 |
| Sucesso desativar| Toast "Feriado desativado"                                |

---

## 6. Critérios de Aceite

**CA-001**
- Dado que acesso `/reservas/admin/feriados`
- Quando a página carrega
- Então vejo feriados do ano corrente ordenados por data, com coluna "Abrangência"

**CA-002**
- Dado que crio um feriado com abrangência "Nacional"
- Quando submeto
- Então `POST /v1/feriados` é chamado com `{ escritorio_id: null, data: "...", nome: "..." }`

**CA-003**
- Dado que crio um feriado com abrangência "Escritório específico" e seleciono "RJ"
- Quando submeto
- Então `POST /v1/feriados` é chamado com `{ escritorio_id: "<uuid-rj>", data: "...", nome: "..." }`

**CA-004**
- Dado que um feriado tem `escritorio_id = null`
- Quando renderiza na tabela
- Então exibe badge "🌐 Nacional" na coluna Abrangência

**CA-005**
- Dado que filtro por "Escritório: Nacional"
- Quando a lista recarrega
- Então `GET /v1/feriados?ano=2025&is_active=true` é chamado sem `escritorio_id`
- E apenas feriados nacionais são exibidos (filtro no cliente por `escritorio_id === null`)

**CA-006**
- Dado que tento criar um feriado com data no passado
- Quando valido no cliente
- Então erro inline "Data não pode ser anterior a hoje" é exibido sem chamar a API
