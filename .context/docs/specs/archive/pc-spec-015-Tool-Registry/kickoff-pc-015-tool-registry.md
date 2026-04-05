# Kickoff — PC-SPEC-015: Tool Registry Dinâmico do CatIA

**Agente:** backend-specialist
**Wave:** 4 — requer pc-008 + pc-010 completos
**Estimativa:** ~18h

## Antes de começar

Confirme que pc-008 (schema Prisma) e pc-010 (Admin Panel) estão completos.
Leia a spec completa:
```
.context/docs/specs/backlog/pc-015-Tool-Registry/pc-spec-015-Tool-Registry.md
```

## O que implementar

### 1. Schema Prisma — adicionar MicroserviceTool

Ver spec seção 3. Model já está previsto no pc-008 mas sem detalhes.
Migration: `prisma migrate dev --name add-microservice-tool`

### 2. API Routes

```
src/app/api/tools/
├── route.ts          # GET (lista) + POST (registrar — admin ou service account)
└── [id]/
    └── route.ts      # PATCH (ativar/desativar)
```

### 3. Funções para o CatIA

```
src/lib/catia/tools/
├── registry.ts       # loadToolsForUser(userRoles) → AnthropicTool[]
└── executor.ts       # executeTool(name, input, userToken) → unknown
```

**Regra crítica de segurança:**
`executeTool()` SEMPRE propaga o JWT original do usuário para o microsserviço.
O CatIA nunca usa token próprio — RBAC é enforced no microsserviço destino.

### 4. Seção no Admin Panel (pc-010)

Adicionar `/admin/tools` para listar e ativar/desativar tools registradas.

### 5. Seed de exemplo

Registrar tools do microsserviço de vagas como exemplo funcional.

## Critérios de aceite

- [ ] Model MicroserviceTool no Prisma com migration
- [ ] POST /api/tools/register funcionando
- [ ] loadToolsForUser() com filtro por role
- [ ] executeTool() com JWT do usuário propagado
- [ ] Seção de tools no Admin Panel
- [ ] Seed com tools de exemplo
- [ ] Teste: registrar tool → CatIA carrega automaticamente

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "backend-specialist", to: "feature-developer", artifacts: ["src/lib/catia/tools/", "src/app/api/tools/"] })
```
