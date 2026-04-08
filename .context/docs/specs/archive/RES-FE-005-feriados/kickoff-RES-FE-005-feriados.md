# KICKOFF — RES-FE-005 — Gestão de Feriados (Admin)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001 a 004 concluídos e aprovados.

---

## Contexto

Você está implementando a tela de **Gestão de Feriados** do módulo de Reservas.
O ponto-chave desta spec é a distinção entre feriados **Nacionais** (`escritorio_id = null`)
e feriados **por Escritório** (`escritorio_id = UUID`). O campo `escritorio_id` no backend
é nullable — quando `null`, o feriado bloqueia reservas em todos os escritórios.

---

## Spec a implementar: RES-FE-005

Leia `.context/docs/specs/backlog/RES-FE-005-feriados/RES-FE-spec-005-feriados.md` completo.

---

## Contrato da API (ms-reservas)

```typescript
// GET /v1/feriados
// Query: { page, limit, escritorio_id?: UUID, ano?: number, is_active: boolean = true }
// Response: PaginatedResponse<Feriado>

// POST /v1/feriados
// Body: { nome: string, data: string (YYYY-MM-DD), escritorio_id?: UUID | null }
// Response: Feriado (201)

// PATCH /v1/feriados/:id
// Body: { nome?, data?, escritorio_id? }
// Response: Feriado

// DELETE /v1/feriados/:id
// Response: Feriado (soft delete)

interface Feriado {
  id: string;
  escritorioId: string | null;  // null = nacional
  data: string;                  // YYYY-MM-DD
  nome: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

**Arquivo principal:** `app/(portal)/reservas/admin/feriados/page.tsx`

### Componentes a criar:

**1. Tabela de listagem:**
- Colunas: Data | Nome | Abrangência | Status | Ações
- **Data:** formatar como `"25/12/2025 (Quinta-feira)"` usando `date-fns` ou `Intl`
- **Abrangência:**

```typescript
// Se escritorioId === null:
<Badge style={{ bg: '#F0FDFA', color: '#0D9488', borderRadius: 9999 }}>
  🌐 Nacional
</Badge>

// Se escritorioId !== null:
<Badge style={{ bg: '#EFF6FF', color: '#1D4ED8', borderRadius: 9999 }}>
  🏢 {nomeDoEscritorio}
</Badge>
```

**2. Filtros:**
- Select **Ano** — gerado dinamicamente: `[anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2]`
  - Padrão: ano corrente
- Select **Abrangência:**
  - "Todos"
  - "🌐 Nacional" (filtra client-side por `escritorioId === null`)
  - "🏢 {EscritorioX}" (um por escritório ativo)

**3. Modal Criar/Editar:**

Campos:
- **Nome** (obrigatório, min 2, max 100)
- **Data** (obrigatório) — date picker, formato `YYYY-MM-DD`
  - Ao criar: data mínima = amanhã
  - Ao editar: se data no passado, desabilitar campo de data (só nome/abrangência editáveis)
- **Abrangência** — radio group:
  - `( ) 🌐 Nacional` → `escritorio_id: null`
  - `( ) 🏢 Escritório específico` → exibe select de escritórios ativos

```typescript
// Lógica ao submeter:
const payload = {
  nome,
  data,
  escritorio_id: abrangencia === 'nacional' ? null : escritorioSelecionadoId,
}
```

**4. AlertDialog de desativação:**
- "Feriado desativado não bloqueará mais reservas nesta data."

---

## Design System Cateno

```
Badge Nacional: bg #F0FDFA, text #0D9488, border #5EEAD4
Badge Escritório: bg #EFF6FF, text #1D4ED8, border #BFDBFE
Badge Ativo: bg #ECFDF5, text #10B981
Badge Inativo: bg #F1F5F9, text #64748B
Cor primária: #0D9488
Background página: #F0FDFA
```

---

## Regras invioláveis

1. **`escritorio_id: null` = Nacional** — nunca enviar string `"null"`, sempre o valor JS `null`
2. **Data no passado ao editar** — campo data desabilitado (visual: `opacity: 0.5, cursor: not-allowed`)
3. **Data ao criar** — mínima: amanhã (validação client-side antes de chamar API)
4. **Ordenação:** tabela ordenada por `data ASC` (aplicar no client após fetch)
5. **Enriquecer escritório:** ao listar, buscar nome do escritório via `GET /v1/escritorios` uma vez e fazer join no client

---

## Critérios de aceite

- [ ] CA-001: feriados do ano corrente ordenados por data, coluna Abrangência visível
- [ ] CA-002: POST nacional envia `{ escritorio_id: null, ... }`
- [ ] CA-003: POST por escritório envia `{ escritorio_id: "<uuid>", ... }`
- [ ] CA-004: `escritorioId = null` → badge "🌐 Nacional"
- [ ] CA-005: filtro "Nacional" exibe apenas feriados com `escritorioId === null`
- [ ] CA-006: data no passado ao criar → erro inline sem chamar API


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → liste componentes, lógica de abrangência e filtros
2. **Review** → aguarde aprovação
3. **Execute** → implemente
4. **Verify** → cheque cada CA
5. **Complete** → reporte

**Não avance para RES-FE-006 sem aprovação.**
