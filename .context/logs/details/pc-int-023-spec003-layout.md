# PC-INT-023 — SPEC-003: Layout Principal e Navegacao

| Campo          | Valor                        |
| -------------- | ---------------------------- |
| **ID**         | PC-INT-023                   |
| **Inicio**     | 2026-04-03T21:41 -03         |
| **Fim**        | 2026-04-03T22:18 -03         |
| **Duracao**    | ~37 min                      |
| **Branch**     | feat/PC-003-layout-navegacao |
| **Tokens in**  | ~3.000                       |
| **Tokens out** | ~15.000                      |

## O que foi feito

### UI Primitives (3 novos)
- `avatar.tsx` — imagem ou iniciais, CVA sizes sm/md/lg
- `tooltip.tsx` — CSS group-hover, posicionamento top/bottom/left/right
- `dropdown.tsx` — Compound pattern: Dropdown, Trigger, Content, Item, Separator, Label. Click-outside + Escape

### Hooks (3 novos)
- `use-click-outside.ts` — detecta click fora de um ref
- `use-keyboard-shortcut.ts` — handler generico + `useCmdK()` shortcut
- `use-layout.tsx` — LayoutContext: sidebarCollapsed, sidebarOpen, localStorage persist

### Navigation Config Refactor
- `navigation.ts` — adicionado `sidebarNavItems` (Inicio, Favoritos, Suporte, Admin com roles), `mobileNavItems`, `breadcrumbLabels`, `ViewMode`

### Layout Components (12 novos)
- `skip-link.tsx` — skip to #main-content
- `breadcrumb.tsx` — dynamic de usePathname + breadcrumbLabels
- `view-toggle.tsx` — Aplicacoes/CatIA segmented control, active por pathname
- `sidebar-link.tsx` — nav item com icon dinamico (lucide), active state teal-600
- `sidebar.tsx` — collapsible 240px/64px, filtro por roles, version footer
- `user-dropdown.tsx` — avatar + dropdown com perfil, config, logout
- `search-trigger.tsx` — input placeholder + Cmd+K overlay
- `notification-bell.tsx` — icon + badge count
- `mobile-nav.tsx` — bottom bar md:hidden
- `mobile-drawer.tsx` — slide-in drawer com backdrop
- `header.tsx` — compoe logo, hamburger, breadcrumb, view-toggle, search, bell, user
- `app-shell.tsx` — LayoutProvider + Header + Sidebar + main + MobileNav + MobileDrawer

### Route Integration
- `(app)/layout.tsx` — Server component com auth() gate, passa userRoles para AppShell

### Testes (7 novos, 38 testes)
- avatar (6), dropdown (7), breadcrumb (6), sidebar (6), user-dropdown (4), header (6), navigation config (3 atualizado)

## Resultados
- **Type-check**: OK
- **Build**: OK (Next.js 16.2.2 Turbopack)
- **Testes**: 156/156 passando (23 test files)

## Fixes durante verificacao
- `use-layout.ts` → `.tsx` (continha JSX)
- lucide-react cast: `as unknown as Record<string, LucideIcon>` para evitar type error
- Header test: `getAllByText` para "Aplicacoes" que aparecia no breadcrumb e view toggle
