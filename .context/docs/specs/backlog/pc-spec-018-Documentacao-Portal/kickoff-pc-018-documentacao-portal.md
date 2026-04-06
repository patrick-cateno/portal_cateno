# Kickoff — PC-SPEC-018: Documentação in-portal (Admin + Usuário)

**Agente:** frontend-specialist
**Estimativa:** ~13.5h

## Antes de começar

Leia a spec completa:
```
.context/docs/specs/backlog/pc-018-Documentacao-Portal/pc-spec-018-Documentacao-Portal.md
```

## Passo 1 — Instalar dependências de MDX

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install rehype-highlight
npm install --save-dev @types/mdx
```

Configurar no `next.config.ts`:
```typescript
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [['rehype-highlight', {}]],
  },
});

export default withMDX({
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
});
```

## Passo 2 — Estrutura de rotas

Criar:
```
src/app/(app)/ajuda/
├── layout.tsx
├── page.tsx           → redireciona para /ajuda/usuario
├── usuario/
│   └── page.tsx
└── admin/
    └── page.tsx       → guard requireRole('admin')

src/content/ajuda/
├── usuario/
│   ├── primeiros-passos.mdx
│   ├── catalogo.mdx
│   ├── catia.mdx
│   └── faq.mdx
└── admin/
    ├── aplicacoes.mdx
    ├── categorias.mdx
    ├── permissoes.mdx
    ├── tool-registry.mdx
    ├── monitoramento.mdx
    └── configuracao.mdx
```

## Passo 3 — Layout com tabs condicionais

```tsx
// src/app/(app)/ajuda/layout.tsx
import { auth } from '@/lib/auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AjudaLayout({ children }) {
  const session = await auth();
  const isAdmin = session?.user?.roles?.includes('admin');

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Central de Ajuda</h1>
        <p className="text-neutral-500 mt-2">
          Encontre respostas e guias de utilização do Portal Cateno
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar de navegação interna — ver spec seção 7 */}
        <DocsSidebar isAdmin={isAdmin} />

        {/* Conteúdo MDX */}
        <main className="flex-1 min-w-0 prose prose-neutral max-w-none">
          {isAdmin && (
            <Tabs defaultValue="usuario" className="mb-6">
              <TabsList>
                <TabsTrigger value="usuario" asChild>
                  <Link href="/ajuda/usuario">Guia do Usuário</Link>
                </TabsTrigger>
                <TabsTrigger value="admin" asChild>
                  <Link href="/ajuda/admin">Guia do Administrador</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Passo 4 — Adicionar Ajuda na sidebar principal

Leia `src/config/navigation.ts` (ou onde estão os itens do menu lateral).
Adicionar ao final, após os itens principais, com divisor:

```typescript
// navigation.ts
export const navItems = [
  { label: 'Aplicações', href: '/aplicacoes', icon: 'Grid3X3' },
  { label: 'CatIA', href: '/catia', icon: 'Sparkles' },
  // divisor
  { type: 'divider' },
  { label: 'Ajuda', href: '/ajuda', icon: 'HelpCircle' },
];
```

## Passo 5 — Adicionar link no dropdown do perfil

Localizar o componente de dropdown do avatar (UserMenu ou similar).
Adicionar antes do Logout:

```tsx
<DropdownMenuItem asChild>
  <Link href="/ajuda">
    <HelpCircle size={16} className="mr-2" />
    Ajuda & Documentação
  </Link>
</DropdownMenuItem>
<DropdownMenuSeparator />
<DropdownMenuItem onClick={handleLogout} className="text-red-600">
  Logout
</DropdownMenuItem>
```

## Passo 6 — Escrever conteúdo MDX

Para cada arquivo `.mdx`, escrever o conteúdo conforme as seções 5 e 6 da spec.
Usar componentes shadcn/ui quando adequado (Callout, Alert para dicas/avisos).

Exemplo de estrutura de um arquivo MDX:
```mdx
# Catálogo de Aplicações

O catálogo é a página principal do portal. Aqui você encontra todas as
aplicações disponíveis para o seu perfil.

## Filtrando por categoria

Use os chips de categoria no topo para filtrar as aplicações...

:::tip Dica
Você pode combinar filtro de categoria com busca por nome.
:::

## Marcando favoritos

Clique na estrela ⭐ no canto superior direito de cada card...
```

## Passo 7 — Validação

```bash
# TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Verificar visibilidade por role
# 1. Login como admin → /ajuda deve mostrar duas tabs
# 2. Login como user → /ajuda deve mostrar apenas Guia do Usuário
# 3. /ajuda/admin com role user → redirect para /aplicacoes
```

## Critérios de aceite

- [ ] Item Ajuda na sidebar com divisor acima
- [ ] Link no dropdown do perfil
- [ ] /ajuda redireciona para /ajuda/usuario
- [ ] Admin vê tabs "Guia do Usuário" e "Guia do Administrador"
- [ ] User/viewer vê apenas "Guia do Usuário"
- [ ] /ajuda/admin com role user → redirect
- [ ] Conteúdo MDX completo (todas as seções)
- [ ] Design consistente com tokens Cateno

## Ao finalizar

```bash
git add src/app/(app)/ajuda/ src/content/ajuda/ src/config/navigation.ts
git commit -m "feat: documentacao in-portal — guia usuario e admin em /ajuda"
git push
```

```
workflow-manage({ action: "handoff", from: "frontend-specialist", to: "documentation-writer", artifacts: ["src/app/(app)/ajuda/", "src/content/ajuda/"] })
```
