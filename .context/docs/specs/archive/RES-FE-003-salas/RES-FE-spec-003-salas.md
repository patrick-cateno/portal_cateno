# RES-FE-SPEC-003 — Gestão de Salas de Reunião (Admin)

> Status: Aguardando aprovação
> Role exigida: `reservas:admin` ou `admin`
> Rota: `/reservas/admin/salas`
> Depende de: RES-FE-001, RES-FE-002

---

## 1. Objetivo

Tela de administração para listar, criar, editar e desativar salas de reunião,
organizadas por escritório.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint              | Uso                     |
|--------|-----------------------|-------------------------|
| GET    | `/v1/salas`           | Listar com paginação    |
| POST   | `/v1/salas`           | Criar nova sala         |
| PATCH  | `/v1/salas/:id`       | Editar                  |
| DELETE | `/v1/salas/:id`       | Desativar               |
| GET    | `/v1/escritorios`     | Popular select de filtro|

**Query params:** `page`, `limit`, `escritorio_id`, `is_active` (default: true)

**Body de criação:**
```json
{
  "nome": "Sala Athenas",
  "escritorio_id": "uuid-do-escritorio",
  "foto_url": "https://storage.cateno.com.br/salas/athenas.jpg"
}
```

---

## 3. Layout da Tela

### 3.1 Page Header
```
[Título: "Salas de Reunião"]          [Botão: "+ Nova Sala"]
```

### 3.2 Filtros
```
[Select: Escritório (todos)]   [Input: Buscar por nome]   [Toggle: Mostrar inativos]
```
- O Select de escritório carrega via `GET /v1/escritorios?is_active=true&limit=100`
- Opção padrão: "Todos os escritórios"

### 3.3 Tabela de listagem

Colunas:
| Foto | Nome | Escritório | Status | Ações |

- **Foto**: thumbnail 40×40px com `border-radius: 8px`, fallback ícone de câmera se `foto_url` for null
- **Status**: Badge verde "Ativa" / cinza "Inativa"
- **Ações**: ícone editar + ícone desativar

### 3.4 Modal: Criar / Editar Sala

Campos:
- **Nome** (obrigatório, min 2, max 100) — `text input`
- **Escritório** (obrigatório) — `select` populado com escritórios ativos
- **URL da Foto** (opcional) — `text input`

---

## 4. Regras de Negócio (frontend)

**RN-FE-003-001** — O select de escritório no filtro e no modal são sempre carregados com `is_active=true`.

**RN-FE-003-002** — URL de foto, quando informada, deve começar com `https://`.

**RN-FE-003-003** — Ao desativar, exibir AlertDialog: "Salas inativas não aparecem para reserva."

**RN-FE-003-004** — Salas inativas aparecem com `opacity: 0.6` quando toggle "Mostrar inativos" está ativo.

---

## 5. Estados de UI

| Estado          | Comportamento                                               |
|-----------------|-------------------------------------------------------------|
| Carregando      | Skeleton de 5 linhas                                        |
| Lista vazia     | "Nenhuma sala cadastrada para este escritório" + botão criar|
| Salvando        | Botão com spinner, desabilitado                             |
| Sucesso criar   | Toast "Sala criada com sucesso"                             |
| Sucesso editar  | Toast "Sala atualizada"                                     |
| Sucesso desativar| Toast "Sala desativada"                                    |

---

## 6. Critérios de Aceite

**CA-001**
- Dado que acesso `/reservas/admin/salas`
- Quando a página carrega
- Então vejo a lista de salas com colunas: Foto, Nome, Escritório, Status, Ações

**CA-002**
- Dado que seleciono um escritório no filtro
- Quando a lista recarrega
- Então `GET /v1/salas?escritorio_id=<uuid>&is_active=true` é chamado

**CA-003**
- Dado que clico em "+ Nova Sala" e preencho os campos obrigatórios
- Quando clico em "Salvar"
- Então `POST /v1/salas` é chamado com `nome`, `escritorio_id` e `foto_url`

**CA-004**
- Dado que `foto_url` é null
- Quando a célula de foto renderiza
- Então exibe ícone de câmera (placeholder) em vez de imagem quebrada

**CA-005**
- Dado que desativo uma sala e confirmo no AlertDialog
- Quando `DELETE /v1/salas/:id` retorna 200
- Então a sala desaparece da lista e toast "Sala desativada" é exibido
