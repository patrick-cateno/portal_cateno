# PC-SPEC-004 — Visão de Cards de Aplicações

| Campo            | Valor                   |
| ---------------- | ----------------------- |
| **ID**           | PC-SPEC-004             |
| **Status**       | Done                    |
| **Prioridade**   | Alta                    |
| **Complexidade** | Média                   |
| **Criado em**    | 2026-04-03              |
| **Autor**        | Patrick Iarrocheski     |
| **Branch**       | feat/PC-004-visao-cards |

## 1. Objetivo

Implementar a tela principal de Aplicações com grid de cards, filtros, busca em tempo real, sistema de favoritos e ordenação. Exibir todas as aplicações disponíveis ao usuário com base em permissões (RBAC), permitindo exploração rápida e intuitiva.

## 2. Escopo

### 2.1 Incluído

- Grid responsivo de cards de aplicações (auto-fill, minmax 320px)
- Card component com: ícone, título, descrição, status (online/maintenance/offline), contagem de usuários, trend (percentual)
- Barra de busca com filtro em tempo real (search by name + description)
- Filter chips por categoria — categorias parametrizáveis via banco (model Category, CRUD admin)
- Sistema de favoritos: star toggle por card, persisted per user no banco
- Filter "Mostrar apenas favoritos"
- Opções de ordenação: Por Nome (A-Z), Por Usuários (mais usado), Por Trend (mais popular)
- Hover effects: border teal-300, shadow elevado, top accent bar teal, botão "Abrir"
- Exibição de contagem total de aplicações
- Empty state: ícone + mensagem quando nenhum resultado
- RBAC: mostrar apenas apps que o usuário tem permissão de acessar
- Loading skeleton durante fetch
- Error state com retry
- Integração com Prisma (query filtered by user roles)
- Debounce de 300ms na busca para não sobrecarregar

### 2.2 Excluído

- Modal de detalhes da aplicação (será PC-SPEC-007)
- Configuração de aplicações (será admin panel)
- Analytics de uso (será futuro)
- Integração real com apps (será futuro)
- Export de lista de apps

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RF-004-01 | Cards devem exibir: ícone, título, descrição (2 linhas max), status badge, contagem de usuários, trend                                                                                                                   |
| RF-004-02 | Busca deve filtrar por nome e descrição da aplicação em tempo real (debounce 300ms)                                                                                                                                      |
| RF-004-03 | Category filter chips devem ser carregados do banco (model Category, ordenados por `order`), apenas uma categoria ativa por vez                                                                                          |
| RF-004-04 | Filter "Mostrar apenas favoritos" deve ser toggle, filtrar cards já marcados                                                                                                                                             |
| RF-004-05 | Star toggle em cada card deve marcar/desmarcar como favorito, persistir no banco                                                                                                                                         |
| RF-004-06 | Favoritar deve ser instantâneo no UI, async no banco                                                                                                                                                                     |
| RF-004-07 | Grid deve ser responsivo: 1 coluna (mobile), 2 (tablet), 3-4 (desktop)                                                                                                                                                   |
| RF-004-08 | Card hover deve mostrar border teal, shadow elevado, bar teal no topo, botão "Abrir"                                                                                                                                     |
| RF-004-09 | Ordenação deve ter 3 opções: Nome (default), Usuários, Trend                                                                                                                                                             |
| RF-004-10 | Contagem total deve atualizar conforme filtros (ex: "12 de 47 aplicações")                                                                                                                                               |
| RF-004-11 | Empty state deve aparecer quando nenhum resultado (busca/filtro)                                                                                                                                                         |
| RF-004-12 | Status badge deve indicar: online (green), maintenance (yellow), offline (gray)                                                                                                                                          |
| RF-004-13 | Trend deve ser calculado e exibido com seta (↑ green, ↓ red, = gray)                                                                                                                                                     |
| RF-004-14 | RBAC deve filtrar aplicações diretamente na query Prisma (where clause), nunca expor dados não autorizados ao cliente. MVP: admin/user veem todas, viewer tem restrição fixa. Futuro: restrições configuráveis por admin |
| RF-004-15 | Loading state deve mostrar skeleton 6 cards enquanto carregando                                                                                                                                                          |
| RF-004-16 | Error state deve mostrar mensagem + botão "Tentar novamente"                                                                                                                                                             |
| RF-004-17 | Clique em card ou botão "Abrir" deve navegar para detalhes (quando implementado)                                                                                                                                         |
| RF-004-18 | State de filtros deve ser sincronizado com URL query params (compartilhável)                                                                                                                                             |
| RF-004-19 | Página deve ler query param `?filtro=favoritos` no load e ativar toggle de favoritos automaticamente (integração com sidebar SPEC-003)                                                                                   |
| RF-004-20 | Server Actions de favorito devem obter userId da session no servidor (await auth()), nunca aceitar userId como parâmetro do cliente                                                                                      |
| RF-004-21 | Admin deve poder criar, editar, reordenar e excluir categorias via painel admin (CRUD completo no model Category)                                                                                                        |
| RF-004-22 | Seed inicial deve popular as categorias padrão: Cartões, Financeiro, Operações, Compliance, Analytics, Infraestrutura                                                                                                    |

## 4. Requisitos Não-Funcionais

| ID         | Categoria        | Descrição                                                    |
| ---------- | ---------------- | ------------------------------------------------------------ |
| RNF-004-01 | Performance      | Busca debounce 300ms, não fazer request a cada keystroke     |
| RNF-004-02 | Performance      | Grid deve render 100+ cards sem quebra de performance        |
| RNF-004-03 | Performance      | Favoritar deve ser otimista (atualizar UI antes de salvar)   |
| RNF-004-04 | Acessibilidade   | Cada card deve ter role=article, heading h3, skip links      |
| RNF-004-05 | Acessibilidade   | Teclado navegável entre cards (Tab), Enter para abrir        |
| RNF-004-06 | Acessibilidade   | Color accessibility para status badges (não só cor)          |
| RNF-004-07 | SEO              | Heading hierarchy correto (h1, h2 para seções)               |
| RNF-004-08 | UX               | Estados (loading, error, empty) devem ser claros visualmente |
| RNF-004-09 | Escalabilidade   | Arquitetura deve suportar 1000+ aplicações sem refactor      |
| RNF-004-10 | Manutenibilidade | Cards componentizados, reutilizável                          |

## 5. Interface / UX

### Layout Page

```
┌────────────────────────────────────────────────────────────┐
│ Header (PC-SPEC-003)                                       │
├─────────────────────────────────────────────────────────┬──┤
│ Sidebar                        │ Main Content           │  │
│                                ├────────────────────────┤  │
│                                │ H1 "Aplicações"        │  │
│                                │ [Search] [Sort▼]       │  │
│                                │                        │  │
│                                │ [Category Chips]       │  │
│                                │ [☆ Favoritos] [Count]  │  │
│                                │                        │  │
│                                │ [Card] [Card] [Card]   │  │
│                                │ [Card] [Card] [Card]   │  │
│                                │ [Card] [Card] [Card]   │  │
│                                │                        │  │
└────────────────────────────────────────────────────────────┘
```

### Toolbar Section (sticky, top 64px fixed)

**Height:** 120px (responsivo)

```
Row 1: H1 "Aplicações" (left)
Row 2: [Search input] [Sort dropdown] (right)
Row 3: [Category chips...] [★ Favoritos toggle] [Count text] (left)
```

**Search Input:**

- Width: 320px (md), 100% (mobile)
- Placeholder: "Buscar aplicações..."
- Ícone: magnifier left
- Clear button (X) aparece se há texto
- Debounce: 300ms após último keystroke
- Focus: border-color teal-600

**Sort Dropdown:**

- Label: "Ordenar por"
- Options:
  - Nome (A-Z) [default]
  - Usuários (mais usado)
  - Trend (mais popular)
- Icon: arrow-up-down

**Category Chips:**

- Horizontal scroll em mobile
- Carregados do banco (model Category, ordenados por `order`). Chip "Todas" é sempre o primeiro (hardcoded)
- Seed inicial: Cartões, Financeiro, Operações, Compliance, Analytics, Infraestrutura
- CRUD de categorias via painel admin (futuro: SPEC admin)
- Active: background teal-600, color white
- Inactive: background neutral-100, color neutral-600
- Border-radius: 20px
- Height: 32px

**Favoritos Toggle:**

- Ícone star outline
- Label: "Favoritos"
- Toggle state: background teal-100 (on) / neutral-100 (off)
- Text on: "Mostrar apenas favoritos"

**Count Text:**

- Format: "{filtered} de {total} aplicações"
- Color: neutral-500
- Example: "12 de 47 aplicações"

### Application Card

**Dimensions:**

- Width: 320px (minmax)
- Height: auto (~280px típico)
- Border: 1px neutral-200
- Border-radius: 12px
- Padding: 16px
- Shadow: sm
- Background: white

**Card Sections:**

```
┌─────────────────────────────────┐
│ ▲ [Accent bar - teal-600, 3px]  │ (top on hover)
├─────────────────────────────────┤
│ [Icon 40x40]  [Title H3]    [★] │
│               [Category]        │
├─────────────────────────────────┤
│ [Description - 2 lines, wrap]   │
│                                 │
├─────────────────────────────────┤
│ [Status Badge] [Users] [Trend]  │
├─────────────────────────────────┤
│ Hover:      [→ Abrir]           │
└─────────────────────────────────┘
```

**Elements:**

1. **Icon** (top-left)
   - 40x40px, border-radius 8px
   - Can be SVG data URL or image
   - Background: brand color of app (if available)
   - Fallback: teal-50 with first letter

2. **Title** (h3)
   - Font-weight: 600
   - Font-size: 16px
   - Color: neutral-900
   - Line-height: 1.4

3. **Star Toggle** (top-right)
   - Icon: star outline (24px)
   - Color: neutral-400
   - On click: toggle, animate
   - On favorited: icon: star filled, color teal-600

4. **Category Badge** (under title)
   - Small text, 12px
   - Color: teal-600
   - Example: "Financeiro"

5. **Description**
   - Font-size: 14px
   - Color: neutral-600
   - Max 2 lines, text-overflow ellipsis
   - Margin top: 8px

6. **Status Badge**
   - Inline badge
   - Options:
     - "Online" → bg-green-50, text-green-700, icon ●
     - "Maintenance" → bg-yellow-50, text-yellow-700, icon ⚠
     - "Offline" → bg-gray-50, text-gray-700, icon ✕
   - Font-size: 12px, padding 4px 8px

7. **User Count**
   - Icon: people/users
   - Text: "{n} usuários"
   - Color: neutral-500, 12px
   - Example: "2.3k usuários"

8. **Trend**
   - Icon: trending-up/down/straight
   - Text: "{+/-}n%"
   - Color: green-600 (up), red-600 (down), neutral-500 (flat)
   - Font-size: 12px
   - Example: "+12%"

**Card States:**

- **Default:**
  - Border: neutral-200
  - Shadow: sm
  - Cursor: pointer

- **Hover:**
  - Border: teal-300
  - Shadow: md (elevado)
  - Top accent bar: 3px teal-600 (appear)
  - CTA button: "→ Abrir" (teal-600 text)
  - Transition: 150ms ease-out

- **Favorited:**
  - Star: filled teal-600
  - No visual change to card itself

- **Focus (keyboard):**
  - Outline: 2px teal-600
  - Outline-offset: 2px

### Empty State

**Cenários:**

1. Sem resultados de busca
2. Sem apps na categoria
3. Sem apps como favoritos

**Layout:**

```
┌─────────────────────┐
│   [Icon 64x64]      │
│  "Nenhum resultado" │
│  "Tente outra..."   │
│  [Limpar filtros]   │
└─────────────────────┘
```

- Centered, padding 60px top/bottom
- Icon: search / filter / star (gray)
- Heading: neutral-900, 18px
- Subtext: neutral-600, 14px
- Button: "Limpar filtros" → reset search/filters/favorites toggle

### Loading Skeleton

- 6 cards em grid
- Each card: gradient shimmer animation
- Duration: 2s loop
- Opacity fade in/out

### Error State

```
┌──────────────────────────┐
│ [Error icon]             │
│ "Erro ao carregar apps"  │
│ [Tentar novamente]       │
└──────────────────────────┘
```

- Centered
- Error icon: red-500
- Message: neutral-900
- Button: red-600 "Tentar novamente"

## 6. Modelo de Dados

### Query Prisma (filtrada por RBAC)

```typescript
// src/app/(app)/aplicacoes/page.tsx
export default async function AplicacoesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Buscar roles do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true }
  })

  // Query aplicações com RBAC direto na query Prisma (nunca expor dados não autorizados)
  const userRoles = user?.roles.map(r => r.name) || []
  const isAdmin = userRoles.includes('admin')
  const isViewer = userRoles.includes('viewer')

  const apps = await prisma.application.findMany({
    where: isAdmin || userRoles.includes('user')
      ? {} // admin e user veem todas
      : isViewer
        ? { category: { in: ['Financeiro', 'Analytics'] } } // viewer: categorias restritas
        : { id: 'none' }, // sem role: nenhuma app
    orderBy: { name: 'asc' }
  })

  // Buscar favoritos do usuário
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id }
  })

  return (
    <AplicacoesView
      initialApps={apps}
      initialFavorites={favorites}
      // SEGURANÇA: userId NÃO é passado ao client. Server Actions obtêm da session.
    />
  )
}
```

### Client Component State

```typescript
// src/components/features/aplicacoes/AplicacoesView.tsx
'use client'

interface AplicacoesViewProps {
  initialApps: Application[]
  initialFavorites: Favorite[]
  // SEGURANÇA: userId NÃO é prop. Server Actions obtêm da session.
}

export default function AplicacoesView({
  initialApps,
  initialFavorites,
}: AplicacoesViewProps) {
  const [apps, setApps] = useState(initialApps)
  const [favorites, setFavorites] = useState(
    new Set(initialFavorites.map(f => f.applicationId))
  )
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [sortBy, setSortBy] = useState('name')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearch(query)
    }, 300),
    []
  )

  // Filter & sort logic
  const filtered = apps
    .filter(app => {
      const matchesSearch =
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        category === 'Todas' || app.category === category
      const matchesFavorites =
        !showFavoritesOnly || favorites.has(app.id)

      return matchesSearch && matchesCategory && matchesFavorites
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'users') {
        return b.userCount - a.userCount
      }
      if (sortBy === 'trend') {
        return b.trend - a.trend
      }
      return 0
    })

  const handleToggleFavorite = async (appId: string) => {
    const isFavorited = favorites.has(appId)

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev)
      if (isFavorited) {
        next.delete(appId)
      } else {
        next.add(appId)
      }
      return next
    })

    // Server Action — SEGURANÇA: userId obtido da session no servidor, não do cliente
    try {
      await toggleFavorite(appId)  // Server Action obtém userId via await auth()
    } catch (error) {
      // Revert optimistic
      setFavorites(prev => {
        const next = new Set(prev)
        if (isFavorited) {
          next.add(appId)
        } else {
          next.delete(appId)
        }
        return next
      })
      console.error('Failed to toggle favorite', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-16 bg-white z-40">
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Buscar aplicações..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 max-w-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2"
          >
            <option value="name">Nome (A-Z)</option>
            <option value="users">Usuários (mais usado)</option>
            <option value="trend">Trend (popular)</option>
          </select>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {['Todas', 'Cartões', 'Financeiro', 'Operações', 'Compliance', 'Analytics'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                category === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              showFavoritesOnly
                ? 'bg-teal-100 text-teal-600'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            ★ {showFavoritesOnly ? 'Mostrando' : 'Mostrar'} apenas favoritos
          </button>
          <span className="text-neutral-500 text-sm">
            {filtered.length} de {apps.length} aplicações
          </span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState onReset={() => {
          setSearch('')
          setCategory('Todas')
          setShowFavoritesOnly(false)
        }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              isFavorited={favorites.has(app.id)}
              onToggleFavorite={() => handleToggleFavorite(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

## 7. Cenários de Teste

| ID        | Cenário               | Entrada                     | Resultado Esperado                                     |
| --------- | --------------------- | --------------------------- | ------------------------------------------------------ |
| CT-004-01 | Load page /aplicacoes | GET /aplicacoes com session | Todos os cards renderizam, loading skeleton desaparece |
| CT-004-02 | Busca em tempo real   | Type "cartão" na search     | Cards filtrados em tempo real, contagem atualiza       |
| CT-004-03 | Debounce busca        | Type 5 chars rápido         | Apenas 1 request de filtro após 300ms final            |
| CT-004-04 | Filter categoria      | Clica "Financeiro" chip     | Apenas apps categoria=Financeiro mostram               |
| CT-004-05 | Toggle favorito       | Clica star em card          | Star vira filled teal-600, card persiste em DB         |
| CT-004-06 | Filter favoritos      | Clica "★ Favoritos toggle"  | Apenas cards favoritos mostram                         |
| CT-004-07 | Ordenar por Nome      | Select "Nome (A-Z)"         | Cards ordenados alfabeticamente                        |
| CT-004-08 | Ordenar por Usuários  | Select "Usuários"           | Cards ordenados decrescente por userCount              |
| CT-004-09 | Ordenar por Trend     | Select "Trend"              | Cards ordenados decrescente por trend                  |
| CT-004-10 | Empty state           | Busca "xyz" sem match       | Empty state com ícone + "Nenhum resultado"             |

## 8. Critérios de Aceite

- [ ] Grid renderiza com cards responsivos (1/2/3/4 colunas conforme screen)
- [ ] Cada card exibe: ícone, título, categoria, descrição 2 linhas, status badge, usuários, trend
- [ ] Search input funciona, debounce 300ms, filtra por nome + descrição
- [ ] Category chips: Todas, Cartões, Financeiro, Operações, Compliance, Analytics, Infraestrutura
- [ ] Apenas 1 categoria ativa por vez, visual feedback (teal-600 vs neutral-100)
- [ ] ★ Favoritos toggle filtra cards, label muda "Mostrar apenas favoritos"
- [ ] Star toggle em card marca/desmarca favorito, UI instantânea, persist async
- [ ] Sort dropdown com 3 opções: Nome (default), Usuários, Trend
- [ ] Contagem total "X de Y aplicações" atualiza com filtros
- [ ] Card hover: border teal-300, shadow elevado, top accent bar, "→ Abrir" CTA
- [ ] Status badge: online (green), maintenance (yellow), offline (gray) com ícone
- [ ] Trend: seta + % colorido (green up, red down, gray flat)
- [ ] RBAC: usuário "viewer" vê apenas Financeiro/Analytics (se configurado)
- [ ] Loading skeleton 6 cards durante fetch, com shimmer animation
- [ ] Error state exibe mensagem + "Tentar novamente", retry funciona
- [ ] Empty state: ícone + mensagem + "Limpar filtros" (reseta todos filtros)
- [ ] Teclado navegável: Tab entre cards, Enter para abrir
- [ ] ARIA labels: role=article, h3 titles, skip links
- [ ] Color contrast >= 4.5:1 (status badges com ícone, não só cor)
- [ ] Responsive testado 320px, 375px, 768px, 1024px, 1280px
- [ ] URL query params sincronizam filtros (compartilhável: ?search=x&category=y&sort=z&filtro=favoritos)
- [ ] Query param `?filtro=favoritos` (vindo da sidebar) ativa toggle de favoritos automaticamente
- [ ] Server Actions de favorito obtêm userId da session, nunca do cliente (segurança)
- [ ] RBAC MVP: admin/user veem todas as apps, viewer tem restrição fixa (futuro: configurável)
- [ ] Todos os 10 cenários de teste CT-004-01 até CT-004-10 passam
- [ ] Testes unitários em `__tests__/components/features/aplicacoes/`

## 9. Dependências

- **Depende de:** PC-SPEC-001 (Setup), PC-SPEC-002 (Autenticação), PC-SPEC-003 (Layout)
- **Bloqueante para:** PC-SPEC-007 (Modal de detalhes será aberto ao clicar card)

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
