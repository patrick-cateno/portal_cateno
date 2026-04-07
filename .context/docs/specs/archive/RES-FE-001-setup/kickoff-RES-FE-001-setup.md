# KICKOFF — RES-FE-001 — Setup do Módulo Frontend de Reservas

Cole este prompt no Claude Code na raiz do **portal-cateno** (Next.js 15).

---

## Contexto do Projeto

Você está trabalhando no **Portal Cateno** — um portal corporativo interno em **Next.js 15 com App Router**, TypeScript strict, shadcn/ui e NextAuth.js 5 + Keycloak OIDC.

Estamos iniciando o módulo frontend do microsserviço de **Reservas de Estações e Salas** (`ms-reservas`), que já está implementado e rodando como backend Fastify.

---

## Sobre o ms-reservas (backend já implementado)

**Base URL:** `NEXT_PUBLIC_MS_RESERVAS_URL` (configurar no .env)

**Rotas disponíveis:**
```
GET    /v1/escritorios
POST   /v1/escritorios
PATCH  /v1/escritorios/:id
DELETE /v1/escritorios/:id

GET    /v1/salas
POST   /v1/salas
PATCH  /v1/salas/:id
DELETE /v1/salas/:id

GET    /v1/estacoes
POST   /v1/estacoes
PATCH  /v1/estacoes/:id
DELETE /v1/estacoes/:id
PATCH  /v1/estacoes/:id/bloquear
PATCH  /v1/estacoes/:id/desbloquear

GET    /v1/feriados
POST   /v1/feriados
PATCH  /v1/feriados/:id
DELETE /v1/feriados/:id

GET    /v1/reservas-estacoes
GET    /v1/reservas-estacoes/disponibilidade
GET    /v1/reservas-estacoes/minhas
GET    /v1/reservas-estacoes/:id
POST   /v1/reservas-estacoes
DELETE /v1/reservas-estacoes/:id
POST   /v1/reservas-estacoes/:id/checkin

GET    /v1/reservas-salas
GET    /v1/reservas-salas/minhas
GET    /v1/reservas-salas/:id
POST   /v1/reservas-salas
PATCH  /v1/reservas-salas/:id
DELETE /v1/reservas-salas/:id
```

**Paginação padrão:** `?page=1&limit=20` → resposta `{ total, page, limit, items[] }`

**Autenticação:** `Authorization: Bearer <jwt>` em todos os endpoints.

**Roles:**
- `reservas:user` — usuário padrão, acessa reservas próprias
- `reservas:admin` — administrador, CRUD completo de entidades cadastrais
- `admin` — role global, herda reservas:admin

---

## Design System Cateno (OBRIGATÓRIO)

Todos os componentes DEVEM seguir estes tokens:

```typescript
const brand = {
  // Cor principal
  teal600: "#0D9488",   // botões primários, links, sidebar ativa, toggles
  teal700: "#0F766E",   // hover de botões
  teal500: "#14B8A6",   // CTA secundário
  teal300: "#5EEAD4",   // bordas ativas no hover de cards
  teal50:  "#F0FDFA",   // background de página e hover ghost

  // Neutros
  white:   "#FFFFFF",   // cards, modais, superfícies
  gray50:  "#F8FAFC",   // background alternativo
  gray100: "#F1F5F9",   // hover de linhas de tabela
  gray200: "#E2E8F0",   // bordas padrão
  gray400: "#94A3B8",   // placeholder
  gray500: "#64748B",   // texto secundário
  gray800: "#1E293B",   // texto principal

  // Semânticas
  success: "#10B981",   // status online, confirmada
  warning: "#F59E0B",   // manutenção, bloqueada
  danger:  "#EF4444",   // offline, cancelada
}
```

**Tipografia:** Inter (já carregada no portal)
**Border radius cards:** `16px` (`rounded-2xl`)
**Border radius botões/inputs:** `8px` (`rounded-lg`)
**Fonte base:** `14px`

---

## Spec a implementar: RES-FE-001

Leia o arquivo `.context/docs/specs/backlog/RES-FE-001-setup/RES-FE-spec-001-setup.md` completo antes de começar.

### Resumo do que criar:

**1. Estrutura de pastas:**
```
app/(portal)/reservas/
├── layout.tsx               ← sidebar contextual do módulo
├── page.tsx                 ← redirect para /reservas/minhas-estacoes
├── _lib/                    ← código PRIVADO (prefixo _ = não é rota no Next.js)
│   ├── client.ts            ← fetch base com auth + ApiError
│   ├── types.ts             ← todos os tipos TypeScript
│   ├── escritorio.api.ts
│   ├── sala.api.ts
│   ├── estacao.api.ts
│   ├── feriado.api.ts
│   ├── reserva-estacao.api.ts
│   └── reserva-sala.api.ts
├── _components/             ← componentes PRIVADOS do módulo
│   └── reservas-sidebar.tsx
├── minhas-estacoes/page.tsx
├── minhas-salas/page.tsx
├── admin/
│   ├── escritorios/page.tsx
│   ├── salas/page.tsx
│   ├── estacoes/page.tsx
│   └── feriados/page.tsx
└── nova-reserva/
    ├── estacao/page.tsx
    └── sala/page.tsx
```

> ⚠️ **Fronteira do módulo (regra inviolável):**
> Nenhum arquivo fora de `app/(portal)/reservas/` pode importar de `_lib/` ou `_components/` deste módulo.
> NUNCA criar componentes em `components/` globais para uso exclusivo deste módulo.
> Se um componente for genuinamente compartilhável (design system), discutir com o arquiteto antes de mover.

**2. layout.tsx** com sidebar contextual:
- Dois grupos de navegação: "Minhas Reservas" (todos) e "Administração" (apenas admin)
- Item ativo: `background: #0D9488`, texto branco
- Ícones: CalendarCheck, Building2, Monitor, Users, Calendar, Settings (lucide-react)
- Lê role do usuário via `getServerSession()`

**3. client.ts** com:
```typescript
export async function reservasClient<T>(path, init?): Promise<T>
export class ApiError extends Error { code, status, details }
```

**4. types.ts** com interfaces completas: `Escritorio`, `Sala`, `EstacaoTrabalho`, `Feriado`, `ReservaEstacao`, `ReservaSala`, `DisponibilidadeEstacao`, `PaginatedResponse<T>`

**5. Variável de ambiente:** adicionar `NEXT_PUBLIC_MS_RESERVAS_URL` no `.env.example`

### Critérios de aceite obrigatórios (verificar antes de concluir):
- [ ] Rota `/reservas` redireciona para `/reservas/minhas-estacoes`
- [ ] Rotas `/reservas/admin/*` redirecionam para `/` se role não for `reservas:admin` ou `admin`
- [ ] Token 401 da API redireciona para login
- [ ] Sidebar mostra grupo "Administração" apenas para admins
- [ ] `ApiError` preserva `code`, `status` e `details` da resposta

---

## Regras invioláveis

1. **Nunca criar autenticação própria** — usar `getServerSession()` do NextAuth já configurado
2. **Token JWT** injetado via `Authorization: Bearer` em toda chamada ao ms-reservas
3. **Sem localStorage/sessionStorage** — token apenas em memória server-side
4. **Soft delete** — nunca esperar que DELETE remova fisicamente; recarregar lista após DELETE
5. **Design System** — cores, radius e tipografia dos tokens acima, sem exceções


---

## ⚠️ Regras de fronteira do módulo (obrigatórias)

1. **Isolamento** — Todo código deste módulo vive em `app/(portal)/reservas/`.
   `_lib/` e `_components/` NÃO são importados por outros módulos.

2. **Sem `components/` globais** — componentes exclusivos do módulo ficam
   em `app/(portal)/reservas/_components/`, nunca em `components/` raiz.

3. **`dynamic()` obrigatório** — componentes interativos pesados usam
   `dynamic(..., { ssr: false })`. Nesta spec não há componentes pesados,
   mas o padrão deve ser estabelecido para as specs seguintes.

4. **Sem estado global compartilhado** — nenhum Zustand/Context cruza
   a fronteira entre módulos.

## Workflow P→R→E→V→C

1. **Plan:** apresente o plano de implementação antes de criar qualquer arquivo
2. **Review:** aguarde aprovação explícita
3. **Execute:** implemente conforme o plano aprovado
4. **Verify:** verifique cada critério de aceite
5. **Complete:** reporte conclusão com checklist dos CAs

**Não avance para RES-FE-002 sem aprovação explícita.**
