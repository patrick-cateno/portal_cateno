# KICKOFF — RES-FE-007 — Reserva de Sala de Reunião (Usuário)

Cole este prompt no Claude Code na raiz do **portal-cateno**.
**Pré-requisito:** RES-FE-001 a 006 concluídos e aprovados.

---

## Contexto

Você está implementando o **fluxo de reserva de sala de reunião** — a spec mais complexa
do módulo. Diferente da reserva de estação (dia inteiro), aqui o usuário escolhe uma
**faixa de horário** com granularidade de 30 minutos. Há também **edição de reservas**
(horário + título) desde que a reunião não tenha encerrado.

---

## Spec a implementar: RES-FE-007

Leia `.context/docs/specs/backlog/RES-FE-007-reserva-sala/RES-FE-spec-007-reserva-sala.md` completo.

---

## Contrato da API (ms-reservas)

```typescript
// GET /v1/salas?escritorio_id=UUID&is_active=true
// Response: PaginatedResponse<Sala>

// GET /v1/reservas-salas
// Query: { sala_id?, escritorio_id?, data_inicio?, data_fim?, page, limit }
// Response: PaginatedResponse<ReservaSala>
// Uso: verificar disponibilidade de uma sala em uma data

// POST /v1/reservas-salas
// Body: {
//   sala_id: UUID,
//   titulo: string (min 3, max 200),
//   data_hora_inicio: string (ISO 8601),
//   data_hora_fim: string (ISO 8601)
// }
// Response: ReservaSala (201)
// Erros: 409 SALA_CONFLITO_HORARIO | 422 FERIADO_NA_DATA

// PATCH /v1/reservas-salas/:id
// Body: { titulo?, data_hora_inicio?, data_hora_fim? }
// Response: ReservaSala
// Erros: 409 SALA_CONFLITO_HORARIO

// DELETE /v1/reservas-salas/:id → cancelar (soft delete)

// GET /v1/reservas-salas/minhas
// Query: { page, limit, data_inicio?, data_fim? }
// Response: PaginatedResponse<ReservaSala & { sala: Sala & { escritorio: Escritorio } }>

interface ReservaSala {
  id: string;
  salaId: string;
  titulo: string;
  dataHoraInicio: string;  // ISO 8601 com timezone
  dataHoraFim: string;     // ISO 8601 com timezone
  userId: string;
  isActive: boolean;       // false = cancelada
  createdAt: string;
  updatedAt: string;
}
```

---

## O que implementar

### Arquivo 1: `app/(portal)/reservas/nova-reserva/sala/page.tsx`

**Stepper de 3 passos:**

**Passo 1 — Data e Escritório:** (igual ao da estação, reuse o componente se possível)
- Select de escritório
- Date picker: mínimo = hoje (reunião pode ser no mesmo dia), máximo = hoje + 30 dias
- Fins de semana desabilitados

**Passo 2 — Escolher Sala e Horário:**

> **Usar `dynamic()` — ambos os componentes são puramente client-side:**
> ```typescript
> import dynamic from 'next/dynamic'
> const CardsSalas = dynamic(
>   () => import('../_components/CardsSalas'),
>   { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
> )
> const GradeHorarios = dynamic(
>   () => import('../_components/GradeHorarios'),
>   { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl" /> }
> )
> ```

Layout em dois painéis lado a lado:

*Painel esquerdo — Cards de sala:*
```tsx
// Cada sala como card clicável
<SalaCard
  sala={sala}
  selected={salaId === sala.id}
  onClick={() => setSalaId(sala.id)}
/>
// Card selecionado: border 2px #0D9488, background #F0FDFA
```

*Painel direito — Grade de slots de 30min:*

```typescript
// Gerar slots de 08:00 a 18:00 (intervalo de 30min)
function gerarSlots(): string[] {
  const slots = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots; // ["08:00", "08:30", ..., "17:30"]
}

// Verificar se slot está ocupado (buscar reservas da sala nessa data)
// GET /v1/reservas-salas?sala_id=<uuid>&data_inicio=2026-04-10&data_fim=2026-04-10
function isSlotOcupado(slot: string, reservas: ReservaSala[]): boolean {
  const slotTime = parseHorario(slot, data);
  return reservas.some(r =>
    r.isActive &&
    slotTime >= new Date(r.dataHoraInicio) &&
    slotTime < new Date(r.dataHoraFim)
  );
}
```

**Seleção de range:**
```typescript
// Usuário clica em início, depois em fim
// Slots intermediários ficam selecionados automaticamente
type RangeState = { inicio: string | null; fim: string | null }

// Validações client-side:
// - fim deve ser > início
// - duração mínima: 30 minutos (fim = índice > índice de início)
// - slots ocupados não podem ser selecionados nem incluídos no range
```

**Estilos de slot:**
```typescript
const slotStyles = {
  livre:     { bg: '#F0FDFA', border: '1px solid #0D9488', cursor: 'pointer' },
  ocupado:   { bg: '#FEE2E2', border: '1px solid #EF4444', cursor: 'not-allowed' },
  selected:  { bg: '#0D9488', color: '#FFF', border: '1px solid #0F766E' },
  inRange:   { bg: '#CCFBF1', border: '1px solid #5EEAD4' },
}
```

**Passo 3 — Título e Confirmação:**
- Input de título (obrigatório, min 3, max 200)
- Card de resumo: Sala, Data, Horário (ex: "09:00 até 10:30 — 1h30"), Título
- Botão [Confirmar Reserva] com spinner

---

### Arquivo 2: `app/(portal)/reservas/minhas-salas/page.tsx`

**Cards de reserva:**
```tsx
<ReservaSalaCard
  reserva={reserva}
  onEditar={handleEditar}
  onCancelar={handleCancelar}
/>
```

**Mostrar botão "Editar" quando:** `isActive=true AND new Date(dataHoraFim) > new Date()`
**Mostrar botão "Cancelar" quando:** `isActive=true AND new Date(dataHoraFim) > new Date()`

**Modal de Edição (inline):**
- Campos: Título, Data, Select início (08:00–17:30), Select fim (08:30–18:00)
- Select fim: apenas opções > início selecionado
- Ao salvar: `PATCH /v1/reservas-salas/:id` com campos alterados em UTC
- Erro 409 no modal: mensagem inline "Horário indisponível — escolha outro."

**Badges:**
```typescript
const badgeConfig = {
  true:  { label: 'Ativa',      bg: '#ECFDF5', color: '#10B981' },
  false: { label: 'Cancelada',  bg: '#F1F5F9', color: '#64748B' },
}
// usar isActive como chave
```

---

## Conversão de timezone (CRÍTICO)

```typescript
// Ao ENVIAR para a API: converter para UTC ISO 8601
function toUTCISO(date: Date, horario: string): string {
  const [h, m] = horario.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString(); // UTC
}

// Ao EXIBIR para o usuário: converter UTC → timezone local
function formatarHorario(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}
```

---

## Tratamento de erros

```typescript
catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'SALA_CONFLITO_HORARIO':
        toast.error('Sala indisponível no horário selecionado. Escolha outro horário.');
        break;
      case 'FERIADO_NA_DATA':
        toast.error(`Esta data é feriado: ${error.details?.nome ?? ''}`);
        break;
      default:
        toast.error('Erro ao criar reserva. Tente novamente.');
    }
  }
}
```

---

## Design System Cateno

```
Slot livre:      bg #F0FDFA, borda #0D9488
Slot ocupado:    bg #FEE2E2, borda #EF4444
Slot selecionado:bg #0D9488, text branco
Slot no range:   bg #CCFBF1, borda #5EEAD4
Card sala sel.:  border 2px #0D9488, bg #F0FDFA
Badge ativa:     bg #ECFDF5, text #10B981
Badge cancelada: bg #F1F5F9, text #64748B
Cor primária:    #0D9488
Background:      #F0FDFA
```

---

## Regras invioláveis

1. **Timezone UTC** — toda data/hora enviada em UTC; exibida no timezone local do browser
2. **Duração mínima 30min** — validação client antes de chamar API
3. **Fim > Início** — validação client-side
4. **Slot ocupado** não clicável e não incluível em range
5. **Edição apenas** se `dataHoraFim > now()` — validar no client ao renderizar botões
6. **Erro 409 no modal de edição** — exibir inline no modal, não toast global

---

## Critérios de aceite

- [ ] CA-001: GET `/v1/salas?escritorio_id=<uuid>&is_active=true` chamado ao avançar passo 1
- [ ] CA-002: seleção de range — slots 09:00, 09:30, 10:00 ficam teal com fim em 10:30
- [ ] CA-003: POST com ISO 8601 UTC + tela de sucesso
- [ ] CA-004: slot ocupado em vermelho, não clicável
- [ ] CA-005: erro 409 → toast "Sala indisponível no horário selecionado"
- [ ] CA-006: botão Editar abre modal com campos pré-preenchidos
- [ ] CA-007: PATCH retorna 200 → card atualizado + toast "Reserva atualizada"
- [ ] CA-008: reunião encerrada (`dataHoraFim < now()`) → sem botões Editar/Cancelar
- [ ] CA-009: Cancelar + AlertDialog + DELETE → badge "Cancelada"
- [ ] CA-010: fim = início → erro inline "Horário fim deve ser posterior ao início"


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento de código** — Todo código deste módulo vive em `app/(portal)/reservas/`. Arquivos de `_lib/` e `_components/` NÃO podem ser importados por outros módulos.

2. **Sem `components/` globais** — NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo. Use `app/(portal)/reservas/_components/`.

3. **`dynamic()` em componentes interativos pesados** — Qualquer componente que renderiza exclusivamente no cliente (grades visuais, calendários, seletores complexos) DEVE usar `dynamic(..., { ssr: false })`.

4. **Sem estado global compartilhado** — Nenhum estado Zustand, Context ou similar que cruze a fronteira deste módulo com outro.

## Workflow P→R→E→V→C
1. **Plan** → liste os dois arquivos, componentes de slot e lógica de timezone
2. **Review** → aguarde aprovação
3. **Execute** → implemente (wizard primeiro, depois lista)
4. **Verify** → cheque cada CA incluindo timezone
5. **Complete** → reporte conclusão do módulo completo de reservas

**Esta é a última spec do módulo. Ao concluir, o módulo de Reservas está completo.**
