# KICKOFF — RES-FE-004 — Gestão de Estações de Trabalho (Admin)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001, 002 e 003 concluídos e aprovados.

---

## Contexto

Você está implementando a tela de **Gestão de Estações de Trabalho** do módulo de Reservas.
Esta spec tem uma particularidade importante: estação tem **dois estados independentes**:
`is_active` (desativação permanente) e `bloqueada` (bloqueio operacional temporário).
As ações de bloquear/desbloquear são endpoints separados no backend.

---

## Spec a implementar: RES-FE-004

Leia `.context/docs/specs/backlog/RES-FE-004-estacoes/RES-FE-spec-004-estacoes.md` completo.

---

## Contrato da API (ms-reservas)

```typescript
// GET /v1/estacoes
// Query: { page, limit, escritorio_id?, is_active: boolean = true, bloqueada?: boolean }
// Response: PaginatedResponse<EstacaoTrabalho>

// POST /v1/estacoes
// Body: { nome: string, escritorio_id: UUID, bloqueada: boolean = false }
// Response: EstacaoTrabalho (201)

// PATCH /v1/estacoes/:id
// Body: { nome?, escritorio_id? }
// Response: EstacaoTrabalho

// DELETE /v1/estacoes/:id           → soft delete (is_active = false)
// PATCH  /v1/estacoes/:id/bloquear  → bloqueada = true
// PATCH  /v1/estacoes/:id/desbloquear → bloqueada = false

interface EstacaoTrabalho {
  id: string;
  nome: string;
  escritorioId: string;
  isActive: boolean;
  bloqueada: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

**Arquivo principal:** `app/(portal)/reservas/admin/estacoes/page.tsx`

### Lógica de status (CRÍTICA — combina dois campos):

```typescript
function getEstacaoStatus(e: EstacaoTrabalho): 'disponivel' | 'bloqueada' | 'inativa' {
  if (!e.isActive) return 'inativa';
  if (e.bloqueada) return 'bloqueada';
  return 'disponivel';
}

const statusConfig = {
  disponivel: { label: 'Disponível', color: '#10B981', bg: '#ECFDF5' },
  bloqueada:  { label: 'Bloqueada',  color: '#B45309', bg: '#FEF3C7' },
  inativa:    { label: 'Inativa',    color: '#64748B', bg: '#F1F5F9' },
}
```

### Componentes a criar:

**1. Tabela de listagem:**
- Colunas: Nome | Escritório | Status | Ações
- Badge colorido de status (3 variantes acima)

**2. Ações por linha (condicional):**

```typescript
// Renderizar ações com base no status:
// isActive=true, bloqueada=false  → [Editar] [Bloquear🔒] [Desativar✗]
// isActive=true, bloqueada=true   → [Editar] [Desbloquear🔓] [Desativar✗]
// isActive=false                  → (sem ações — linha oculta por padrão)
```

**3. Confirmações:**
- **Bloquear:** AlertDialog com "Estação ficará indisponível para reservas."
- **Desbloquear:** Toast direto (sem AlertDialog — ação segura reversível)
- **Desativar:** AlertDialog com "Esta ação remove a estação do catálogo."

**4. Filtros:**
- Select de escritório (padrão do portal)
- Select de Status: "Todas" | "Disponíveis" | "Bloqueadas" (inativos ocultos por padrão)

**5. Modal Criar/Editar:**
- Campos: Nome (obrigatório, max 50), Escritório (select obrigatório)
- **Não expor campo `bloqueada` no form** — bloqueio é ação separada na tabela

---

## Design System Cateno

```
Disponível: bg #ECFDF5, text #10B981
Bloqueada:  bg #FEF3C7, text #B45309
Inativa:    bg #F1F5F9, text #64748B
Cor primária: #0D9488
Background página: #F0FDFA
```

---

## Regras invioláveis

1. **Botão bloquear** só renderiza quando `isActive=true AND bloqueada=false`
2. **Botão desbloquear** só renderiza quando `isActive=true AND bloqueada=true`
3. **Botão desativar** só renderiza quando `isActive=true`
4. **Bloquear/desbloquear:** refetch da linha após resposta (ou otimistic update)
5. **Campo `bloqueada`** nunca aparece em formulário de criação/edição

---

## Critérios de aceite

- [ ] CA-001: badges com 3 variantes de status (verde/amarelo/cinza)
- [ ] CA-002: estação `isActive=true, bloqueada=false` → mostra bloquear + desativar, NÃO desbloquear
- [ ] CA-003: PATCH `/bloquear` → badge muda para "Bloqueada" + toast
- [ ] CA-004: POST com `{ nome, escritorio_id, bloqueada: false }`
- [ ] CA-005: filtro por escritório chama `GET /v1/estacoes?escritorio_id=<uuid>&is_active=true`


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → liste componentes, arquivos e lógica de status
2. **Review** → aguarde aprovação
3. **Execute** → implemente
4. **Verify** → cheque cada CA
5. **Complete** → reporte

**Não avance para RES-FE-005 sem aprovação.**
