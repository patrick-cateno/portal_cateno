# PC-SPEC-025 — Adaptar módulo Reservas ao novo layout PC-024

| Campo            | Valor                                                    |
| ---------------- | -------------------------------------------------------- |
| **ID**           | PC-SPEC-025                                              |
| **Status**       | Backlog                                                  |
| **Prioridade**   | Alta — módulo de Reservas está visualmente fora do padrão |
| **Complexidade** | Média                                                    |
| **Autor**        | Patrick Iarrocheski                                      |
| **Branch**       | feat/PC-025-reservas-layout-pc024                        |
| **Depende de**   | PC-024 (redesign navegação — mergeado)                   |

## 1. Objetivo

Adaptar o módulo de Reservas ao novo padrão de navegação introduzido pelo PC-024
(TopNav com pills + sidebar contextual). Atualmente o módulo tem um layout próprio
que ignora completamente o AppShell do portal.

## 2. Problema atual

### 2.1 Layout isolado

O `src/app/(app)/reservas/layout.tsx` cria um container flex com sidebar fixa,
bypassing o AppShell:

```tsx
// ATUAL — layout próprio
<div style={{ display: 'flex', minHeight: '100%' }}>
  <ReservasSidebar userRoles={userRoles} />
  <main style={{ flex: 1, padding: 24, background: '#F0FDFA' }}>{children}</main>
</div>
```

### 2.2 Não registrado na navegação

O arquivo `src/config/navigation.ts` não inclui `/reservas` em:
- `portalRoutes` — Reservas não é reconhecido como rota do portal
- `portalNavItems` — não aparece nas pills do TopNav
- `sidebarNavItems` — não aparece na sidebar principal
- `mobileNavItems` — não aparece na nav mobile

### 2.3 Sidebar com inline styles

O `reservas-sidebar.tsx` usa 100% inline styles com valores hardcoded:
- `width: 240` fixo
- Cores hardcoded (`#0D9488`, `#FFFFFF`, `#E2E8F0`, etc.)
- Não respeita `useLayout()` (collapse/expand da sidebar)
- Não tem responsividade mobile

## 3. Solução proposta

### 3.1 Registrar Reservas na navegação

Adicionar em `src/config/navigation.ts`:

```typescript
// portalNavItems — adicionar pill
{ label: 'Reservas', href: '/reservas', icon: 'CalendarCheck' }

// portalRoutes — reconhecer como portal mode
'/reservas'

// sidebarNavItems — adicionar na sidebar principal
{ label: 'Reservas', href: '/reservas', icon: 'CalendarCheck', roles: ['user', 'admin'] }

// mobileNavItems — adicionar na nav mobile
{ label: 'Reservas', href: '/reservas', icon: 'CalendarCheck' }

// breadcrumbLabels — já existem (ok)
```

### 3.2 Remover layout custom

Simplificar `src/app/(app)/reservas/layout.tsx` para herdar o AppShell:

```tsx
// NOVO — herda AppShell, sem layout próprio
export default async function ReservasLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <>{children}</>;
}
```

A autenticação já é feita pelo layout pai `(app)/layout.tsx`. Se a verificação
de roles for necessária para admin, mantê-la apenas nas rotas admin.

### 3.3 Refatorar sidebar para contextual

Converter `reservas-sidebar.tsx` de sidebar fixa para sidebar contextual
integrada ao padrão do portal:

**Opção A (recomendada):** Usar o padrão do AppShell — quando o pathname começa
com `/reservas`, o AppShell renderiza a sidebar de Reservas no slot contextual.

**Opção B:** Sidebar interna no conteúdo (como o módulo Ajuda) — tabs no topo
para "Minhas Reservas" e "Administração", sem sidebar dedicada.

Independente da opção:
- Usar tokens de `src/tokens.ts` em vez de valores hardcoded
- Respeitar `useLayout()` para collapse/expand
- Suportar mobile (drawer ou tabs)

### 3.4 Manter funcionalidade intacta

A refatoração é **apenas de layout/navegação**. Nenhuma funcionalidade muda:
- Mesmas páginas: minhas-estacoes, minhas-salas, nova-reserva, admin/*
- Mesma lógica de roles (admin vs user)
- Mesmos componentes internos (cards, modals, forms)
- Mesma API layer (`_lib/`)

## 4. Arquivos afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/config/navigation.ts` | Adicionar Reservas em 4 arrays |
| `src/app/(app)/reservas/layout.tsx` | Simplificar — remover layout custom |
| `src/app/(app)/reservas/_components/reservas-sidebar.tsx` | Refatorar para contextual + tokens |
| `src/components/layout/app-shell.tsx` | Possivelmente adicionar slot para sidebar contextual |

## 5. Critérios de aceite

- [ ] Reservas aparece como pill na TopNav
- [ ] Reservas aparece na sidebar principal (desktop)
- [ ] Reservas aparece na nav mobile
- [ ] Breadcrumbs funcionam para todas as rotas de Reservas
- [ ] Sidebar de Reservas (Minhas Reservas + Administração) funciona como contextual
- [ ] Sidebar respeita collapse/expand do `useLayout()`
- [ ] Layout responsivo — funciona em mobile
- [ ] Nenhum inline style com valor hardcoded (tudo via tokens)
- [ ] Nenhuma funcionalidade quebrada (mesmas páginas, mesma lógica)
- [ ] Testes passando: `npx tsc --noEmit && npx vitest run`

## 6. Cenários de teste

### T1 — Navegação via pills
1. Acessar portal
2. Clicar na pill "Reservas" no TopNav
3. Deve abrir `/reservas/minhas-estacoes`
4. Pill "Reservas" deve estar ativa (highlight)

### T2 — Sidebar contextual
1. Estar em `/reservas/minhas-estacoes`
2. Sidebar deve mostrar itens de Reservas (não a sidebar principal do portal)
3. Clicar em "Minhas Salas" na sidebar
4. Deve navegar para `/reservas/minhas-salas`
5. Item deve ficar ativo (background teal)

### T3 — Sidebar admin
1. Logar com role `admin` ou `reservas:admin`
2. Acessar `/reservas`
3. Sidebar deve mostrar grupo "Administração" além de "Minhas Reservas"
4. Usuário sem role admin não vê grupo "Administração"

### T4 — Mobile
1. Acessar portal em viewport mobile (< 768px)
2. "Reservas" deve aparecer na nav inferior
3. Ao acessar reservas, navegação interna deve funcionar (drawer ou tabs)

### T5 — Breadcrumb
1. Acessar `/reservas/admin/escritorios`
2. Breadcrumb deve mostrar: Reservas > Administração > Escritórios
3. Clicar em "Reservas" no breadcrumb volta para `/reservas`

### T6 — Regressão
1. Todas as páginas de reservas continuam funcionando:
   - `/reservas/minhas-estacoes`
   - `/reservas/minhas-salas`
   - `/reservas/nova-reserva/estacao`
   - `/reservas/nova-reserva/sala`
   - `/reservas/admin/escritorios`
   - `/reservas/admin/salas`
   - `/reservas/admin/estacoes`
   - `/reservas/admin/feriados`
2. CRUD de todas as entidades funciona normalmente

## 7. Considerações de Segurança

- Não expor rotas admin na sidebar para usuários sem role adequado (já implementado)
- Manter verificação de roles server-side no layout admin (não confiar no frontend)
- Não introduzir decisões de autorização no frontend — apenas controle de visibilidade da sidebar
