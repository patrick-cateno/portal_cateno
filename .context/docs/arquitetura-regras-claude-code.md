# Arquitetura de Regras — Claude Code no Ecossistema Cateno

> Como organizamos as regras, padrões e checklists que o Claude Code segue automaticamente
> em todos os projetos do ecossistema Portal Cateno.
>
> Última atualização: 2026-04-11

---

## Visão Geral

O ecossistema Cateno usa o **Claude Code** como assistente de engenharia em todos os
projetos (portal, microsserviços, documentação). Para garantir consistência, as regras
são organizadas em **3 camadas hierárquicas** que se complementam:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA 1 — GLOBAL                            │
│            ~/.claude/CLAUDE.md + ~/.claude/rules/               │
│                                                                 │
│  Carregado automaticamente em TODOS os projetos.                │
│  Contém: identidade do ecossistema, regras técnicas,            │
│  workflow SDD, checklists, governança git, testes, segurança.   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               CAMADA 2 — PROJETO (raiz)                   │  │
│  │                  {projeto}/CLAUDE.md                      │  │
│  │                                                           │  │
│  │  Stack específica, design tokens, tipos, estrutura de     │  │
│  │  pastas, regras de negócio do projeto.                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │          CAMADA 3 — CONTEXTO (.context/)            │  │  │
│  │  │         .context/CLAUDE.md + dotcontext MCP         │  │  │
│  │  │                                                     │  │  │
│  │  │  Nome, sigla, roles, RNs, ADRs, specs, logs.        │  │  │
│  │  │  Precedência máxima em caso de conflito.            │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Regra de precedência

Se houver conflito entre camadas:
**Camada 3 > Camada 2 > Camada 1**

O `.context/CLAUDE.md` do projeto sempre tem a última palavra.

---

## Camada 1 — Regras Globais (`~/.claude/`)

### Arquivo principal: `~/.claude/CLAUDE.md`

Define a identidade do ecossistema, referencia os módulos de regras e estabelece
a estrutura `.context/` obrigatória para todos os projetos.

### Módulos de regras: `~/.claude/rules/`

15 arquivos Markdown organizados em duas categorias:

#### Regras Técnicas (stack e contratos)

| Arquivo | O que define | Quando se aplica |
|---------|-------------|------------------|
| `auth-jwt.md` | JWT, Keycloak, JWKS, sem localStorage | Qualquer código que toque autenticação |
| `database.md` | UUID, TIMESTAMPTZ, soft delete, Prisma, schema dedicado | Qualquer código que toque banco de dados |
| `api-contracts.md` | Health check, formato de erros, paginação, datas ISO 8601 | Qualquer endpoint de API |
| `stack-conventions.md` | Fastify, Prisma, Zod, Vitest, estrutura de pastas | Microsserviços backend |
| `code-style.md` | kebab-case, PascalCase, camelCase, Conventional Commits | Todo código |
| `quality-gates.md` | Cobertura 80%, strict: true, OpenAPI first | Todo PR |
| `env-validation.md` | Variáveis obrigatórias com validação Zod no boot | Todo microsserviço |

#### Regras de Processo (workflow e governança)

| Arquivo | O que define | Quando se aplica |
|---------|-------------|------------------|
| `sdd-workflow.md` | Spec-Driven Development, ciclo PREVC, artefatos por spec | Toda implementação |
| `interaction-log.md` | Log obrigatório de interações com timestamps | Toda sessão de trabalho |
| `git-governance.md` | Feature branches, PRs obrigatórios, sem commit em main | Todo commit |
| `testing.md` | Vitest, tsc + eslint + vitest antes de cada commit | Todo commit |
| `localization.md` | pt-BR na interface, inglês no código, datas dd/mm/yyyy | Todo código e doc |
| `security-skills.md` | Skills de segurança obrigatórias na SPEC e antes de entrega | Toda SPEC e PR |
| `checklist-dev.md` | Checklist pré-desenvolvimento (parametrizado por sigla) | Antes de escrever código |
| `checklist-pr.md` | Checklist pré-PR (código, testes, docs, segurança, git) | Antes de abrir PR |

### Como funciona

Os arquivos em `~/.claude/rules/` são **carregados automaticamente** pelo Claude Code
em qualquer projeto aberto na máquina. Não é necessário copiar, referenciar ou importar
— basta existirem no diretório.

Isso significa que:
- Um novo microsserviço herda todas as regras no momento em que é aberto
- Uma mudança numa regra se propaga para todos os projetos instantaneamente
- Não existe divergência entre projetos — a fonte de verdade é única

---

## Camada 2 — CLAUDE.md do Projeto

Cada projeto tem um `CLAUDE.md` na raiz com **apenas o que é específico dele**.

### Exemplo: Portal Cateno (CSA)

O `CLAUDE.md` do portal contém:

| Seção | Conteúdo |
|-------|----------|
| Identidade | "CSA é um frontend shell, não contém lógica de negócio" |
| Processo | Sigla **PC**, formato `PC-INT-{NNN}`, ordem das specs |
| Stack | Next.js App Router, inline styles, Lucide, catFetch |
| Design tokens | Paleta teal, neutros, semânticas, border radius, sombras |
| Auth PKCE | Fluxo completo OAuth2 PKCE específico do portal shell |
| Service Registry | Endpoints, regras de integration_type |
| CatIA | Orquestrador, manifesto, regras do backend |
| Permissões | Roles, scopes, regras por camada |
| Segurança frontend | CSP, SRI, Zod, URLs centralizadas |
| Estrutura de pastas | Árvore específica do portal |
| Tipos TypeScript | Interfaces do domínio (AppSummary, AppHealth, etc.) |
| Checklist adicional | Itens específicos do portal (tokens.ts, catFetch, etc.) |

### Exemplo: Microsserviço (gerado por `/setup-microservice`)

```
## 0. Identidade
  → Nome, responsabilidade, o que NÃO faz
## 1. Processo
  → Sigla, formato de ID (herdado do global)
## 2. Stack
  → Fastify, Prisma, Zod (específico do serviço)
## 3. Domínio
  → Entidades, roles, regras de negócio
## 4-6. Contratos
  → Auth, banco, API (especializações)
## 7. CatIA manifest
  → Referência ao contrato
## 8. Estrutura de pastas
  → Árvore do microsserviço
## 9. Checklist adicional
  → Itens específicos do microsserviço
```

---

## Camada 3 — dotcontext (`.context/`)

Cada projeto usa **dotcontext MCP** para gerenciar specs e contexto:

```
.context/
├── CLAUDE.md           ← Regras do agente para este projeto (precedência máxima)
├── ARCHITECTURE.md     ← Decisões arquiteturais
├── CONVENTIONS.md      ← Convenções de código e nomenclatura
├── logs/               ← Logs de interação
│   └── details/        ← Detalhes de cada interação
└── docs/
    ├── CONSTITUTION.md ← Documento vivo com regras do projeto
    └── specs/
        ├── backlog/    ← Specs aguardando implementação
        ├── active/     ← Spec em execução
        └── archive/    ← Specs concluídas
```

---

## Workflow: Spec-Driven Development (SDD)

Todo o ecossistema segue o ciclo **PREVC**:

```
 ┌──────┐     ┌────────┐     ┌─────────┐     ┌────────┐     ┌──────────┐
 │ Plan │ ──→ │ Review │ ──→ │ Execute │ ──→ │ Verify │ ──→ │ Complete │
 └──────┘     └────────┘     └─────────┘     └────────┘     └──────────┘
  Plano        Aprovação       Implementar     Validar         Mover spec
  detalhado    explícita do    conforme spec   critérios       para archive/
  ao usuário   usuário                         de aceite
```

### Artefatos por spec

```
{SIGLA}-NNN-nome/
├── {SIGLA}-spec-NNN-nome.md          ← Spec principal (fonte de verdade)
├── {SIGLA}-plan-NNN-nome.md          ← Plano de implementação
├── {SIGLA}-task-NNN-nome.md          ← Tarefas de execução
├── {SIGLA}-walkthrough-NNN-nome.md   ← Walkthrough do código
└── {SIGLA}-test-NNN-nome.md          ← Cenários de teste
```

### Nomenclatura de siglas

| Projeto | Sigla | Exemplo |
|---------|-------|---------|
| Portal Cateno (shell) | PC | PC-spec-024-redesign-navegacao |
| Reservas | RES | RES-spec-001-setup |
| [próximo serviço] | [SIG] | [SIG]-spec-001-setup |

---

## Checklists Obrigatórios

### Antes de escrever código (checklist-dev.md)

- [ ] SPEC criada em `backlog/`
- [ ] SPEC revisada e aprovada pelo usuário
- [ ] Seção "Considerações de Segurança" na SPEC
- [ ] Plano de implementação criado e aprovado
- [ ] Cenários de teste definidos antes do código
- [ ] SPEC movida para `active/`
- [ ] Branch criada: `feat/{SIGLA}-NNN-Nome`
- [ ] Log de início registrado

### Antes de abrir PR (checklist-pr.md)

**Código:**
- [ ] Nenhum valor hardcoded (design tokens)
- [ ] Nenhum `any` no TypeScript
- [ ] HTTP via cliente centralizado
- [ ] Nenhum token em storage
- [ ] Nenhuma decisão de auth no frontend
- [ ] URLs de API centralizadas
- [ ] Dados validados com Zod
- [ ] Cleanup em useEffect

**Testes:**
- [ ] `vitest run` — zero falhas
- [ ] `vitest run --reporter=verbose` — regressão OK
- [ ] Cache invalidado após escrita

**Docs:**
- [ ] SPEC aprovada antes da implementação
- [ ] Artefatos completos (task, plan, walkthrough, test)
- [ ] Rastreabilidade bidirecional
- [ ] Log registrado

**Segurança:**
- [ ] Skills de segurança executadas
- [ ] Auditoria sem vulnerabilidades

**Git:**
- [ ] Branch com padrão correto
- [ ] Nenhum commit em main
- [ ] PR referencia a SPEC

---

## Skills e Ferramentas

### Skill: `/setup-microservice`

Scaffolding completo de um novo microsserviço. Gera:

```
.claude/
├── agents/{sigla}-domain.md     ← Subagent especializado no domínio
├── hooks/
│   ├── post-edit-format.sh      ← Auto-format ESLint + Prettier
│   └── stop-contract-check.sh   ← Verificação de contratos
├── settings.json                ← Configuração de hooks
└── skills/portal-contracts/     ← Referências de contratos

CLAUDE.md                        ← CLAUDE.md raiz (identidade + stack + domínio)

.context/                        ← dotcontext com primeira spec
└── docs/specs/backlog/{SIGLA}-001-setup/
```

### Skills de segurança (obrigatórias)

| Skill | Momento de uso |
|-------|---------------|
| `frontend-security-coder` | Na criação da SPEC |
| `api-security-best-practices` | Na criação da SPEC |
| `top-web-vulnerabilities` | Na criação da SPEC |
| `security-auditor` | Antes de declarar desenvolvimento concluído |

### Outros comandos

| Comando | Função |
|---------|--------|
| `/careful` | Modo cauteloso para auth e pagamentos |
| `/simplify` | Revisão de código por qualidade e reuso |

---

## Diagrama: Fluxo de um novo microsserviço

```
1. Desenvolvedor abre repo novo no Claude Code
       │
       ▼
2. ~/.claude/rules/ carrega automaticamente (15 módulos)
       │
       ▼
3. Desenvolvedor executa /setup-microservice
       │
       ├── Coleta: sigla, nome, entidades, roles, RNs
       ├── Gera: .claude/ (agents, hooks, skills)
       ├── Gera: CLAUDE.md raiz (stack, domínio, contratos)
       ├── Inicializa: .context/ (dotcontext)
       └── Cria: primeira spec no backlog
       │
       ▼
4. Ciclo PREVC para cada spec
       │
       ├── Plan → plano detalhado
       ├── Review → aprovação do usuário
       ├── Execute → implementação
       ├── Verify → critérios de aceite
       └── Complete → spec para archive/
       │
       ▼
5. Checklist pré-PR → testes → segurança → PR
```

---

## Benefícios da Arquitetura

| Benefício | Como é alcançado |
|-----------|-----------------|
| **Consistência** | Regras globais carregadas automaticamente em todo projeto |
| **Propagação** | Mudança em `~/.claude/rules/` se reflete em todos os projetos instantaneamente |
| **Flexibilidade** | Cada projeto pode especializar via CLAUDE.md raiz e .context/CLAUDE.md |
| **Rastreabilidade** | Logs de interação, specs com artefatos, rastreabilidade bidirecional |
| **Segurança** | Skills obrigatórias na SPEC e antes de entrega |
| **Onboarding** | `/setup-microservice` gera toda a estrutura em minutos |
| **Zero duplicação** | Regras universais vivem em um único lugar |

---

_Este documento descreve a arquitetura de regras do Claude Code no ecossistema Cateno.
Para a documentação da stack, consulte a [Constituição do Portal](CONSTITUTION.md)._
