# RES-FE-PLAN-007 — reserva-sala

## Fases de implementação

### Fase 1 — Estrutura e tipos
- [ ] Criar page.tsx com Server Component e auth guard
- [ ] Implementar função de API em lib/api/reservas/reserva-sala.api.ts

### Fase 2 — Componentes de UI
- [ ] Implementar listagem principal com paginação
- [ ] Implementar filtros e selects encadeados
- [ ] Implementar modal/drawer de criação e edição com React Hook Form
- [ ] Implementar AlertDialog de confirmação de desativação

### Fase 3 — Integração e estados
- [ ] Conectar chamadas de API reais com token JWT
- [ ] Implementar loading skeletons (shadcn/ui Skeleton)
- [ ] Implementar toasts de sucesso e erro (shadcn/ui Toast)
- [ ] Tratar códigos de erro da API: 409, 422, 404, 403

### Fase 4 — Design System
- [ ] Verificar tokens de cor: primária #0D9488, fundo #F0FDFA
- [ ] Verificar border-radius dos cards: 16px
- [ ] Verificar tipografia: Inter, pesos 400/500/600/700
- [ ] Validar badges de status com cores semânticas corretas

### Fase 5 — Testes
- [ ] Testes unitários de todos os CAs mapeados na spec
- [ ] Cobertura mínima 80% dos componentes de domínio
