@AGENTS.md

# Protocolo Obrigatório — CSA - CatIA Super App

---

## 0. O que é este projeto (ler antes de qualquer coisa)

O **CSA (CatIA Super App)** é um **frontend shell** — uma aplicação React que centraliza e
roteia para todos os microsserviços da Cateno.

**O CSA NÃO contém lógica de negócio.** Toda regra de negócio vive nos microsserviços.
O CSA sabe apenas:
- **Quais** aplicações existem (via Service Registry API)
- **Quem** pode acessar cada uma (roles extraídos do JWT — nunca decidido no frontend)
- **Como** abrir cada uma (redirect / embed / modal — definido pelo campo `integration_type`)

Violar esta separação é o erro mais grave que pode ser cometido neste projeto.

---

## 1. Log de Interações (OBRIGATÓRIO a cada interação)

**Regra absoluta**: após CADA interação significativa com o usuário (qualquer pergunta
respondida, decisão tomada, arquivo criado/editado, revisão feita), o assistente DEVE:

1. **Capturar timestamp de início** — executar `TZ="America/Sao_Paulo" date` no início
2. **Capturar timestamp de fim** — executar `TZ="America/Sao_Paulo" date` ao concluir
3. **Adicionar entrada** em `.context/logs/interaction-log.md` (mais recente primeiro)
4. **Criar arquivo de detalhe** em `.context/logs/details/pc-int-NNN-<slug>.md`
5. **Atualizar resumo acumulado** (total de interações, tempo acumulado)
6. **Marcar checkbox** na seção "Checklist da Sessão Atual" do log

### Quando NÃO logar
- Mensagens puramente conversacionais sem decisão ou artefato ("ok", "entendi")
- Continuação direta da mesma interação sem pausa

### Formato do ID
`PC-INT-{NNN}` — sequencial, sem pular números.

---

## 2. Spec-Driven Development (SDD)

- **Nunca implementar sem SPEC aprovada**
- Seguir workflow PREVC: Plan → Review → Execute → Validate → Commit
- Ordem de implementação: SPEC-001 → SPEC-006 → SPEC-002 → SPEC-003 → SPEC-004 → SPEC-005

---

## 3. Stack obrigatória

| Camada | Tecnologia | Restrição |
|--------|-----------|-----------|
| Framework | Next.js (App Router) | Ler docs em `node_modules/next/dist/docs/` antes de qualquer código |
| Linguagem | TypeScript strict mode | Nunca usar `any` |
| Estilo | Inline styles com tokens de `src/tokens.ts` | Nunca hardcodar cor, espaçamento ou fonte |
| Ícones | Lucide React | Sem outras bibliotecas de ícone |
| Fonte | Inter via Google Fonts | Sem outras fontes |
| Auth | OAuth2 PKCE com fetch nativo | Sem bibliotecas de auth externas |
| Estado | React state + Context API | Sem Redux, Zustand ou similares |
| HTTP | `catFetch` wrapper em `src/api/client.ts` | Nunca usar fetch diretamente nas páginas |
| Validação | Zod | Schemas de formulários e parsing de respostas de API |
| Testes | Vitest + Testing Library | `vitest run` (unitários) · `vitest run --reporter=verbose` (regressão) |

### Next.js
Antes de escrever qualquer código Next.js, ler o guia relevante em
`node_modules/next/dist/docs/`. Respeitar deprecation notices.

---

## 3a. Linguagem e Localização

- **Interface**: Sempre em português brasileiro (pt-BR)
- **Código**: Nomes técnicos em inglês, labels e mensagens ao usuário em português
- **Datas**: Formato `dd/mm/yyyy` na UI — ISO 8601 internamente — Timezone: `America/Sao_Paulo`
- **Documentação**: Português para SPECs, READMEs e docs de contexto (`.context/`)

---

## 3b. Qualidade e Testes

- Testes unitários obrigatórios para utilitários e lógica pura — usar **Vitest**
- Toda SPEC deve definir cenários de teste **antes** da implementação
- Zero tolerância a falhas: todos os testes devem passar antes de qualquer PR
- **Nenhum dado mockado** deve ir para a branch `main` em serviços críticos
- Cache deve ser **invalidado** após qualquer operação de escrita
- Usar **Zod** para validar dados de API antes de renderizar e inputs de formulário

---

## 3c. Governança Git

- Usar **Feature Branches** obrigatoriamente: `feat/PC-XXX-NomeDaFuncionalidade`
- **Proibido** commit direto em `main`
- Pull Requests obrigatórios para integração — exigem aprovação de code review
- Nenhum PR aprovado sem o checklist da seção 12 completo

---

## 4. Design System — Tokens obrigatórios

**Nunca hardcodar valores. Sempre importar de `src/tokens.ts`.**

```typescript
// Paleta principal — Teal
teal600: "#0D9488"   // botões primários, links, sidebar ativa  ← COR PRINCIPAL
teal700: "#0F766E"   // hover de botões primários
teal500: "#14B8A6"   // background de login, CTA secundário
teal50:  "#F0FDFA"   // background de página

// Neutros
gray900: "#0F172A"   // headings
gray800: "#1E293B"   // texto principal
gray700: "#334155"   // texto corpo
gray500: "#64748B"   // texto secundário
gray400: "#94A3B8"   // placeholder
gray200: "#E2E8F0"   // bordas e divisores
gray100: "#F1F5F9"   // hover de linhas
gray50:  "#F8FAFC"   // background alternativo
white:   "#FFFFFF"   // cards e superfícies

// Semânticas
success: "#10B981"
warning: "#F59E0B"
danger:  "#EF4444"

// Accent
lime300: "#BEF264"   // tags de ferramentas e badges
```

### Valores fixos
- **Border radius:** `6px` (sm) · `8px` (md) · `12px` (lg) · `16px` (xl) · `9999px` (pill)
- **Fonte base:** `14px`, família `Inter`
- **Transição padrão:** `all 0.25s ease`
- **Sombra de card:** `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`

### Componentes — comportamento obrigatório
- **Botão primário:** background `teal600`, hover `teal700`, texto branco
- **Sidebar item ativo:** background `teal600`, texto branco
- **Sidebar item hover:** background `teal50`
- **Card hover:** borda `teal300`, `translateY(-3px)`, sombra com teal
- **Status online:** `#10B981` com glow · **maintenance:** `#F59E0B`
- **Tags de ferramentas:** background `lime300`, texto `gray800`, border-radius pill

---

## 5. Autenticação — Regras invioláveis

### Nunca fazer
- Armazenar `access_token` ou `refresh_token` em `localStorage` ou `sessionStorage`
- Armazenar senha ou qualquer credencial
- Fazer chamadas de API sem passar pelo interceptor `catFetch`
- Tomar decisão de autorização no frontend (ex: `if user.role === 'admin'`)

### Sempre fazer
- Guardar tokens **exclusivamente em variável de módulo** em `src/auth/tokenStore.ts`
- Usar `crypto.getRandomValues()` para gerar `code_verifier` e `state` (nunca `Math.random()`)
- Validar o `state` CSRF ao receber o callback do IDP
- Iniciar refresh silencioso quando `access_token` expira em **menos de 60 segundos**
- Redirecionar para login (salvando a rota atual) quando `refresh_token` retornar `400 invalid_grant`
- Propagar o JWT em toda chamada via header `Authorization: Bearer <token>`

### Fluxo OAuth2 PKCE obrigatório
```
1. Gerar code_verifier (64 bytes) + code_challenge (SHA256 base64url) + state
2. Redirecionar para IDP /authorize com PKCE params
3. Receber callback → validar state → trocar code por tokens via POST /token
4. Salvar tokens em memória
5. Interceptor injeta Bearer em todo catFetch
6. Timer faz refresh silencioso antes de expirar
7. Se refresh falhar → limpar memória → redirecionar para login
```

---

## 6. Service Registry — Fonte de verdade dos apps

**O array `apps[]` hardcoded no código atual é temporário e deve ser removido.**

### Endpoints obrigatórios

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/registry/v1/apps` | Popular catálogo de cards |
| `GET` | `/registry/v1/apps/{slug}` | Detalhes ao clicar em um card |
| `GET` | `/registry/v1/apps/status` | Polling de status a cada 30s |
| `GET` | `/registry/v1/categories` | Filtros de categoria |

### Regras
- **Nunca filtrar apps por role no frontend** — o servidor já retorna só o que o usuário pode ver
- O campo `integration_type` define como abrir o app:
  - `redirect` → `window.location.href = frontend_url`
  - `embed` → renderizar `<iframe src={frontend_url} />`
  - `modal` → chamar `api_base_url` e renderizar dados inline
- O polling de status usa `setInterval` com **cleanup no `useEffect`** — obrigatório para evitar memory leak
- O `slug` é o identificador permanente de cada app — nunca muda após o registro

---

## 7. CatIA — Orquestrador de microsserviços

### O que o CatIA faz
O CatIA **não tem respostas hardcoded**. Ele:
1. Faz `GET /catia/manifest` em cada microsserviço registrado no bootstrap
2. Converte cada `action` do manifesto em uma `tool_definition` para o LLM
3. Remove tools cujo `permission_required` o JWT do usuário não satisfaz
4. Envia mensagem do usuário + tools disponíveis para o LLM
5. Executa a tool escolhida chamando o endpoint real do microsserviço
6. Retorna o resultado ao LLM para formular resposta em linguagem natural

### Regras do CatIA Backend
- **Nunca executar uma action sem validar o scope do JWT primeiro**
- **Nunca expor ao LLM tools que o usuário não pode usar**
- Actions com `confirmation_required: true` exigem confirmação explícita do usuário antes de executar
- O JWT do usuário é propagado para o microsserviço — nunca usar credencial própria do CatIA
- Toda chamada de tool é registrada em audit log com: user_id, action, input, timestamp, resultado

### Contrato que cada microsserviço deve implementar
Cada microsserviço deve expor `GET /catia/manifest` retornando:
```json
{
  "service": { "slug", "name", "description", "icon_name" },
  "actions": [
    {
      "name": "snake_case_unico",
      "display_name": "Nome legível",
      "description": "Quando usar — frases do usuário que disparam esta action",
      "permission_required": "scope:operacao",
      "http": { "method": "POST", "path": "/endpoint-real" },
      "parameters": [{ "name", "in", "type", "description", "required" }],
      "response_fields": [{ "field", "description" }],
      "examples": [{ "user_says", "input" }],
      "confirmation_required": false
    }
  ]
}
```
O campo `description` da action é o mais crítico — define quando o LLM usa a tool.
Escrever como se explicasse para humano que nunca viu o sistema, com frases reais do usuário.

---

## 8. Modelo de Permissões

### Roles disponíveis

| Role | Apps visíveis | Scopes |
|------|--------------|--------|
| `admin` | Todos + Service Registry + API Gateway | Todos |
| `financeiro` | Conciliação, Liquidação, Cobrança, Receita | `fatura:read/write`, `conciliacao:read` |
| `cartoes` | Gestão Cartões, Fatura, Limites, Emissão, Cashback | `cartao:read/write`, `fatura:read/write` |
| `compliance` | Antifraude, KYC, Compliance BACEN | `fraude:read/write`, `kyc:read/write` |
| `analytics` | Dashboard Executivo, Observabilidade | `dashboard:read`, `metricas:read` |
| `readonly` | Conforme roles atribuídos | Apenas scopes `:read` |

### Regras de autorização por camada
1. **API Gateway** — valida assinatura JWT via JWKS, rejeita tokens inválidos/expirados
2. **Service Registry** — filtra apps por `roles` do JWT antes de responder
3. **CatIA Backend** — remove tools cujo `permission_required` o usuário não possui
4. **Microsserviço** — re-valida JWT e verifica scope da operação específica

### O que nunca fazer
- Nunca tomar decisão de `can_view` ou `can_execute` no portal frontend
- Nunca esconder elemento de UI baseado em role sem validação server-side correspondente
- Nunca confiar em claims do JWT sem validar a assinatura primeiro

---

## 8b. Segurança Frontend — Regras adicionais

- **Nunca expor chaves, secrets ou tokens de serviço no bundle client-side**
- **Todas as URLs de API** devem ser constantes centralizadas em `src/api/constants.ts` — nunca hardcoded inline
- Validar e sanitizar dados da API com **Zod** antes de renderizar qualquer conteúdo dinâmico
- Usar `textContent` em vez de `innerHTML` para conteúdo gerado dinamicamente
- Aplicar `rel="noopener noreferrer"` em todos os links com `target="_blank"`
- Configurar **Content Security Policy (CSP)** via headers — sem `unsafe-inline`
- Implementar **Subresource Integrity (SRI)** para qualquer recurso de CDN externo

---

## 9. Estrutura de pastas obrigatória

```
csa-catia-super-app/
├── CLAUDE.md                        ← Este arquivo (nunca remover)
├── AGENTS.md                        ← Regras para modo agêntico
├── docs/
│   ├── service-registry-openapi.yaml
│   ├── catia-manifest-contract.yaml
│   └── architecture.md
├── src/
│   ├── tokens.ts                    ← Única fonte de verdade de design tokens
│   ├── types/
│   │   ├── app.types.ts             ← AppSummary, AppDetail, AppHealth, etc.
│   │   └── auth.types.ts            ← TokenPayload, UserProfile
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── tokenStore.ts            ← Tokens em memória (nunca em storage)
│   │   ├── useAuth.ts
│   │   └── pkce.ts                  ← Funções PKCE com crypto.getRandomValues
│   ├── api/
│   │   ├── client.ts                ← catFetch com interceptor de token
│   │   ├── registry.api.ts          ← Chamadas ao Service Registry
│   │   └── catia.api.ts             ← Chamadas ao CatIA Backend
│   ├── components/
│   │   ├── layout/
│   │   ├── catalog/                 ← AppCard, AppCatalog, CategoryFilter
│   │   └── catia/                   ← CatIAChat, MessageBubble
│   └── hooks/
│       ├── useApps.ts               ← Fetch e cache do catálogo
│       └── useHealthPolling.ts      ← setInterval com cleanup obrigatório
└── .context/
    ├── logs/                        ← Logs de interação (seção 1)
    │   └── details/
    └── docs/
        └── specs/
            ├── backlog/             ← pc-spec-XXX-nomeDaFuncionalidade (aguardando)
            ├── active/              ← SPEC em implementação + todos os artefatos relacionados
            │   └── pc-spec-XXX-nomeDaFuncionalidade/
            │       ├── pc-spec-XXX-nomeDaFuncionalidade.md
            │       ├── pc-task-XXX-nomeDaFuncionalidade.md
            │       ├── pc-plan-XXX-nomeDaFuncionalidade.md
            │       ├── pc-walkthrough-XXX-nomeDaFuncionalidade.md
            │       └── pc-test-XXX-nomeDaFuncionalidade.md
            └── archive/             ← SPECs concluídas
```

---

## 10. Tipos TypeScript obrigatórios

**Nunca usar `any`. Sempre usar os tipos abaixo.**

```typescript
// src/types/app.types.ts

export type IntegrationType = 'redirect' | 'embed' | 'modal'
export type AppStatus = 'online' | 'maintenance' | 'offline'
export type MetricsPeriod = 'last_7_days' | 'last_30_days' | 'last_90_days'

export interface CategoryRef { slug: string; name: string }

export interface AppMetrics {
  active_users: number
  trend_pct: number
  period: MetricsPeriod
}

export interface AppSummary {
  id: string
  slug: string
  name: string
  description: string
  category: CategoryRef
  icon_name: string
  integration_type: IntegrationType
  frontend_url?: string
  status: AppStatus
  display_order: number
  tags: Array<{ key: string; value: string }>
  metrics?: AppMetrics | null
}

export interface AppHealth {
  status: AppStatus
  response_time_ms: number | null
  uptime_pct: number
  last_checked_at: string    // ISO 8601
  error_message: string | null
}

export interface AppDetail extends AppSummary {
  api_base_url?: string
  health_check_url: string
  version?: string
  health?: AppHealth
  permissions: Array<{ role: string; can_view: boolean; can_execute: boolean }>
}

export interface AppCatalogResponse {
  total: number
  categories: Array<{ slug: string; name: string; count: number }>
  apps: AppSummary[]
}

export interface AppStatusResponse {
  summary: { online: number; maintenance: number; offline: number }
  apps: Array<{ slug: string; status: AppStatus; response_time_ms: number | null }>
}
```

---

## 10b. Skills de Segurança — Uso obrigatório

As skills abaixo estão em `.context/skills/` e devem ser executadas em dois momentos:

### Na criação de cada SPEC
Antes de finalizar qualquer SPEC, executar as três skills de análise:
- `.context/skills/frontend-security-coder/` — XSS, sanitização, CSP, DOM seguro
- `.context/skills/api-security-best-practices/` — validação de inputs, autenticação, rate limiting
- `.context/skills/top-web-vulnerabilities/` — OWASP Top 10, injeção, exposição de dados

A SPEC deve incluir uma seção **"Considerações de Segurança"** documentando os riscos
identificados e as mitigações adotadas. Nenhuma SPEC é aprovada sem esta seção.

### Antes de declarar o desenvolvimento concluído
Executar a skill de auditoria completa:
- `.context/skills/security-auditor/` — revisão de controles, autenticação, autorização e proteção de dados

Se a auditoria identificar vulnerabilidades, elas devem ser corrigidas e o checklist da
seção 11 deve ser refeito. **Nenhuma entrega é aceita com vulnerabilidades abertas.**

---

## 11. Checklist antes de iniciar o desenvolvimento

**Nenhuma linha de código deve ser escrita sem estes itens confirmados.**

- [ ] SPEC criada em `.context/docs/specs/backlog/pc-spec-XXX-nomeDaFuncionalidade/`
- [ ] SPEC revisada e aprovada explicitamente (comentário de aprovação no PR da SPEC ou mensagem registrada no log)
- [ ] Seção "Considerações de Segurança" presente na SPEC — skills em `.context/skills/frontend-security-coder/`, `api-security-best-practices/` e `top-web-vulnerabilities/` executadas
- [ ] Plano de implementação (`pc-plan-XXX`) criado e aprovado
- [ ] Cenários de teste (`pc-test-XXX`) definidos na SPEC antes de qualquer código
- [ ] SPEC movida de `backlog/` para `active/`
- [ ] Branch criada seguindo padrão `feat/PC-XXX-NomeDaFuncionalidade`
- [ ] Log de início registrado em `.context/logs/`

---

## 12. Checklist antes de qualquer PR

**Só chegar aqui se o checklist da seção 11 estiver completo.**

### Código
- [ ] Nenhum token, cor ou espaçamento hardcoded (tudo via `src/tokens.ts`)
- [ ] Nenhum `any` no TypeScript
- [ ] Nenhuma chamada de fetch direta (tudo via `catFetch`)
- [ ] Nenhum token em `localStorage` ou `sessionStorage`
- [ ] Nenhuma decisão de autorização no frontend
- [ ] Polling de health com cleanup no `useEffect`
- [ ] Todas as URLs de API centralizadas em `src/api/constants.ts`
- [ ] Nenhuma chave ou secret exposto no bundle client-side
- [ ] Dados de API validados com Zod antes de renderizar
- [ ] Nenhum dado mockado indo para `main` em serviços críticos

### Testes
- [ ] Todos os testes unitários passando — zero falhas (`vitest run`)
- [ ] Todos os testes de regressão passando sem quebra (`vitest run --reporter=verbose`)
- [ ] Cache invalidado após operações de escrita testadas

### Documentos e Rastreabilidade
- [ ] SPEC aprovada antes da implementação
- [ ] SPEC movida de `backlog/` para `active/` no início · para `archive/` na conclusão
- [ ] Todos os artefatos na pasta da SPEC ativa: task, plan, walkthrough, test
- [ ] Rastreabilidade bidirecional: SPEC linka artefatos · artefatos linkam SPEC
- [ ] Log de interação registrado em `.context/logs/`

### Segurança
- [ ] Skills `.context/skills/frontend-security-coder/`, `api-security-best-practices/` e `top-web-vulnerabilities/` executadas na SPEC
- [ ] Seção "Considerações de Segurança" presente na SPEC aprovada
- [ ] Auditoria `securityAudit` executada — nenhuma vulnerabilidade aberta

### Git
- [ ] Branch seguindo padrão `feat/PC-XXX-NomeDaFuncionalidade`
- [ ] Nenhum commit direto em `main`
- [ ] PR aberto com descrição referenciando o ID da SPEC
