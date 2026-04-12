---
sidebar_position: 1
title: Claude Code — Regras e Workflow
---

# Claude Code — Regras e Workflow

O ecossistema Cateno usa o **Claude Code** como assistente de engenharia. As regras que ele segue são organizadas em 3 camadas hierárquicas para garantir consistência em todos os projetos.

## Arquitetura de 3 camadas

```
┌─────────────────────────────────────────────────────┐
│           CAMADA 1 — GLOBAL (~/.claude/)             │
│  Carregado automaticamente em TODOS os projetos      │
│  15 módulos: técnicos + processo                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │     CAMADA 2 — PROJETO (CLAUDE.md raiz)        │  │
│  │  Stack, tokens, tipos, contratos específicos    │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  CAMADA 3 — CONTEXTO (.context/)         │   │  │
│  │  │  Precedência máxima. Nome, sigla, RNs.   │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Precedência:** Camada 3 > Camada 2 > Camada 1

## Módulos globais (Camada 1)

### Regras técnicas

| Módulo                 | Conteúdo                                       |
| ---------------------- | ---------------------------------------------- |
| `auth-jwt.md`          | JWT, Keycloak, JWKS, sem localStorage          |
| `database.md`          | UUID, TIMESTAMPTZ, soft delete, Prisma         |
| `api-contracts.md`     | Health check, erros, paginação, datas ISO 8601 |
| `stack-conventions.md` | Fastify, Prisma, Zod, Vitest                   |
| `code-style.md`        | kebab-case, PascalCase, Conventional Commits   |
| `quality-gates.md`     | Cobertura 80%, strict: true, OpenAPI first     |
| `env-validation.md`    | Variáveis obrigatórias com Zod no boot         |

### Regras de processo

| Módulo               | Conteúdo                                   |
| -------------------- | ------------------------------------------ |
| `sdd-workflow.md`    | Spec-Driven Development, ciclo PREVC       |
| `interaction-log.md` | Log de interações com timestamps           |
| `git-governance.md`  | Feature branches, PRs obrigatórios         |
| `testing.md`         | tsc + eslint + vitest antes de cada commit |
| `localization.md`    | pt-BR na interface, inglês no código       |
| `security-skills.md` | Skills de segurança obrigatórias           |
| `checklist-dev.md`   | Checklist pré-desenvolvimento              |
| `checklist-pr.md`    | Checklist pré-PR                           |

## Workflow SDD (Spec-Driven Development)

Todo o ecossistema segue o ciclo **PREVC**:

```
Plan → Review → Execute → Verify → Complete
```

1. **Plan** — plano detalhado apresentado ao usuário
2. **Review** — aprovação explícita (nunca pular)
3. **Execute** — implementar conforme a spec
4. **Verify** — validar critérios de aceite
5. **Complete** — mover spec para archive

## Ferramentas

| Comando               | Função                                                  |
| --------------------- | ------------------------------------------------------- |
| `/setup-microservice` | Gera CLAUDE.md + .claude/ + .context/ para novo projeto |
| `/careful`            | Modo cauteloso para auth e pagamentos                   |
| `/simplify`           | Revisão de código por qualidade e reuso                 |

## Setup de novo microsserviço

Ao criar um novo microsserviço, execute `/setup-microservice`. A skill:

1. Detecta o estado atual do repo (idempotente — não sobrescreve)
2. Coleta sigla, nome, entidades, roles
3. Gera `.claude/` com agents, hooks e skills
4. Gera `CLAUDE.md` raiz com stack e domínio
5. Inicializa `.context/` com dotcontext
6. Cria primeira spec no backlog
