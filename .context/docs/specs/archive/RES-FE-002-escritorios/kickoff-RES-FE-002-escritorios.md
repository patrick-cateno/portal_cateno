# KICKOFF — RES-FE-002 — Gestão de Escritórios (Admin)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001 concluído e aprovado.

---

## Contexto

Você está implementando a tela de **Gestão de Escritórios** do módulo de Reservas
no Portal Cateno (Next.js 15, App Router, shadcn/ui, Design System Cateno).

A estrutura base do módulo (`layout.tsx`, `app/(portal)/reservas/_lib/`, tipos) já foi criada na RES-FE-001.

---

## Spec a implementar: RES-FE-002

Leia o arquivo `.context/docs/specs/backlog/RES-FE-002-escritorios/RES-FE-spec-002-escritorios.md` completo antes de começar.

---

## Contrato da API (ms-reservas — já implementado)

```typescript
// GET /v1/escritorios
// Query: { page, limit, cidade?, is_active: boolean = true }
// Response: PaginatedResponse<Escritorio>

// POST /v1/escritorios
// Body: { nome: string, cidade: string, planta_baixa_url?: string | null }
// Response: Escritorio (201)

// PATCH /v1/escritorios/:id
// Body: { nome?, cidade?, planta_baixa_url? }
// Response: Escritorio (200)

// DELETE /v1/escritorios/:id
// Response: Escritorio (200) — soft delete, is_active = false

interface Escritorio {
  id: string;           // UUID
  nome: string;
  cidade: string;
  plantaBaixaUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

**Arquivo principal:** `app/(portal)/reservas/admin/escritorios/page.tsx`

### Componentes a criar (em `app/(portal)/reservas/_components/escritorios/` ou inline):

**1. Tabela de listagem:**
- Colunas: Nome | Cidade | Status | Ações
- Status: badge `#10B981` "Ativo" / `#64748B` "Inativo"
- Hover de linha: `background: #F1F5F9`
- Ações: botão editar (ícone `Pencil`) + botão desativar (ícone `X`)
- Paginação: "Mostrando X–Y de Z registros" + botões anterior/próximo

**2. Filtros no topo:**
- Input de busca (filtra localmente por nome/cidade após fetch)
- Toggle "Mostrar inativos" — alterna `is_active` na query

**3. Modal de Criar/Editar** (shadcn/ui `Dialog`):
- Campos: Nome (obrigatório), Cidade (obrigatório), URL Planta Baixa (opcional)
- Validação client-side: URL deve começar com `https://`
- Botões: [Cancelar] ghost + [Salvar] teal primário com spinner durante loading

**4. AlertDialog de desativação** (usar componente `AlertDialog` já existente no portal):
- Título: "Desativar escritório?"
- Descrição: "Salas e estações deste escritório não ficarão disponíveis para reservas."
- Botões: [Cancelar] e [Desativar] (danger)

**5. Estados:**
- Loading: `Skeleton` (shadcn) em 5 linhas da tabela
- Lista vazia: ícone `Building2` + "Nenhum escritório cadastrado" + botão criar
- Erros: `toast.error(...)` via sonner

---

## Design System Cateno — tokens obrigatórios

```
Cor primária (botões, links):  #0D9488
Hover botão:                   #0F766E
Background página:             #F0FDFA
Background card/modal:         #FFFFFF
Borda padrão:                  #E2E8F0
Borda hover card:              #5EEAD4
Texto primário:                #1E293B
Texto secundário:              #64748B
Badge success:                 #10B981
Badge inativo:                 #64748B
Border radius card:            16px
Border radius botão/input:     8px
Fonte:                         Inter
```

---

## Page Header pattern (padrão do portal)

```tsx
<div className="flex items-center justify-between mb-6">
  <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A' }}>
    Escritórios
  </h1>
  <button style={{ background: '#0D9488', color: '#FFF', borderRadius: 8, padding: '10px 20px' }}>
    + Novo Escritório
  </button>
</div>
```

---

## Regras invioláveis

1. **Role guard:** página redireciona para `/` se não for `reservas:admin` ou `admin`
2. **Token JWT** injetado via `app/(portal)/reservas/_lib/client.ts` (já criado na RES-FE-001)
3. **Após criar/editar:** fechar modal + refetch da lista
4. **Após desativar:** remover da lista se `is_active=true` (filtro padrão) + toast
5. **Inativas com toggle ativo:** renderizar com `opacity: 0.6` e badge cinza

---

## Critérios de aceite (verificar antes de concluir)

- [ ] CA-001: lista paginada de escritórios ativos com colunas corretas
- [ ] CA-002: POST `/v1/escritorios` chamado ao criar com campos corretos
- [ ] CA-003: PATCH `/v1/escritorios/:id` chamado ao editar
- [ ] CA-004: DELETE chamado após confirmar AlertDialog; escritório some da lista
- [ ] CA-005: toggle "Mostrar inativos" exibe inativos com opacity 0.6
- [ ] CA-006: URL sem `https://` mostra erro inline sem chamar API


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → apresente os componentes que criará
2. **Review** → aguarde aprovação
3. **Execute** → implemente
4. **Verify** → cheque cada CA
5. **Complete** → reporte conclusão

**Não avance para RES-FE-003 sem aprovação.**
