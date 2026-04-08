# KICKOFF — RES-FE-006 — Reserva de Estação de Trabalho (Usuário)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001 a 005 concluídos e aprovados.

---

## Contexto

Você está implementando o **fluxo de reserva de estação de trabalho** — a funcionalidade
principal do módulo para usuários comuns. Esta spec tem dois componentes:

1. **Wizard de criação** em 3 passos (`/reservas/nova-reserva/estacao`)
2. **Listagem de minhas reservas** (`/reservas/minhas-estacoes`) com check-in e cancelamento

É a spec mais complexa do módulo. Leia a spec completa antes de planejar.

---

## Spec a implementar: RES-FE-006

Leia `.context/docs/specs/backlog/RES-FE-006-reserva-estacao/RES-FE-spec-006-reserva-estacao.md` completo.

---

## Contrato da API (ms-reservas)

```typescript
// GET /v1/reservas-estacoes/disponibilidade
// Query: { escritorio_id: UUID (obrigatório), data: "YYYY-MM-DD" (obrigatório) }
// Response:
interface DisponibilidadeResponse {
  escritorioId: string;
  data: string;
  estacoes: {
    id: string;
    nome: string;
    status: 'livre' | 'reservada' | 'bloqueada' | 'inativa';
    reservaId?: string;
    userId?: string;
  }[];
}

// POST /v1/reservas-estacoes
// Body: { estacao_id: UUID, data_reserva: "YYYY-MM-DD" }
// Response: ReservaEstacao (201)
// Erros: 409 RESERVA_JA_EXISTE_NA_DATA | 422 FERIADO_NA_DATA

// DELETE /v1/reservas-estacoes/:id   → cancelar
// POST   /v1/reservas-estacoes/:id/checkin → check-in

// GET /v1/reservas-estacoes/minhas
// Query: { page, limit, data_inicio?, data_fim?, situacao? }
// Response: PaginatedResponse<ReservaEstacao & { estacao: EstacaoTrabalho & { escritorio: Escritorio } }>

type SituacaoReservaEstacao = 'confirmada' | 'cancelada' | 'concluida';

interface ReservaEstacao {
  id: string;
  estacaoId: string;
  dataReserva: string;         // YYYY-MM-DD
  userId: string;
  situacao: SituacaoReservaEstacao;
  checkinRealizado: boolean;
  checkinTimestamp: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

### Arquivo 1: `app/(portal)/reservas/nova-reserva/estacao/page.tsx`

**Stepper de 3 passos:**

```tsx
// Componente de progresso visual
<StepIndicator steps={['Data e Local', 'Escolher Estação', 'Confirmação']} current={step} />
```

**Passo 1 — Data e Escritório:**
- Select de escritório (GET /v1/escritorios?is_active=true)
- Date picker com restrições:
  ```typescript
  minDate = addDays(today, 1)       // amanhã no mínimo
  maxDate = addDays(today, 30)      // máximo 30 dias
  disabledDays = [{ dayOfWeek: [0, 6] }]  // sem fim de semana
  ```
- Botão "Ver disponibilidade →" → chama API + avança para passo 2

**Passo 2 — Grade de estações:**

> **Usar `dynamic()` — componente puramente client-side:**
> ```typescript
> import dynamic from 'next/dynamic'
> const GradeEstacoes = dynamic(
>   () => import('../_components/GradeEstacoes'),
>   { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
> )
> ```

```tsx
// Grid visual de estações
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
  {estacoes.map(estacao => (
    <EstacaoCard
      key={estacao.id}
      nome={estacao.nome}
      status={estacao.status}
      selected={selected === estacao.id}
      onClick={() => estacao.status === 'livre' && setSelected(estacao.id)}
    />
  ))}
</div>
```

**EstacaoCard — estilos por status:**
```typescript
const estilos = {
  livre:     { bg: '#F0FDFA', border: '#0D9488', cursor: 'pointer' },
  reservada: { bg: '#F1F5F9', border: '#CBD5E1', cursor: 'not-allowed', opacity: 0.7 },
  bloqueada: { bg: '#FEF3C7', border: '#F59E0B', cursor: 'not-allowed' },
  inativa:   { bg: '#F8FAFC', border: '#E2E8F0', cursor: 'not-allowed', opacity: 0.4 },
  selected:  { bg: '#0D9488', border: '#0F766E', color: '#FFF' },
}
```

**Legenda abaixo da grade:**
```
🟢 Livre  ⬜ Reservada  🟡 Bloqueada  ⚫ Inativa
```

**Passo 3 — Confirmação:**
- Card de resumo: escritório, data formatada, nome da estação
- Botão [← Voltar] e [Confirmar Reserva] (com spinner)
- Em caso de erro 409: toast + permanecer no passo 3
- Em caso de sucesso: tela de confirmação com botões "Fazer nova reserva" e "Ver minhas reservas"

---

### Arquivo 2: `app/(portal)/reservas/minhas-estacoes/page.tsx`

**Tabs de filtro:** `Futuras | Passadas | Todas`
- Futuras: `data_reserva >= hoje AND situacao = confirmada`
- Passadas: `data_reserva < hoje`

**Card de reserva:**
```tsx
<ReservaEstacaoCard
  reserva={reserva}
  isToday={reserva.dataReserva === hoje}
  onCheckin={handleCheckin}
  onCancelar={handleCancelar}
/>
```

**Badge de situação:**
```typescript
const badgeConfig = {
  confirmada: { label: 'Confirmada', bg: '#ECFDF5', color: '#10B981' },
  concluida:  { label: 'Concluída',  bg: '#F0FDFA', color: '#0D9488' },
  cancelada:  { label: 'Cancelada',  bg: '#F1F5F9', color: '#64748B' },
}
```

**Botão Check-in:**
- Visível: `situacao === 'confirmada' AND dataReserva === hoje AND !checkinRealizado`
- Após check-in: substituir por `<span>✓ Check-in realizado às {hora}</span>`

**Botão Cancelar:**
- Visível: `situacao === 'confirmada' AND dataReserva >= hoje`
- AlertDialog antes de DELETE

---

## Tratamento de erros da API

```typescript
// Ao criar reserva:
catch (error) {
  if (error instanceof ApiError) {
    if (error.code === 'RESERVA_JA_EXISTE_NA_DATA') {
      toast.error('Você já tem uma reserva para este dia.')
    } else if (error.code === 'FERIADO_NA_DATA') {
      toast.error(`Esta data é feriado: ${error.details?.nome ?? ''}`)
    } else {
      toast.error('Erro ao criar reserva. Tente novamente.')
    }
  }
}
```

---

## Design System Cateno

```
Cor primária:          #0D9488
Background página:     #F0FDFA
Estação livre borda:   #0D9488
Estação selecionada:   bg #0D9488, text branco
Estação reservada:     bg #F1F5F9
Estação bloqueada:     bg #FEF3C7
Badge confirmada:      #10B981
Badge concluída:       #0D9488
Badge cancelada:       #64748B
```

---

## Regras invioláveis

1. **Data mínima = amanhã** — nunca deixar o usuário reservar para hoje
2. **Fins de semana desabilitados** no date picker
3. **Check-in apenas no dia da reserva** — botão oculto em outros dias
4. **Erros 409/422** tratados com toast específico (não genérico)
5. **Após confirmar reserva** — exibir tela de sucesso, não redirect automático

---

## Critérios de aceite

- [ ] CA-001: `GET /disponibilidade?escritorio_id=<uuid>&data=YYYY-MM-DD` chamado ao avançar passo 1
- [ ] CA-002: POST cria reserva + tela de sucesso exibida
- [ ] CA-003: erro 409 → toast "Você já tem uma reserva para este dia"
- [ ] CA-004: erro 422 FERIADO → toast com nome do feriado
- [ ] CA-005: botão Check-in visível apenas na reserva de hoje sem check-in feito
- [ ] CA-006: POST checkin → botão substituído por "✓ Check-in realizado"
- [ ] CA-007: Cancelar + AlertDialog + DELETE → badge "Cancelada" + botões somem
- [ ] CA-008: data no passado não selecionável no datepicker


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → liste os dois arquivos principais, componentes e fluxo do stepper
2. **Review** → aguarde aprovação
3. **Execute** → implemente (passo a passo: wizard primeiro, depois lista)
4. **Verify** → cheque cada CA
5. **Complete** → reporte

**Não avance para RES-FE-007 sem aprovação.**
