# PC-SPEC-003 — Layout Principal e Navegação

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | PC-SPEC-003                  |
| **Status**       | Done                         |
| **Prioridade**   | Crítica                      |
| **Complexidade** | Média                        |
| **Criado em**    | 2026-04-03                   |
| **Autor**        | Patrick Iarrocheski          |
| **Branch**       | feat/PC-003-layout-navegacao |

## 1. Objetivo

Implementar o layout principal (app shell) do Portal Cateno com header, sidebar colapsável, navegação inteligente, breadcrumbs e dropdown de usuário. Estabelecer a estrutura visual que envolve todas as páginas autenticadas.

## 2. Escopo

### 2.1 Incluído

- Header fixo branco (altura 64px) com logo Cateno + navegação
- Sidebar colapsável: expandido 240px / colapsado 64px (apenas ícones)
- Transição suave entre estados collapsed/expanded
- Itens de navegação com ícones + labels (quando expandido)
- Estado ativo com borda teal-600 à esquerda e background teal-50
- Menu dropdown de usuário (avatar com iniciais) com logout
- Notification bell no header (placeholder para futura funcionalidade)
- View toggle "Aplicações / CatIA" no header
- Breadcrumb dinâmico baseado em rota
- Footer minimalista com copyright
- Comportamento responsivo: mobile = bottom nav / drawer
- Keyboard shortcuts: Cmd/Ctrl+K para search overlay
- Dark mode preparation (CSS vars, sem implementação)
- Accessibility: ARIA labels, keyboard navigation, focus states

### 2.2 Excluído

- Implementação de notificações reais (será PC-SPEC-008)
- Integração com data analytics
- Temas customizáveis (dark mode será futuro)
- Integração com aplicações externas via sidebar
- Search global avançada (será PC-SPEC-007)

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| RF-003-01 | Header deve exibir logo Cateno esquerda, view toggle centro, notifications + user menu direita                                            |
| RF-003-02 | Sidebar deve suportar dois estados: expandido (240px) e colapsado (64px)                                                                  |
| RF-003-03 | Toggle de sidebar deve estar no header (ícone hamburger)                                                                                  |
| RF-003-04 | Sidebar deve conter itens de navegação com ícones (MVP: fixos em `config/navigation.ts`, estrutura preparada para vir do banco no futuro) |
| RF-003-05 | Item de navegação ativo deve ter border-left teal-600 e background teal-50                                                                |
| RF-003-06 | Itens inativos devem ter ícone neutral-500, label neutral-600                                                                             |
| RF-003-07 | Itens inativos ao hover devem ter background neutral-50                                                                                   |
| RF-003-08 | Collapsed sidebar deve mostrar apenas ícones com tooltip ao hover                                                                         |
| RF-003-09 | View toggle "Aplicações / CatIA" deve estar apenas no header (não na sidebar) e alternar entre os dois modos                              |
| RF-003-10 | Notification bell deve mostrar badge com contagem (inicialmente 0)                                                                        |
| RF-003-11 | Avatar dropdown deve listar: nome, email, "Meu Perfil", "Configurações", "Logout"                                                         |
| RF-003-12 | Logout deve invalidar sessão e redirecionar para /login                                                                                   |
| RF-003-13 | Breadcrumb deve refletir a rota atual (ex: Home > Aplicações > Categoria)                                                                 |
| RF-003-14 | Breadcrumb deve ser clicável para navegação (exceto última parte)                                                                         |
| RF-003-15 | Keyboard shortcut Cmd/Ctrl+K deve abrir search overlay                                                                                    |
| RF-003-16 | Mobile (< 768px) deve substituir sidebar por bottom navigation                                                                            |
| RF-003-17 | Layout deve ser responsivo sem quebra visual em 320px, 768px, 1200px                                                                      |
| RF-003-18 | Color scheme deve seguir Design System Cateno (teal, neutral, etc)                                                                        |
| RF-003-19 | Animações de transição devem ser suaves (150-200ms)                                                                                       |
| RF-003-20 | ARIA labels em botões, links, regions e live areas                                                                                        |

## 4. Requisitos Não-Funcionais

| ID         | Categoria           | Descrição                                                                                                                              |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-003-01 | Performance         | Layout deve renderizar em < 100ms após load, sem layout shifts                                                                         |
| RNF-003-02 | Performance         | Sidebar collapse/expand deve ser instantâneo (< 50ms)                                                                                  |
| RNF-003-03 | Acessibilidade      | Conformidade WCAG 2.1 AA em navegação, focus management                                                                                |
| RNF-003-04 | Acessibilidade      | Skip link para conteúdo principal (< 10px de topo)                                                                                     |
| RNF-003-05 | Acessibilidade      | Cores devem ter contrast ratio >= 4.5:1 (texto), 3:1 (ícones)                                                                          |
| RNF-003-06 | SEO                 | Heading hierarchy correto (h1 único por página, h2+ aninhados)                                                                         |
| RNF-003-07 | Responsividade      | Mobile-first approach, breakpoints 640px, 768px, 1024px, 1280px                                                                        |
| RNF-003-08 | Manutenibilidade    | Componentes de navegação em `src/components/features/navigation/`, layout wrapper em `src/components/layouts/`                         |
| RNF-003-09 | DX                  | Layout deve suportar fácil adição/remoção de itens de navegação (config tipada com interface `NavItem`, pronta para migrar para banco) |
| RNF-003-10 | Internacionalização | Strings em i18n (futuro), estrutura pronta                                                                                             |

## 5. Interface / UX

### Header (64px, fixed, white, shadow-sm)

**Layout Grid:**

```
[Logo 32px] [Breadcrumb flex] [View Toggle] [Search] [Notifications] [Avatar] [12px margin]
```

**Logo Cateno:**

- `<CatenoLogo size="sm" variant="dark" />` (versão escura sobre header branco)
- Clickable → /aplicacoes (home do portal)
- Tooltip "Portal Cateno"
- Cores reais: ondas #00AAB5 + texto teal

**Breadcrumb:**

- Texto neutral-500, small (12px)
- Separadores "/" em neutral-300
- Último item em neutral-900 (não clicável)
- Exemplo: "Home / Aplicações / Cartões"

**View Toggle (Aplicações / CatIA):**

- Dois botões lado a lado
- Background neutral-100, border neutral-200
- Ativo: background teal-600, text white
- Labels: "Aplicações" | "CatIA"
- onClick → muda view (implementado em PC-SPEC-004 e 005)

**Search Input:**

- Width 200px (xl: 280px), height 36px
- Placeholder "Buscar aplicações... (⌘K)"
- Border neutral-200, focus border teal-600
- Ícone magnifier left, ⌘K text right
- Click → abre search overlay (futuro PC-SPEC-007)

**Notification Bell:**

- Ícone 20x20px, color neutral-600
- Badge no topo-direito com número (red-500)
- Hover → tooltip "Notificações"
- Click → abre dropdown com notificações (futuro)

**User Avatar:**

- Circular 36x36px, background teal-600
- Texto branco, bold, 14px (iniciais do nome)
- Cursor pointer, click → dropdown
- **Dropdown Menu:**
  - Header: Nome (bold) + Email (neutral-500)
  - Divider
  - Link "Meu Perfil" (icon + text)
  - Link "Configurações" (icon + text)
  - Divider
  - Button "Logout" (text-red-600, icon)
  - Positioned: top-60px, right-0, width 240px, shadow-lg

### Sidebar (fixed, 240px expanded / 64px collapsed)

**States:**

- **Expanded (240px):**
  - Background: white
  - Border-right: neutral-200
  - Padding: 16px top, 12px left/right
  - Smooth transition: width 150ms ease-out

- **Collapsed (64px):**
  - Icons only, centered
  - No labels visible
  - Tooltip on hover (neutral-900, 300ms delay)

**Navigation Items:**

- **Structure per item:**
  ```
  [Icon 20px] [Label 14px flex-1] [Badge optional]
  ```
- **Height:** 40px, padding 8px
- **Border-radius:** 8px
- **States:**
  - **Inactive:**
    - Icon: neutral-500
    - Label: neutral-600
    - Hover: background neutral-50, border-left neutral-200
  - **Active:**
    - Icon: teal-600
    - Label: teal-600 bold
    - Background: teal-50
    - Border-left: 3px solid teal-600

**Items de Navegação Secundária (sidebar):**

> Nota: "Aplicações" e "CatIA" são acessados via View Toggle no header, **não** aparecem como itens da sidebar.

1. Início (icon: home) — /inicio — visão resumida do portal
2. Favoritos (icon: star) — atalho que ativa filtro "favoritos" na Visão Cards (/aplicacoes?filtro=favoritos)
3. Suporte (icon: question-circle) — /suporte
4. Admin Panel (icon: settings) — /admin — apenas se role=admin

**Footer (opcional dentro sidebar):**

- Divider top: neutral-100
- Padding: 12px
- Version text: neutral-400 small
- Example: "v1.0.0-beta"

### Breadcrumb Component

**Props:**

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string; // se undefined, item não é clicável
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

**Rendering:**

```
Home / Aplicações / Cartões / Detalhes
```

- Todas clicáveis exceto última
- Cores: neutral-500 paths, neutral-900 atual
- Separador "/" em neutral-300

### Mobile Behavior (< 768px)

- Header permanece igual (64px)
- Sidebar collapsa para overlay drawer
  - Trigger: hamburger no header
  - Overlay: full-height, z-50, backdrop-blur
  - Close: click outside ou X button
  - Transition: slide-in from left 200ms
- Bottom navigation: barra 56px fixa no bottom
  - 4 ícones principais (Início, Favoritos, Suporte, Menu)
  - Ativo: icon teal-600 + label small
  - Inactive: icon neutral-500
  - Click on Menu → hamburger menu open

### Desktop Responsive (> 1200px)

- Conteúdo máx-width 1400px, centralizado
- Sidebar + main content flex layout

## 6. Modelo de Dados

Não aplicável (UI/UX pura). Dados vêm de PC-SPEC-002 (user autenticado).

### Navigation Config

```typescript
// src/config/navigation.ts
// URLs: inglês para rotas técnicas, pt-BR para rotas de usuário
// Labels: sempre em pt-BR
// Sidebar: navegação secundária apenas
// View Toggle (Aplicações / CatIA) fica no header
export const sidebarItems = [
  {
    id: 'inicio',
    label: 'Início',
    href: '/inicio',
    icon: 'home',
    roles: ['user', 'admin', 'viewer'],
  },
  {
    id: 'favoritos',
    label: 'Favoritos',
    href: '/aplicacoes?filtro=favoritos', // Atalho para filtro na Visão Cards
    icon: 'star',
    roles: ['user', 'admin'],
  },
  {
    id: 'suporte',
    label: 'Suporte',
    href: '/suporte',
    icon: 'question-circle',
    roles: ['user', 'admin', 'viewer'],
  },
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: 'settings',
    roles: ['admin'],
  },
];

// View modes controlados pelo toggle no header
export type ViewMode = 'aplicacoes' | 'catia';
```

## 7. Cenários de Teste

| ID        | Cenário                   | Entrada                                              | Resultado Esperado                                   |
| --------- | ------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| CT-003-01 | Render layout autenticado | GET /aplicacoes com sessão válida                    | Header + Sidebar + conteúdo renderiza sem erros      |
| CT-003-02 | Sidebar collapse/expand   | Clica hamburger no header                            | Sidebar transiciona 240px↔64px suavemente em <100ms  |
| CT-003-03 | Navegação via sidebar     | Clica "Início" na sidebar                            | Navega para /inicio, item ativo com teal-600         |
| CT-003-04 | View toggle Aplicações    | Clica "Aplicações" toggle header                     | Flag viewMode atualiza, conteúdo muda (se aplicável) |
| CT-003-05 | View toggle CatIA         | Clica "CatIA" toggle header                          | Flag viewMode = "catia", breadcrumb atualiza         |
| CT-003-06 | Breadcrumb clicável       | GET /aplicacoes/cartoes/detalhes, clica "Aplicações" | Navega para /aplicacoes                              |
| CT-003-07 | Breadcrumb dinâmico       | Muda rota, breadcrumb atualiza                       | Items refletem rota atual                            |
| CT-003-08 | User dropdown             | Clica avatar, se fecha ao click fora                 | Dropdown abre/fecha, logout funciona                 |
| CT-003-09 | Logout via menu           | Clica "Logout" no dropdown                           | Sessão invalida, redirect /login                     |
| CT-003-10 | Search shortcut Cmd+K     | Pressiona Cmd+K (Mac) ou Ctrl+K (Win)                | Search overlay abre                                  |
| CT-003-11 | Mobile responsividade     | Resize para 375px (mobile)                           | Bottom nav aparece, sidebar → drawer                 |
| CT-003-12 | Mobile drawer             | Clica hamburger no mobile                            | Drawer abre, overlay escuro, clica fora → fecha      |

## 8. Critérios de Aceite

- [ ] Header renderiza com logo, breadcrumb, view toggle, search, notifications, user menu
- [ ] Logo Cateno clicável → /aplicacoes (home do portal)
- [ ] Sidebar renderiza com itens de navegação, ícones e labels
- [ ] Sidebar colapsável com transição suave (240px ↔ 64px)
- [ ] Ícone hamburger no header permite toggle da sidebar
- [ ] Itens de navegação ativos mostram border-left teal-600 + background teal-50
- [ ] Itens inativos têm cores neutral (ícone neutral-500, label neutral-600)
- [ ] Hover em itens inativos mostra background neutral-50
- [ ] Collapsed sidebar mostra tooltips ao hover com label
- [ ] View toggle "Aplicações / CatIA" funciona, estado persiste via URL ou state
- [ ] Breadcrumb renderiza dinamicamente baseado em rota atual
- [ ] Breadcrumb itens são clicáveis (exceto último)
- [ ] Avatar dropdown renderiza com nome, email, opções, logout
- [ ] Logout invalida sessão e redireciona /login
- [ ] Notification bell renderiza com badge (contar será futuro)
- [ ] Keyboard shortcut Cmd/Ctrl+K funciona (abre search overlay)
- [ ] Mobile (< 768px) renderiza bottom nav com 4-5 itens principais
- [ ] Mobile drawer abre/fecha com hamburger, clica outside → fecha
- [ ] Responsividade testada em 320px, 375px, 768px, 1024px, 1280px
- [ ] Sem layout shift, CLS < 0.1
- [ ] Todos componentes têm ARIA labels, focus management, keyboard nav
- [ ] Skip link para conteúdo principal existe
- [ ] Color contrast >= 4.5:1 (text), >= 3:1 (icons)
- [ ] Todos os 12 cenários de teste CT-003-01 até CT-003-12 passam
- [ ] View toggle "Aplicações / CatIA" presente apenas no header (não na sidebar)
- [ ] Sidebar contém apenas navegação secundária (Início, Favoritos, Suporte, Admin)
- [ ] Favoritos na sidebar redireciona para /aplicacoes?filtro=favoritos (filtro na Visão Cards)
- [ ] URLs em português: /inicio, /aplicacoes, /catia, /suporte, /admin
- [ ] Testes snapshot + comportamento em `__tests__/components/features/navigation/`

## 9. Dependências

- **Depende de:** PC-SPEC-001 (Setup), PC-SPEC-002 (Autenticação — precisa usuário logado)
- **Bloqueante para:** PC-SPEC-004 (Cards), PC-SPEC-005 (CatIA) — ambos usam este layout

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
