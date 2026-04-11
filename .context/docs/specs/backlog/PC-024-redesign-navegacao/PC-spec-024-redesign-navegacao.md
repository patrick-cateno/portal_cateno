# PC-024 — Redesign de Navegação: Top Nav + Sidebar Contextual

## Resumo

Substituir o layout atual (sidebar fixa do CSA + sidebar do microsserviço lado a lado) por
um modelo de **navegação superior para o portal** com **sidebar contextual** que aparece
apenas dentro de microsserviços e do painel Admin. O objetivo é maximizar o uso da tela,
eliminar a duplicidade de menus e criar uma experiência moderna e fluida.

## Problema

O layout atual apresenta dois problemas principais:

1. **Desperdício de espaço**: duas sidebars lado a lado (~400px) deixam o conteúdo com ~60% da tela
2. **Confusão visual**: o usuário não sabe qual menu é o principal — o do portal ou o do microsserviço

## Referências visuais

Mockups aprovados no Stitch (projeto `13867524087461247339`):
- **Home Dashboard** — top nav, sem sidebar, grid de apps + métricas
- **Admin — Gestão de Aplicações** — sidebar Admin, top bar com breadcrumb
- **Aplicações — Catálogo** — full-width, grid 3 colunas
- **CatIA Chat** — layout centrado, conversacional
- **Reservas — Minhas Estações** — sidebar exclusiva do microsserviço

## Arquitetura de Navegação

### Dois modos de layout

#### Modo Portal (Home, Aplicações, CatIA, Favoritos)

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo CSA]  Início  Aplicações  CatIA  Favoritos   🔍 🔔 👤 │  ← Top Nav (56px)
├──────────────────────────────────────────────────────────────┤
│ PORTAL > HOME                                                │  ← Breadcrumb
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Conteúdo full-width (100%)                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Sem sidebar lateral
- Conteúdo centralizado (max-width ~1200px)
- Top bar com pills de navegação: Início, Aplicações, CatIA, Favoritos
- Busca compacta, notificações, avatar do usuário

#### Modo Microsserviço / Admin (ao entrar em Reservas, Admin, etc.)

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo CSA]  CSA > Reservas > Minhas Estações    🔍 🔔 👤    │  ← Top Nav colapsada
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │         Conteúdo (~80% da tela)                 │
│  do micro  │                                                 │
│  (240px)   │                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

- Top bar colapsa: pills de navegação somem, substituídas por breadcrumb clicável
- "CSA" no breadcrumb volta ao portal
- Sidebar é **exclusiva do microsserviço** (ou do Admin)
- Conteúdo ocupa o restante da tela

### Regras de transição

| Rota | Modo | Sidebar | Top Nav |
|------|------|---------|---------|
| `/` (Home) | Portal | Nenhuma | Pills: Início, Aplicações, CatIA, Favoritos |
| `/aplicacoes` | Portal | Nenhuma | Pills (Aplicações ativo) |
| `/catia` | Portal | Nenhuma | Pills (CatIA ativo) |
| `/favoritos` | Portal | Nenhuma | Pills (Favoritos ativo) |
| `/reservas/*` | Microsserviço | Sidebar do Reservas | Breadcrumb "CSA > Reservas > ..." |
| `/admin/*` | Microsserviço | Sidebar do Admin | Breadcrumb "CSA > Admin > ..." |
| `/[slug]/*` | Microsserviço | Sidebar do micro | Breadcrumb "CSA > [App] > ..." |

## Escopo

### Incluído

- **Top Nav bar** — novo componente com pills de navegação, busca, notificações, avatar
- **Layout Portal** — sem sidebar, conteúdo full-width
- **Layout Microsserviço** — top nav colapsada com breadcrumb, sidebar contextual
- **Home Dashboard** — redesign com métricas, favoritos, apps recentes, FAB CatIA
- **Aplicações** — redesign do catálogo com grid 3 colunas full-width
- **CatIA** — layout centrado sem sidebar
- **Admin** — sidebar Admin com seções Gestão/Monitoramento/Configurações
- **Reservas** — manter sidebar atual mas remover sidebar do CSA
- **Responsividade** — top nav colapsa em hamburger no mobile
- **Transição animada** — fade suave entre modos (portal ↔ microsserviço)

### Excluído

- Redesign interno das páginas de microsserviços (Escritórios, Salas, etc.)
- Mudanças no design system de cores/tokens (mantém teal #0D9488)
- Mudanças na autenticação ou permissões

## Componentes a criar/modificar

### Novos componentes

| Componente | Path | Descrição |
|-----------|------|-----------|
| `TopNavBar` | `src/components/layout/top-nav-bar.tsx` | Barra superior com logo, pills, busca, notificações, avatar |
| `NavPills` | `src/components/layout/nav-pills.tsx` | Pills de navegação do portal (Início, Aplicações, CatIA, Favoritos) |
| `PortalLayout` | `src/components/layout/portal-layout.tsx` | Layout sem sidebar para páginas do portal |
| `MicroserviceLayout` | `src/components/layout/microservice-layout.tsx` | Layout com sidebar contextual para microsserviços |
| `HomeDashboard` | `src/components/features/home/home-dashboard.tsx` | Nova home com métricas, favoritos, apps recentes |

### Componentes a modificar

| Componente | Mudança |
|-----------|---------|
| `AppShell` (`src/components/layout/`) | Detectar modo (portal vs micro) e renderizar layout correto |
| `Sidebar` existente | Remover items do CSA quando dentro de micro, manter apenas items do micro |
| `Header` existente | Substituir por TopNavBar |
| `Breadcrumb` | Adicionar link "CSA" que volta ao portal |

### Componentes a remover

| Componente | Motivo |
|-----------|--------|
| Sidebar do CSA (Início, Favoritos, Suporte, Admin, Ajuda) | Substituída por top nav pills |

## Plano de implementação

### Fase 1 — Layout e Navegação (P → R → E)

| # | Task | Status |
|---|------|--------|
| 1.1 | Criar `TopNavBar` com pills, busca, notificações, avatar | pending |
| 1.2 | Criar `PortalLayout` (sem sidebar, conteúdo centralizado max-w-1200px) | pending |
| 1.3 | Criar `MicroserviceLayout` (top nav colapsada + sidebar contextual) | pending |
| 1.4 | Modificar `AppShell` para detectar modo (portal vs micro via rota) | pending |
| 1.5 | Atualizar breadcrumb com link "CSA" para voltar ao portal | pending |
| 1.6 | Responsividade: hamburger menu no mobile | pending |

### Fase 2 — Redesign de Páginas do Portal (E)

| # | Task | Status |
|---|------|--------|
| 2.1 | Redesign Home Dashboard (métricas, favoritos, apps recentes, FAB CatIA) | pending |
| 2.2 | Redesign Aplicações (catálogo full-width, grid 3 colunas, filtros) | pending |
| 2.3 | Adaptar CatIA (layout centrado sem sidebar) | pending |
| 2.4 | Adaptar Favoritos (full-width) | pending |

### Fase 3 — Adaptar Microsserviços (E)

| # | Task | Status |
|---|------|--------|
| 3.1 | Reservas: remover sidebar CSA, manter sidebar do Reservas | pending |
| 3.2 | Admin: criar sidebar Admin com seções Gestão/Monitoramento/Configurações | pending |
| 3.3 | Garantir que novos microsserviços usem `MicroserviceLayout` automaticamente | pending |

### Fase 4 — Validação (V)

| # | Task | Status |
|---|------|--------|
| 4.1 | Navegar entre portal e microsserviço — transição correta de layout | pending |
| 4.2 | Breadcrumb funcional — "CSA" volta ao portal | pending |
| 4.3 | Responsividade — hamburger no mobile, layout adaptável | pending |
| 4.4 | Todos os testes existentes passando | pending |
| 4.5 | Favoritos e busca funcionando na top nav | pending |

## Critérios de aceite

- [ ] Páginas do portal (Home, Aplicações, CatIA, Favoritos) sem sidebar lateral
- [ ] Top nav bar com pills de navegação, busca, notificações e avatar
- [ ] Ao entrar em microsserviço, top nav colapsa para breadcrumb + sidebar do micro aparece
- [ ] Breadcrumb "CSA" clicável volta ao portal
- [ ] Home Dashboard com métricas, favoritos e apps recentes
- [ ] Catálogo de Aplicações full-width com grid 3 colunas
- [ ] CatIA chat layout centrado sem sidebar
- [ ] Admin com sidebar própria (Gestão/Monitoramento/Configurações)
- [ ] Reservas com sidebar própria (sem sidebar CSA)
- [ ] Responsividade mobile (hamburger menu)
- [ ] Nenhum teste existente quebrado
- [ ] Consistência visual com mockups aprovados no Stitch

## Decisões de revisão (2026-04-10)

1. **Suporte e Ajuda** — ficam como ícone "?" na top nav (ao lado de busca/notificações), sem ocupar pill. Ao clicar abre dropdown com links para Suporte e Ajuda.
2. **FAB CatIA** — somente na Home. CatIA já tem pill na top nav, FAB seria redundante em outras páginas.
3. **Admin** — entra em modo microsserviço (com sidebar Admin própria). Não aparece nas pills da top nav.
4. **PRs** — implementação em 3 PRs:
   - PR 1: Layout (TopNav + detecção de modo + breadcrumb)
   - PR 2: Redesign Home + Aplicações
   - PR 3: Adaptar Reservas + Admin

## Considerações técnicas

### Detecção de modo

A rota determina o modo:
- `/`, `/aplicacoes`, `/catia`, `/favoritos`, `/ajuda`, `/suporte` → **Modo Portal**
- `/reservas/*`, `/admin/*`, `/[qualquer-micro]/*` → **Modo Microsserviço**

Implementação: manter o route group `(app)/` existente. O `AppShell` detecta o modo
pela rota (`usePathname`) e renderiza o layout correto. Não criar novos route groups
para evitar mover arquivos e quebrar imports.

### Sidebar contextual

Cada microsserviço define seus items de sidebar via configuração:
```typescript
interface MicroserviceSidebarConfig {
  title: string;
  icon: string;
  sections: {
    label: string;
    items: { label: string; href: string; icon: string }[];
  }[];
}
```

### Persistência entre modos

- Top nav sempre visível (muda de pills para breadcrumb)
- Busca global sempre acessível
- Notificações e avatar sempre visíveis
- Transição via CSS (fade/slide, 200ms ease)
