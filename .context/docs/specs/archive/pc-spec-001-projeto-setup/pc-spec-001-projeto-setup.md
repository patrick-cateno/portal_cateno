# PC-SPEC-001 — Setup do Projeto

| Campo            | Valor                     |
| ---------------- | ------------------------- |
| **ID**           | PC-SPEC-001               |
| **Status**       | Done                      |
| **Prioridade**   | Crítica                   |
| **Complexidade** | Média                     |
| **Criado em**    | 2026-04-03                |
| **Autor**        | Patrick Iarrocheski       |
| **Branch**       | feat/PC-001-projeto-setup |

## 1. Objetivo

Estabelecer a base técnica completa do projeto Portal Cateno com todas as dependências, configurações e estrutura de pasta necessárias para desenvolvimento consistente e produtivo. Implementar tooling, linting, testes e CI/CD desde o início.

## 2. Escopo

### 2.1 Incluído

- Inicialização do projeto Next.js 15 com App Router
- Configuração TypeScript com strict mode
- Integração Tailwind CSS + shadcn/ui
- Setup Prisma ORM com PostgreSQL (dev via Docker / prod via cloud)
- Docker Compose para PostgreSQL em ambiente de desenvolvimento
- Configuração ESLint + Prettier
- Setup Vitest para testes unitários
- Estrutura de variáveis de ambiente (.env.example)
- Configuração Git hooks com Husky + lint-staged
- Estrutura de pastas conforme Constitution
- Design tokens file com paleta Cateno
- GitHub Actions pipeline básico (lint, test, build)
- TypeScript paths aliases (@/_ → src/_)

### 2.2 Excluído

- Deploy em produção (será coberto em PC-SPEC-007)
- Testes E2E (será coberto posteriormente)
- Autenticação (será coberto em PC-SPEC-002)
- Configuração de banco de dados em produção
- Docker de produção/containerização da aplicação (será coberto em infraestrutura)

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| RF-001-01 | O projeto deve ser inicializado com Next.js 15 usando App Router sem Pages Router                                        |
| RF-001-02 | TypeScript deve estar configurado com strictNullChecks, strict, noImplicitAny ativados                                   |
| RF-001-03 | Tailwind CSS deve estar integrado com shadcn/ui compatível                                                               |
| RF-001-04 | Prisma deve estar configurado com schema inicial (models: User, Application, Category, Favorite, Role) usando PostgreSQL |
| RF-001-05 | ESLint deve rodar sem erros na base de código                                                                            |
| RF-001-06 | Prettier deve formatar todo código automaticamente                                                                       |
| RF-001-07 | Vitest deve estar configurado e pronto para rodar testes unitários                                                       |
| RF-001-08 | Git hooks devem executar lint-staged antes de cada commit                                                                |
| RF-001-09 | CI/CD deve validar lint, tipos e testes em cada push                                                                     |
| RF-001-10 | Design tokens devem estar disponíveis em arquivo CSS e Tailwind config                                                   |
| RF-001-11 | Estrutura de pastas deve seguir exatamente a definida na Constitution                                                    |
| RF-001-12 | Path aliases (@/) devem funcionar em código e testes                                                                     |
| RF-001-13 | Docker Compose deve subir PostgreSQL para ambiente de desenvolvimento com `docker compose up -d`                         |

## 4. Requisitos Não-Funcionais

| ID         | Categoria            | Descrição                                                           |
| ---------- | -------------------- | ------------------------------------------------------------------- |
| RNF-001-01 | Performance          | Build deve completar em menos de 30 segundos                        |
| RNF-001-02 | Segurança            | Variáveis sensíveis não devem ser commitadas (use .env.local)       |
| RNF-001-03 | Acessibilidade       | shadcn/ui já garante WCAG 2.1, manter conformidade                  |
| RNF-001-04 | Manutenibilidade     | Código deve seguir Constitution, SDD e padrões estabelecidos        |
| RNF-001-05 | Developer Experience | Setup deve rodar em < 5 minutos após `git clone && npm install`     |
| RNF-001-06 | Escalabilidade       | Estrutura deve suportar múltiplos domínios/features sem refatoração |
| RNF-001-07 | Documentação         | README.md deve conter guia de setup, scripts e estrutura            |

## 5. Interface / UX

Não aplicável nesta SPEC (infraestrutura). Próximas SPECs utilizarão a base aqui estabelecida.

## 6. Modelo de Dados

### Prisma Schema Inicial

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String?
  avatar        String?    // URL ou iniciais
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?  // Soft delete

  roles         Role[]
  favorites     Favorite[]
  auditLogs     AuditLog[]

  @@index([email])
}

model Role {
  id            String     @id @default(cuid())
  name          String     // admin, user, viewer
  description   String?
  userId        String
  createdAt     DateTime   @default(now())

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, name])
  @@index([userId])
  @@index([name])
}

model Category {
  id            String        @id @default(cuid())
  name          String        @unique  // "Cartões", "Financeiro", etc
  slug          String        @unique  // "cartoes", "financeiro", etc
  icon          String?       // Nome do ícone Lucide
  order         Int           @default(0) // ordenação no filter chips
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  applications  Application[]

  @@index([slug])
}

model Application {
  id            String     @id @default(cuid())
  name          String     @unique
  slug          String     @unique
  description   String?
  icon          String?    // Nome do ícone Lucide ou URL
  categoryId    String     // FK para Category
  status        String     @default("online") // online | maintenance | offline
  url           String?    // URL da aplicação destino
  userCount     Int        @default(0)
  trend         Float      @default(0) // percentual de mudança
  order         Int        @default(0) // ordenação manual
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  category      Category   @relation(fields: [categoryId], references: [id])
  favorites     Favorite[]

  @@index([categoryId])
  @@index([status])
}

model Favorite {
  id            String     @id @default(cuid())
  userId        String
  applicationId String
  createdAt     DateTime   @default(now())

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([userId, applicationId])
  @@index([userId])
}

model AuditLog {
  id            String     @id @default(cuid())
  entity        String     // Nome da entidade: "User", "Application", "Auth", etc
  entityId      String?    // ID do registro alterado (null para eventos de auth)
  action        String     // CREATE, UPDATE, DELETE, login_success, login_failed, logout
  changes       Json?      // Diff do estado anterior (entidades) ou details (auth)
  userId        String?    // Quem fez a ação (null para login_failed de user inexistente)
  ipAddress     String?    // Apenas para eventos de auth (SPEC-002)
  userAgent     String?    // Apenas para eventos de auth (SPEC-002)
  createdAt     DateTime   @default(now())

  user          User?      @relation(fields: [userId], references: [id])

  @@index([entity, entityId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

### Docker Compose (desenvolvimento)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: portal-cateno-db
    environment:
      POSTGRES_USER: cateno
      POSTGRES_PASSWORD: cateno_dev
      POSTGRES_DB: portal_cateno
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  langflow:
    image: langflowai/langflow:latest
    container_name: portal-cateno-langflow
    ports:
      - '7860:7860'
    volumes:
      - langflow_data:/app/langflow
    environment:
      - LANGFLOW_DATABASE_URL=sqlite:///./langflow/langflow.db
    profiles:
      - ai # Sobe apenas com: docker compose --profile ai up -d

volumes:
  postgres_data:
  langflow_data:
```

### Estrutura de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home page
│   ├── (auth)/                  # Grupo sem layout (rutas de auth)
│   │   ├── login/
│   │   └── logout/
│   ├── (app)/                   # Grupo com layout principal (autenticado)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── aplicacoes/
│   │   └── catia/
│   └── api/                     # Rota de API
│       ├── auth/
│       ├── applications/
│       └── favorites/
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                  # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   └── features/                # Componentes por feature
│       ├── auth/
│       ├── applications/
│       └── catia/
│
├── lib/                         # Utilitários e helpers
│   ├── auth.ts                  # Autenticação helpers
│   ├── db.ts                    # Prisma client
│   ├── api-client.ts
│   ├── utils.ts
│   └── validations/             # Schemas Zod
│       ├── auth.ts
│       ├── application.ts
│       └── common.ts
│
├── config/                      # Configurações da aplicação
│   ├── site.ts                  # Nome, URL, metadata
│   ├── navigation.ts            # Itens do menu
│   └── categories.ts            # Categorias de aplicações
│
├── styles/                      # Estilos globais
│   ├── globals.css
│   └── design-tokens.css
│
├── types/                       # Types e interfaces
│   ├── index.ts
│   ├── api.ts
│   └── db.ts
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useApplications.ts
│   └── ...
│
└── __tests__/                   # Testes unitários
    ├── lib/
    ├── hooks/
    └── utils/

public/                          # Assets estáticos
├── logo.svg
├── cateia-logo.svg
└── ...

.github/
├── workflows/
│   ├── ci.yml                   # CI/CD pipeline

```

## 7. Cenários de Teste

| ID        | Cenário                        | Entrada                                              | Resultado Esperado                                                           |
| --------- | ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| CT-001-01 | Setup inicial do projeto       | `npm create next-app@latest` com opções configuradas | Projeto criado com estrutura correta, sem erros de TypeScript                |
| CT-001-02 | Instalação de dependências     | `npm install`                                        | Todas as dependências instaladas sem conflitos, package-lock.json atualizado |
| CT-001-03 | Prisma migrations              | `npx prisma migrate dev --name init`                 | Schema aplicado no PostgreSQL sem erros                                      |
| CT-001-11 | Docker Compose sobe PostgreSQL | `docker compose up -d`                               | Container postgres rodando na porta 5432                                     |
| CT-001-04 | ESLint valida código           | `npm run lint`                                       | Sem warnings ou errors, exitcode 0                                           |
| CT-001-05 | Prettier formata código        | `npm run format`                                     | Código reformatado conforme .prettierrc                                      |
| CT-001-06 | TypeScript compila sem erros   | `npm run type-check`                                 | Sem erros de tipo, exitcode 0                                                |
| CT-001-07 | Vitest executa testes          | `npm run test`                                       | Testes rodam, coleta de cobertura funciona                                   |
| CT-001-08 | Git hook pre-commit            | Commit com arquivo .ts mal formatado                 | Hook executa lint-staged, formata, commit aceito                             |
| CT-001-09 | Build Next.js sucede           | `npm run build`                                      | Sem erros, build/standalonefiles criados                                     |
| CT-001-10 | Path aliases funcionam         | Import com `@/lib/utils`                             | Arquivo resolvido corretamente em dev e build                                |

## 8. Critérios de Aceite

- [ ] Projeto Next.js 15 inicializado com App Router, sem Pages Router
- [ ] TypeScript configurado com strict mode (strictNullChecks, noImplicitAny, strict)
- [ ] Tailwind CSS + shadcn/ui integrados e funcionando
- [ ] Prisma cliente gerado com schema inicial (User, Application, Favorite, Role)
- [ ] ESLint + Prettier configurados e validando automaticamente
- [ ] `.prettierrc`, `.eslintrc.json` e `tsconfig.json` versionados
- [ ] Vitest configurado com `vitest.config.ts`, testes rodam sem erros
- [ ] `.env.example` criado com todas as variáveis necessárias
- [ ] Husky + lint-staged instalados, pre-commit hook funciona
- [ ] GitHub Actions workflow (ci.yml) executado em push, valida lint/tipo/test
- [ ] Design tokens CSS criados em `src/styles/design-tokens.css` com paleta Cateno
- [ ] Tailwind config estendido com cores, tipografia e spacing Cateno
- [ ] Estrutura de pastas segue exatamente a Constitution (src/app, src/components, etc)
- [ ] Path aliases (@/\*) funcionam em imports e testes
- [ ] README.md completo com guia de setup, scripts disponíveis, estrutura de pastas
- [ ] `.gitignore` inclui .env.local, node_modules, .next, prisma.db
- [ ] `npm run build` executa sem erros, output pronto para produção
- [ ] Todos os 10 cenários de teste CT-001-01 até CT-001-10 passam

## 9. Dependências

- Nenhuma outra SPEC depende de PC-SPEC-001 (é a base)
- PC-SPEC-002 (Autenticação) dependerá de PC-SPEC-001 pronto
- PC-SPEC-003 a 006 todos dependem de PC-SPEC-001

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
