# Portal Cateno

Portal centralizado de aplicações Cateno — frontend unificado para todos os microserviços.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **ORM**: Prisma + PostgreSQL
- **Testes**: Vitest + Testing Library
- **Linting**: ESLint 9 + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

## Setup Rápido

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- Git

### Instalação

```bash
# 1. Clonar e instalar
git clone <repo-url> portal-cateno
cd portal-cateno
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com seus valores

# 3. Subir PostgreSQL via Docker
docker compose up -d

# 4. Rodar migrations e seed
npx prisma migrate dev --name init
npx prisma db seed

# 5. Iniciar dev server
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts Disponíveis

| Script                  | Descrição                                 |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Inicia servidor de desenvolvimento        |
| `npm run build`         | Build de produção                         |
| `npm run start`         | Inicia servidor de produção               |
| `npm run lint`          | Executa ESLint                            |
| `npm run lint:fix`      | Corrige problemas de lint automaticamente |
| `npm run format`        | Formata código com Prettier               |
| `npm run format:check`  | Verifica formatação                       |
| `npm run type-check`    | Verifica tipos TypeScript                 |
| `npm run test`          | Executa testes unitários                  |
| `npm run test:watch`    | Testes em modo watch                      |
| `npm run test:coverage` | Testes com cobertura                      |
| `npm run db:generate`   | Gera Prisma Client                        |
| `npm run db:migrate`    | Roda migrations                           |
| `npm run db:push`       | Push schema para banco                    |
| `npm run db:seed`       | Popula banco com dados iniciais           |
| `npm run db:studio`     | Abre Prisma Studio                        |

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rotas de autenticação
│   ├── (app)/              # Rotas autenticadas (layout principal)
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Sidebar, etc.
│   └── features/           # Componentes por feature
├── lib/                    # Utilitários e helpers
│   └── validations/        # Schemas Zod
├── config/                 # Configurações (site, nav)
├── styles/                 # Design tokens CSS
├── types/                  # Types e interfaces
├── hooks/                  # Custom React hooks
└── __tests__/              # Testes unitários
```

## Docker Compose

```bash
# Subir PostgreSQL
docker compose up -d

# Subir PostgreSQL + Langflow (para CatIA)
docker compose --profile ai up -d
```

## Licença

Propriedade de Cateno S.A. — Uso interno.
