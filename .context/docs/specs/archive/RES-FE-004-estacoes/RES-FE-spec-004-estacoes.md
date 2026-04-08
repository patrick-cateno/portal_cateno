# RES-FE-SPEC-004 — Gestão de Estações de Trabalho (Admin)

> Status: Aguardando aprovação
> Role exigida: `reservas:admin` ou `admin`
> Rota: `/reservas/admin/estacoes`
> Depende de: RES-FE-001, RES-FE-002

---

## 1. Objetivo

Tela de administração para listar, criar, editar, desativar, bloquear e desbloquear
estações de trabalho, com visão de status por escritório.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint                          | Uso                       |
|--------|-----------------------------------|---------------------------|
| GET    | `/v1/estacoes`                    | Listar com paginação      |
| POST   | `/v1/estacoes`                    | Criar                     |
| PATCH  | `/v1/estacoes/:id`                | Editar nome/escritório    |
| DELETE | `/v1/estacoes/:id`                | Desativar (soft delete)   |
| PATCH  | `/v1/estacoes/:id/bloquear`       | Bloquear temporariamente  |
| PATCH  | `/v1/estacoes/:id/desbloquear`    | Desbloquear               |
| GET    | `/v1/escritorios`                 | Popular select             |

**Query params:** `page`, `limit`, `escritorio_id`, `is_active`, `bloqueada`

**Body de criação:**
```json
{
  "nome": "A-01",
  "escritorio_id": "uuid-do-escritorio",
  "bloqueada": false
}
```

---

## 3. Layout da Tela

### 3.1 Page Header
```
[Título: "Estações de Trabalho"]          [Botão: "+ Nova Estação"]
```

### 3.2 Filtros
```
[Select: Escritório]  [Select: Status (Todas/Ativas/Bloqueadas/Inativas)]
```

### 3.3 Tabela de listagem

Colunas:
| Nome | Escritório | Status | Ações |

**Status** — combinação de `is_active` e `bloqueada`:

| is_active | bloqueada | Badge                                    |
|-----------|-----------|------------------------------------------|
| true      | false     | 🟢 "Disponível" (`#10B981`)              |
| true      | true      | 🟡 "Bloqueada" (`#F59E0B`)               |
| false     | qualquer  | ⚫ "Inativa" (`#64748B`)                 |

**Ações** (por linha):
- Ícone editar (lápis) → abre modal de edição
- Ícone cadeado fechado → bloquear (se disponível)
- Ícone cadeado aberto → desbloquear (se bloqueada)
- Ícone X → desativar (se ativa)

### 3.4 Modal: Criar / Editar Estação

Campos:
- **Nome** (obrigatório, max 50) — ex: "A-01", "Mesa 12"
- **Escritório** (obrigatório) — select de escritórios ativos

> Nota: o campo `bloqueada` NÃO aparece no formulário de criação/edição.
> Bloqueio/desbloqueio são ações separadas via botões da tabela.

### 3.5 Confirmações

- **Bloquear**: AlertDialog "Bloquear estação {nome}? Ela ficará indisponível para reservas."
- **Desbloquear**: Toast direto (sem confirmação), pois é ação reversível segura
- **Desativar**: AlertDialog "Desativar estação {nome}? Esta ação remove permanentemente a estação do catálogo."

---

## 4. Regras de Negócio (frontend)

**RN-FE-004-001** — Botão "bloquear" só aparece quando `is_active=true AND bloqueada=false`.

**RN-FE-004-002** — Botão "desbloquear" só aparece quando `is_active=true AND bloqueada=true`.

**RN-FE-004-003** — Botão "desativar" só aparece quando `is_active=true`.

**RN-FE-004-004** — Estações inativas (`is_active=false`) são ocultadas por padrão (filtro de status exclui inativas).

**RN-FE-004-005** — Após bloquear/desbloquear, recarregar apenas o item da linha (otimistic update ou refetch).

---

## 5. Estados de UI

| Estado             | Comportamento                                              |
|--------------------|------------------------------------------------------------|
| Carregando         | Skeleton de 5 linhas                                       |
| Lista vazia        | "Nenhuma estação cadastrada" + botão criar                 |
| Bloqueando         | Linha com spinner no botão de ação                         |
| Sucesso bloquear   | Badge muda para "Bloqueada" (amarelo) + toast              |
| Sucesso desbloquear| Badge muda para "Disponível" (verde) + toast               |
| Sucesso desativar  | Linha removida da lista + toast                            |

---

## 6. Critérios de Aceite

**CA-001**
- Dado que acesso `/reservas/admin/estacoes`
- Quando a página carrega
- Então vejo estações com badge de status colorido (verde/amarelo/cinza)

**CA-002**
- Dado que uma estação tem `is_active=true` e `bloqueada=false`
- Quando renderizo a linha
- Então aparece ícone de cadeado fechado (bloquear) e ícone X (desativar)
- E NÃO aparece ícone de cadeado aberto (desbloquear)

**CA-003**
- Dado que clico em bloquear e confirmo no AlertDialog
- Quando `PATCH /v1/estacoes/:id/bloquear` retorna 200
- Então o badge muda para "Bloqueada" e toast "Estação bloqueada" é exibido

**CA-004**
- Dado que clico em "+ Nova Estação" e preencho nome "B-05" e seleciono escritório
- Quando clico em "Salvar"
- Então `POST /v1/estacoes` é chamado com `{ nome: "B-05", escritorio_id: "...", bloqueada: false }`

**CA-005**
- Dado que filtro por escritório X
- Quando a lista recarrega
- Então `GET /v1/estacoes?escritorio_id=<uuid>&is_active=true` é chamado
