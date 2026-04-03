# Constituição do Portal Cateno

> **Documento vivo.** Fonte única de verdade para regras, padrões e governança do projeto.
> Deve ser consultado antes de qualquer implementação, correção ou versionamento.
> Última atualização: 2026-04-03

---

## 1. Visão do Produto

O **Portal Cateno** é a aplicação frontend centralizada que unifica todas as aplicações e microsserviços da Cateno. Oferece duas experiências de navegação:

- **Visão Cards** — Grid de aplicações com busca, filtros, favoritos e categorias.
- **CatIA** — Interface conversacional com GenAI para navegação e execução de ações por linguagem natural.

---

## 2. Princípios Fundamentais

### 2.1 Spec-Driven Development (SDD)

1. **Nada é desenvolvido sem SPEC.** Toda funcionalidade nova, correção de bug ou refatoração exige uma SPEC aprovada antes do primeiro commit.
2. As SPECs são a **fonte única de verdade** da aplicação.
3. O fluxo segue o ciclo **PREVC**: Planning → Review → Execution → Validation → Confirmation.
4. Cenários de teste devem ser definidos na SPEC **antes** da implementação.

### 2.2 Rastreabilidade Bidirecional

- Toda SPEC deve conter links para seus artefatos (Task, Plan, Test, Walkthrough).
- Cada artefato deve linkar de volta para a SPEC de origem.
- Toda interação de desenvolvimento é registrada no [Log de Interações](./../logs/interaction-log.md).

---

## 3. Stack Tecnológica

| Camada         | Tecnologia                  | Versão   |
| -------------- | --------------------------- | -------- |
| Framework      | Next.js (App Router)        | 15.x     |
| Linguagem      | TypeScript                  | 5.x      |
| Runtime        | Node.js                     | 20.x LTS |
| Estilização    | Tailwind CSS                | 3.x      |
| Componentes UI | shadcn/ui                   | latest   |
| Autenticação   | NextAuth.js                 | 5.x      |
| ORM            | Prisma                      | 6.x      |
| Validação      | Zod                         | 3.x      |
| Testes         | Vitest + Testing Library    | latest   |
| Linting        | ESLint + Prettier           | latest   |
| AI/LLM         | Vercel AI SDK               | latest   |
| Estado         | Zustand (quando necessário) | latest   |

---

## 4. Princípios Arquiteturais

### 4.1 Segurança

> **Referência completa:** Consultar as skills de segurança em `.context/docs/skills/security/` durante o desenvolvimento.

#### 4.1.1 Regras Obrigatórias (Checklist por PR)

1. **RBAC Obrigatório:** Todas as Server Actions e Route Handlers devem verificar permissão via `requireAuth()` ou `requireRole()`.
2. **Validação Zod:** Obrigatória para toda entrada de dados — formulários, query params, body de APIs, Server Actions. Nunca confiar em dados do cliente.
3. **Autenticação Centralizada:** Toda lógica de auth em `src/lib/auth.ts`. Nunca implementar auth fora deste módulo.
4. **Secrets:** Nunca commitar `.env`, tokens ou credenciais. Usar `.env.example` como template. Nunca usar prefixo `NEXT_PUBLIC_` para secrets.
5. **Sanitização de Input:** Toda entrada de usuário sanitizada antes de persistência ou renderização. Usar DOMPurify para conteúdo HTML dinâmico.
6. **Mensagens de Erro Genéricas:** Nunca expor stack traces, detalhes de query ou informações internas em respostas de erro ao cliente.
7. **Soft Delete:** Preferir `deletedAt` a hard delete para entidades principais.

#### 4.1.2 Segurança Next.js 15 (Server/Client Boundary)

8. **Server Components por padrão.** Usar `"use client"` apenas quando estritamente necessário (interatividade, hooks de browser).
9. **Nunca passar dados sensíveis** (secrets, hashes, tokens internos) como props de Server para Client Components.
10. **Pacote `server-only`:** Módulos sensíveis (`prisma.ts`, `auth.ts`, `env.ts`) devem importar `server-only` para evitar vazamento para o bundle do cliente.
11. **Server Actions são endpoints públicos:** Tratar como APIs — sempre validar auth + input + authorization dentro de cada action.
12. **Validação de env vars:** Usar Zod para validar variáveis de ambiente obrigatórias no startup (`src/lib/env.ts`).

#### 4.1.3 Headers e Proteção de Transporte

13. **Security Headers obrigatórios** configurados em middleware:
    - `Content-Security-Policy` (CSP com nonce para scripts)
    - `Strict-Transport-Security` (HSTS, max-age 1 ano, includeSubDomains)
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy` (câmera, microfone, geolocalização desabilitados)
14. **CORS:** Configurar origens permitidas explicitamente. Nunca usar wildcard (`*`) em produção.
15. **Cookies de sessão:** Flags obrigatórias: `Secure`, `HttpOnly`, `SameSite=Lax`.

#### 4.1.4 Proteção contra Vulnerabilidades Comuns

16. **XSS:** Usar `textContent` ao invés de `innerHTML`. CSP com nonce. DOMPurify para conteúdo rico. Nunca interpolar dados do usuário em templates sem encoding.
17. **CSRF:** Server Actions têm proteção nativa via `Origin` header — nunca desabilitar. Para operações críticas, implementar double-submit cookie.
18. **SQL Injection:** Usar Prisma para todas as queries. Se raw SQL for necessário (raro), usar `$queryRaw` com tagged template literals para parameterização automática.
19. **Rate Limiting:** Implementar para endpoints sensíveis (login, password reset). Padrão: Map em memória no MVP, Redis em produção.
20. **Brute Force:** Máximo 5 tentativas por email em janela de 15 minutos para endpoints de autenticação.

#### 4.1.5 Auditoria e Monitoramento

21. **AuditLog unificado:** Registrar todas as mutações em entidades principais e todos os eventos de autenticação (login success/failed, logout).
22. **Campos de audit em auth:** `ipAddress`, `userAgent` registrados junto com o evento.
23. **Logs de aplicação:** Nunca logar dados sensíveis (passwords, tokens, dados pessoais completos).

#### 4.1.6 Dependências

24. Rodar `npm audit` antes de cada deploy e na CI.
25. Não usar dependências com vulnerabilidades conhecidas de severidade alta/crítica.
26. Pinar versões exatas para pacotes críticos de segurança.

#### 4.1.7 Skills de Referência

Consultar durante o desenvolvimento:

| Skill                            | Foco                                                    | Quando usar                    |
| -------------------------------- | ------------------------------------------------------- | ------------------------------ |
| `nextjs15-security.md`           | Server/Client boundary, Server Actions, middleware, CSP | Toda implementação Next.js     |
| `api-security-best-practices.md` | JWT, Zod validation, rate limiting, Prisma seguro       | Route Handlers, Server Actions |
| `frontend-security-coder.md`     | XSS, CSP, DOM security, clickjacking, SRI               | Componentes client-side, CatIA |
| `securityAudit.md`               | DevSecOps, threat modeling, compliance, OWASP           | Revisões de segurança, PRs     |
| `top-web-vulnerabilities.md`     | Catálogo 100 vulnerabilidades web com mitigações        | Referência e checklists        |

### 4.2 Qualidade

1. **Testes Unitários** obrigatórios para utilitários e lógica de negócio pura (Vitest).
2. **Testes de Integração** para Server Actions e fluxos críticos.
3. Nenhum código com dados **mockados** deve ir para `main` em serviços críticos.
4. Cache deve ser **invalidado** após qualquer operação de escrita.
5. Toda SPEC deve definir explicitamente seus **cenários de teste antes** da implementação.
6. Testes são **pré-requisitos obrigatórios** para aprovação de PR.
7. Cobertura mínima de testes: **80%** para lógica de negócio.

### 4.3 Performance

1. Usar **Server Components** por padrão; Client Components apenas quando necessário.
2. Imagens otimizadas via `next/image`.
3. Lazy loading para componentes pesados.
4. Queries devem ser otimizadas com `select` e `include` específicos (evitar over-fetching).

---

## 5. Padrões de Código

### 5.1 Estrutura de Pastas

```
portal-cateno/
├── .context/                    # Dotcontext — documentação e specs
│   ├── docs/
│   │   ├── architecture/        # Documentos de arquitetura
│   │   ├── decisions/           # ADRs (Architecture Decision Records)
│   │   ├── patterns/            # Padrões reutilizáveis
│   │   └── specs/
│   │       ├── backlog/         # SPECs para implementação futura
│   │       ├── active/          # SPECs em implementação
│   │       └── archive/         # SPECs concluídas
│   ├── agents/                  # Playbooks de agentes AI
│   ├── plans/                   # Planos de trabalho
│   ├── skills/                  # Skills on-demand
│   └── logs/                    # Logs de interações
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Rotas de autenticação
│   │   ├── (app)/               # Rotas autenticadas do portal
│   │   │   ├── applications/    # Visão Cards
│   │   │   ├── catia/           # Visão CatIA (conversacional)
│   │   │   └── [app-slug]/      # Rotas dinâmicas por aplicação
│   │   ├── api/                 # API Routes
│   │   ├── layout.tsx           # Layout raiz
│   │   └── page.tsx             # Página inicial
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (NÃO modificar diretamente)
│   │   ├── features/            # Componentes de negócio por módulo
│   │   │   ├── applications/
│   │   │   ├── catia/
│   │   │   ├── navigation/
│   │   │   └── shared/
│   │   └── layouts/             # Layouts reutilizáveis
│   ├── lib/
│   │   ├── auth.ts              # Configuração de autenticação
│   │   ├── prisma.ts            # Client Prisma
│   │   ├── validations/         # Schemas Zod
│   │   └── utils.ts             # Utilitários gerais
│   ├── hooks/                   # Custom hooks
│   ├── types/                   # TypeScript types/interfaces
│   ├── styles/                  # Estilos globais e design tokens
│   └── config/                  # Configurações da aplicação
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── migrations/              # Migrations
├── public/                      # Assets estáticos
├── tests/                       # Testes globais e fixtures
└── docs/                        # Documentação pública (README, CONTRIBUTING)
```

### 5.2 Server Actions

- Devem estar em arquivos `actions.ts` dentro do módulo correspondente.
- Devem sempre tratar erros via `try/catch` e retornar `{ success: boolean, error?: string, data?: T }`.
- Nunca expor exceções brutas do banco de dados para o cliente.
- Usar `"use server"` no topo do arquivo.

```typescript
// Padrão obrigatório para Server Actions
export async function createApplication(input: CreateApplicationInput) {
  try {
    const session = await requireAuth();
    const validated = createApplicationSchema.parse(input);
    const data = await prisma.application.create({ data: validated });
    revalidatePath('/applications');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}
```

### 5.3 Componentes

- **shadcn/ui:** Nunca modificar diretamente componentes em `components/ui`. Criar wrappers se necessário.
- **Features:** Componentes de negócio devem ir em `components/features/<modulo>/`.
- **Naming:** PascalCase para componentes, camelCase para funções/variáveis.
- Client Components devem ter `"use client"` no topo.

### 5.4 Banco de Dados

- Usar Prisma para todas as operações.
- Evitar queries raw SQL, salvo extrema necessidade de performance (documentar o motivo na SPEC).
- **Auditoria Obrigatória:** Toda entidade principal deve possuir tabela de histórico/log:
  - Dados alterados (estado anterior ou diff).
  - Timestamp da alteração (`updatedAt`).
  - Usuário responsável pela alteração (`updatedBy`).
- Soft delete (`deletedAt`) é preferível a hard delete.

---

## 6. Governança e Workflow

### 6.1 Versionamento (Git)

| Regra                         | Detalhe                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Feature Branches**          | `feat/PC-XXX-nome-da-funcionalidade`                                            |
| **Bug Fix Branches**          | `fix/PC-XXX-descricao-do-bug`                                                   |
| **Hotfix Branches**           | `hotfix/PC-XXX-descricao`                                                       |
| **Commits diretos em `main`** | **PROIBIDO**                                                                    |
| **Pull Requests**             | Obrigatórios, exigem code review                                                |
| **Commit Messages**           | Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) |
| **Squash on merge**           | Obrigatório para PRs — um commit por feature                                    |

#### Convenção de Commits

```
<type>(scope): <description>

[body opcional]

[footer opcional]
Refs: PC-XXX
```

**Tipos permitidos:**

- `feat` — Nova funcionalidade
- `fix` — Correção de bug
- `docs` — Documentação
- `refactor` — Refatoração sem mudança de comportamento
- `test` — Adição ou correção de testes
- `chore` — Tarefas de manutenção (deps, configs)
- `style` — Formatação, semicolons, etc.
- `perf` — Melhoria de performance
- `ci` — Configuração de CI/CD

#### Regras Adicionais de Git

1. **Rebase antes de merge:** Branches devem estar atualizadas com `main` antes do PR.
2. **Branch protection:** `main` protegida com required reviews e status checks.
3. **Sem force push em branches compartilhadas.**
4. **Tags semânticas** para releases: `v1.0.0`, `v1.1.0`, etc. (SemVer).
5. **`.gitignore` rigoroso:** node_modules, .env, .next, coverage, dist.

### 6.2 Organização de Documentos (SPECs)

| Estado  | Pasta                          | Descrição                               |
| ------- | ------------------------------ | --------------------------------------- |
| Backlog | `.context/docs/specs/backlog/` | SPECs criadas para implementação futura |
| Active  | `.context/docs/specs/active/`  | SPECs em implementação                  |
| Archive | `.context/docs/specs/archive/` | SPECs concluídas                        |

**Nomenclatura de artefatos:**

| Artefato    | Padrão                                         |
| ----------- | ---------------------------------------------- |
| Spec        | `pc-spec-XXX-nome-da-funcionalidade.md`        |
| Task        | `pc-task-XXX-nome-da-funcionalidade.md`        |
| Plan        | `pc-plan-XXX-nome-da-funcionalidade.md`        |
| Walkthrough | `pc-walkthrough-XXX-nome-da-funcionalidade.md` |
| Test        | `pc-test-XXX-nome-da-funcionalidade.md`        |

### 6.3 Fluxo de Desenvolvimento

```
1. ANALISE    → Leia .context/docs/ e CONSTITUTION.md
2. SPEC       → Crie/valide a SPEC na pasta backlog
3. ATIVE      → Mova a SPEC para active ao iniciar
4. BRANCHEIE  → Crie a feature branch (feat/PC-XXX-...)
5. PLANEJE    → Crie pc-plan-XXX em .context/plans/ com link para SPEC
6. IMPLEMENTE → Siga o plano e os padrões desta Constituição
7. TESTE      → Execute vitest e valide cenários da SPEC
8. PR         → Abra Pull Request com referência à SPEC
9. REVISE     → Code review obrigatório
10. MERGE     → Squash merge para main
11. ARCHIVE   → Mova SPEC e artefatos para archive
12. LOG       → Registre a interação no log
```

### 6.4 Interface (UX/UI)

1. Tabelas de dados devem incluir coluna "Ações" à direita.
2. Seguir o [Design System Cateno](../../../cateno-design-system.jsx) para cores, tipografia e componentes.
3. Formulários devem ter validação inline com mensagens em português.
4. Feedback visual para toda ação: loading states, toasts de sucesso/erro.
5. Responsividade obrigatória: mobile-first.
6. Acessibilidade: ARIA labels, contraste mínimo WCAG AA, navegação por teclado.

---

## 7. Linguagem e Localização

| Aspecto          | Regra                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Interface**    | Sempre em português brasileiro (pt-BR)                                                  |
| **Código**       | Nomes técnicos em inglês, labels/mensagens em português                                 |
| **Datas**        | `dd/mm/yyyy` na UI, ISO 8601 internamente                                               |
| **Timezone**     | `America/Sao_Paulo` (BRT, UTC-3)                                                        |
| **Moeda**        | `R$` formatado com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` |
| **Documentação** | Português para docs de contexto, README e SPECs                                         |
| **Commits**      | Inglês (Conventional Commits)                                                           |

---

## 8. Referências

- [Design System Cateno](../../../cateno-design-system.jsx)
- [Log de Interações](../logs/interaction-log.md)
- [Dotcontext](https://github.com/vinilana/dotcontext)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

_Documento vivo. Atualize conforme o projeto evolui._
