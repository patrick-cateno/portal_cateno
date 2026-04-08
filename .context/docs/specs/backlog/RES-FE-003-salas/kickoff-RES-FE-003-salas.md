# KICKOFF — RES-FE-003 — Gestão de Salas de Reunião (Admin)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001 e RES-FE-002 concluídos e aprovados.

---

## Contexto

Você está implementando a tela de **Gestão de Salas de Reunião** do módulo de Reservas
no Portal Cateno (Next.js 15, App Router, shadcn/ui, Design System Cateno).

A estrutura base do módulo e o padrão de tabela/modal/alertdialog já foram estabelecidos
nas specs anteriores — siga os mesmos padrões visuais.

---

## Spec a implementar: RES-FE-003

Leia o arquivo `.context/docs/specs/backlog/RES-FE-003-salas/RES-FE-spec-003-salas.md` completo antes de começar.

---

## Contrato da API (ms-reservas — já implementado)

```typescript
// GET /v1/salas
// Query: { page, limit, escritorio_id?: UUID, is_active: boolean = true }
// Response: PaginatedResponse<Sala>

// POST /v1/salas
// Body: { nome: string, escritorio_id: UUID, foto_url?: string | null }
// Response: Sala (201)

// PATCH /v1/salas/:id
// Body: { nome?, escritorio_id?, foto_url? }
// Response: Sala (200)

// DELETE /v1/salas/:id
// Response: Sala (200) — soft delete

// GET /v1/escritorios?is_active=true&limit=100
// Response: PaginatedResponse<Escritorio> — para popular selects

interface Sala {
  id: string;
  nome: string;
  escritorioId: string;
  fotoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

**Arquivo principal:** `app/(portal)/reservas/admin/salas/page.tsx`

### Componentes a criar:

**1. Tabela de listagem:**
- Colunas: Foto | Nome | Escritório | Status | Ações
- **Foto:** thumbnail 40×40px, `border-radius: 8px`
  - Se `fotoUrl` for null: ícone `Camera` (lucide) centralizado em fundo `#F1F5F9`
  - Se `fotoUrl` existir: `<Image>` Next.js com `objectFit: cover`
- **Escritório:** exibir o nome (fazer join na query ou enriquecer após fetch)
- **Status:** badge verde "Ativa" / cinza "Inativa"
- **Ações:** ícone `Pencil` (editar) + ícone `X` (desativar)

**2. Filtros:**
- Select "Escritório" — carregado via `GET /v1/escritorios?is_active=true&limit=100`
  - Primeira opção: "Todos os escritórios" (sem filtro)
- Toggle "Mostrar inativos"

**3. Modal Criar/Editar:**
- Campo **Nome** (obrigatório, min 2, max 100)
- Campo **Escritório** (obrigatório) — select de escritórios ativos
- Campo **URL da Foto** (opcional) — validação `https://` client-side

**4. AlertDialog de desativação:**
- "Salas inativas não aparecem para reserva."

**5. States:**
- Loading: Skeleton 5 linhas
- Lista vazia: ícone `DoorOpen` + "Nenhuma sala cadastrada" + botão criar
- Toast de sucesso/erro via sonner

---

## Design System Cateno — tokens obrigatórios

```
Cor primária:        #0D9488
Background página:   #F0FDFA
Background card:     #FFFFFF
Borda padrão:        #E2E8F0
Texto primário:      #1E293B
Texto secundário:    #64748B
Badge success:       #10B981
Badge inativo:       #64748B
Foto placeholder bg: #F1F5F9
Border radius card:  16px
Border radius btn:   8px
```

---

## Regras invioláveis

1. **Role guard:** `reservas:admin` ou `admin` apenas
2. **Select de escritório** sempre com `is_active=true` (nunca listar escritórios inativos nos forms)
3. **Foto null:** sempre renderizar placeholder (nunca `<img>` com src vazio ou quebrado)
4. **Após criar/editar:** fechar modal + refetch
5. **Após desativar:** remover da lista (filtro padrão `is_active=true`) + toast

---

## Critérios de aceite (verificar antes de concluir)

- [ ] CA-001: lista com colunas Foto, Nome, Escritório, Status, Ações
- [ ] CA-002: filtro por escritório chama `GET /v1/salas?escritorio_id=<uuid>&is_active=true`
- [ ] CA-003: POST `/v1/salas` chamado com `nome`, `escritorio_id`, `foto_url`
- [ ] CA-004: `fotoUrl = null` renderiza ícone Camera como placeholder
- [ ] CA-005: DELETE + confirmação AlertDialog → sala some da lista + toast


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → liste componentes e arquivos a criar
2. **Review** → aguarde aprovação
3. **Execute** → implemente
4. **Verify** → cheque cada CA
5. **Complete** → reporte

**Não avance para RES-FE-004 sem aprovação.**
