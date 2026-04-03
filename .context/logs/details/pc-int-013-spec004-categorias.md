# PC-INT-013 — SPEC-004/001: categorias parametrizáveis + model Category

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-013                      |
| **Início**     | 2026-04-03T11:45 -03            |
| **Fim**        | 2026-04-03T11:52 -03            |
| **Duração**    | ≈7 min                          |
| **Branch**     | —                               |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick perguntou: "na spec004, temos o menu e já temos definidos alguns itens de menu/categorias. Pergunto se são parametrizáveis ou se serão fixas?"

## Decisões (via AskUserQuestion)

1. **Categorias**: Parametrizáveis com CRUD admin (não fixas em código)
2. **Navegação**: Fixa em código por enquanto, preparada para migrar para banco no futuro

## O que foi feito

### SPEC-004 (Visão Cards)

- Escopo atualizado: "categorias parametrizáveis via banco (model Category, CRUD admin)"
- RF-004-03 atualizado: chips carregados do banco (model Category, ordenados por `order`)
- RF-004-21 adicionado: CRUD admin para categorias
- RF-004-22 adicionado: Seed com categorias default (Cartões, Financeiro, Operações, Compliance, Analytics, Infraestrutura)
- UI de chips: "Todas" hardcoded como primeiro, resto do banco

### SPEC-001 (Setup)

- Model Category adicionado ao schema Prisma (id, name, slug, icon, order, timestamps)
- Model Application atualizado: `category String` → `categoryId String` com FK para Category
- RF-001-04 atualizado para incluir Category

## Arquivos modificados

- `pc-spec-004-visao-cards.md` — categorias parametrizáveis
- `pc-spec-001-projeto-setup.md` — model Category no Prisma
