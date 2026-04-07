# RES-FE-PLAN-001 — Setup do Módulo Frontend de Reservas

## Fases de implementação

### Fase 1 — Estrutura de pastas e tipos
- [ ] Criar `app/(portal)/reservas/layout.tsx` com sidebar contextual
- [ ] Criar `app/(portal)/reservas/page.tsx` com redirect
- [ ] Criar `app/(portal)/reservas/_lib/types.ts` com todos os tipos TS
- [ ] Criar `app/(portal)/reservas/_lib/client.ts` com fetch base e ApiError

### Fase 2 — Clients de API
- [ ] Criar `app/(portal)/reservas/_lib/escritorio.api.ts`
- [ ] Criar `app/(portal)/reservas/_lib/sala.api.ts`
- [ ] Criar `app/(portal)/reservas/_lib/estacao.api.ts`
- [ ] Criar `app/(portal)/reservas/_lib/feriado.api.ts`
- [ ] Criar `app/(portal)/reservas/_lib/reserva-estacao.api.ts`
- [ ] Criar `app/(portal)/reservas/_lib/reserva-sala.api.ts`

### Fase 3 — Guards e variáveis de ambiente
- [ ] Implementar guard de role nas rotas admin
- [ ] Adicionar `NEXT_PUBLIC_MS_RESERVAS_URL` no `.env.example`
- [ ] Validar variável de ambiente no startup

### Fase 4 — Testes
- [ ] CA-001: redirect de acesso não autorizado
- [ ] CA-002: redirect da rota raiz
- [ ] CA-003: tratamento de 401
- [ ] CA-004 e CA-005: visibilidade da sidebar por role
