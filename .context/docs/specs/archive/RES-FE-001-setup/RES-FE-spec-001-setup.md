# RES-FE-SPEC-001 — Setup do Módulo Frontend de Reservas

> Status: Aguardando aprovação
> Contexto: Frontend — Portal Cateno (Next.js 15, App Router)
> Backend: ms-reservas já implementado (Fastify, schema reservas.*)

---

## 1. Objetivo

Criar a estrutura base do módulo `/reservas` no Portal Shell (Next.js 15), incluindo:
camada de client API tipada, tipos compartilhados, layout do módulo e registro
no Service Registry do Portal Cateno.

---

## 2. Escopo

**Inclui:**
- Estrutura de pastas em `app/(portal)/reservas/`
- Client HTTP tipado para ms-reservas (`lib/api/reservas/`)
- Tipos TypeScript derivados dos contratos reais da API
- Layout do módulo com navegação lateral contextual
- Guard de autenticação e autorização por role
- Registro da aplicação no Service Registry

**Não inclui:**
- Páginas de funcionalidade (cobertas por RES-FE-002 a 007)
- Testes E2E

---

## 3. Estrutura de Pastas

```
app/
└── (portal)/
    └── reservas/
        ├── layout.tsx               ← layout com sidebar contextual
        ├── page.tsx                 ← redirect → /reservas/minhas-estacoes
        ├── _lib/                    ← código PRIVADO do módulo (prefixo _ = não é rota)
        │   ├── client.ts            ← fetch base com auth header
        │   ├── types.ts             ← tipos TS de todos os contratos
        │   ├── escritorio.api.ts
        │   ├── sala.api.ts
        │   ├── estacao.api.ts
        │   ├── feriado.api.ts
        │   ├── reserva-estacao.api.ts
        │   └── reserva-sala.api.ts
        ├── _components/             ← componentes PRIVADOS do módulo
        │   ├── reservas-sidebar.tsx
        │   └── ...
        ├── minhas-estacoes/
        │   └── page.tsx
        ├── minhas-salas/
        │   └── page.tsx
        ├── admin/
        │   ├── escritorios/
        │   │   └── page.tsx
        │   ├── salas/
        │   │   └── page.tsx
        │   ├── estacoes/
        │   │   └── page.tsx
        │   └── feriados/
        │       └── page.tsx
        └── nova-reserva/
            ├── estacao/
            │   └── page.tsx
            └── sala/
                └── page.tsx
```

> **Fronteira do módulo — regra inviolável:**
> Nenhum arquivo fora de `app/(portal)/reservas/` pode importar de `app/(portal)/reservas/_lib/`
> ou `app/(portal)/reservas/_components/`. Todo código do módulo fica dentro do módulo.

---

## 4. Tipos TypeScript (derivados dos contratos reais)

```typescript
// app/(portal)/reservas/_lib/types.ts

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export interface Escritorio {
  id: string;
  nome: string;
  cidade: string;
  plantaBaixaUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sala {
  id: string;
  nome: string;
  escritorioId: string;
  fotoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EstacaoTrabalho {
  id: string;
  nome: string;
  escritorioId: string;
  isActive: boolean;
  bloqueada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feriado {
  id: string;
  escritorioId: string | null;   // null = nacional
  data: string;                  // YYYY-MM-DD
  nome: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SituacaoReservaEstacao = 'confirmada' | 'cancelada' | 'concluida';

export interface ReservaEstacao {
  id: string;
  estacaoId: string;
  dataReserva: string;           // YYYY-MM-DD
  userId: string;
  situacao: SituacaoReservaEstacao;
  checkinRealizado: boolean;
  checkinTimestamp: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaSala {
  id: string;
  salaId: string;
  titulo: string;
  dataHoraInicio: string;        // ISO 8601
  dataHoraFim: string;           // ISO 8601
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DisponibilidadeEstacao {
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
```

---

## 5. Client HTTP Base

```typescript
// app/(portal)/reservas/_lib/client.ts

const BASE_URL = process.env.NEXT_PUBLIC_MS_RESERVAS_URL ?? 'http://localhost:3000';

export async function reservasClient<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchInit } = init ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchInit,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchInit.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: res.statusText }));
    throw new ApiError(err.code, res.status, err.message, err.details);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## 6. Layout do Módulo

O layout `/reservas/layout.tsx` renderiza:
- Sidebar contextual de 240px (expandida) / 64px (colapsada) — padrão Design System Cateno
- Item ativo destacado com `background: #0D9488`, texto branco
- Dois grupos de navegação:

**Grupo: Minhas Reservas** (todos os roles)
- Minhas Estações → `/reservas/minhas-estacoes`
- Minhas Salas → `/reservas/minhas-salas`
- Nova Reserva de Estação → `/reservas/nova-reserva/estacao`
- Nova Reserva de Sala → `/reservas/nova-reserva/sala`

**Grupo: Administração** (visível apenas para `reservas:admin` ou `admin`)
- Escritórios → `/reservas/admin/escritorios`
- Salas → `/reservas/admin/salas`
- Estações → `/reservas/admin/estacoes`
- Feriados → `/reservas/admin/feriados`

---

## 7. Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_MS_RESERVAS_URL=https://api.cateno.com.br/reservas
```

---

## 8. Design System — Tokens Obrigatórios

| Token               | Valor          | Uso                              |
|---------------------|----------------|----------------------------------|
| Cor primária        | `#0D9488`      | Botões, links, sidebar ativa     |
| Background página   | `#F0FDFA`      | Fundo das páginas                |
| Background card     | `#FFFFFF`      | Cards de conteúdo                |
| Borda padrão        | `#E2E8F0`      | Bordas de cards e inputs         |
| Borda hover         | `#5EEAD4`      | Hover em cards                   |
| Texto primário      | `#1E293B`      | Headings e corpo                 |
| Texto secundário    | `#64748B`      | Labels e descrições              |
| Border radius card  | `16px`         | Cards de aplicação               |
| Fonte               | Inter          | Toda a interface                 |
| Badge success       | `#10B981`      | Status online / confirmada       |
| Badge warning       | `#F59E0B`      | Status manutenção / bloqueada    |
| Badge danger        | `#EF4444`      | Status cancelada                 |

---

## 9. Regras de Negócio (frontend)

**RN-FE-001** — Rotas `/reservas/admin/*` devem redirecionar para `/` se o usuário não tiver role `reservas:admin` ou `admin`.

**RN-FE-002** — Token JWT é obtido via `getServerSession()` do NextAuth e injetado em cada chamada ao ms-reservas via header `Authorization: Bearer <token>`.

**RN-FE-003** — Erros da API com `status 401` devem redirecionar para a página de login do portal.

**RN-FE-004** — Erros da API com `status 403` devem exibir um `AlertDialog` de acesso negado (componente já existente no Portal).

---

## 10. Critérios de Aceite

**CA-001**
- Dado que um usuário com role `reservas:user` acessa `/reservas/admin/escritorios`
- Quando a página carrega
- Então é redirecionado para `/` com mensagem "Acesso não autorizado"

**CA-002**
- Dado que um usuário com role `reservas:admin` acessa `/reservas`
- Quando a página carrega
- Então é redirecionado automaticamente para `/reservas/minhas-estacoes`

**CA-003**
- Dado que o token JWT expirou
- Quando qualquer chamada ao ms-reservas retorna 401
- Então o usuário é redirecionado para a página de login do portal

**CA-004**
- Dado que o módulo está carregado
- Quando o usuário é `reservas:admin`
- Então o grupo "Administração" é visível na sidebar contextual

**CA-005**
- Dado que o módulo está carregado
- Quando o usuário é `reservas:user`
- Então o grupo "Administração" NÃO é visível na sidebar contextual
