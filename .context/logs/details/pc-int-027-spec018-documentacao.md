# PC-INT-027 — SPEC-018: Documentação in-portal /ajuda

| Campo     | Valor                                     |
| --------- | ----------------------------------------- |
| ID        | PC-INT-027                                |
| Início    | 2026-04-05T22:20 -03                      |
| Fim       | 2026-04-05T23:16 -03                      |
| Duração   | ~56 min                                   |
| Branch    | feat/PC-018-documentacao-portal            |
| SPEC      | PC-SPEC-018                               |

## Resumo

Implementação da documentação integrada ao portal em `/ajuda`, com:

- Central de Ajuda com tabs condicionais (admin vê 2 tabs, user vê 1)
- Guia do Usuário: Primeiros Passos, Catálogo, CatIA, FAQ
- Guia do Administrador: Aplicações, Categorias, Permissões, Tool Registry, Monitoramento, Configuração
- Guard de role admin na rota `/ajuda/admin`
- Item "Ajuda" na sidebar com divisor visual
- Link "Ajuda & Documentação" no dropdown do perfil
- DocsSidebar com navegação interna por seção

## Arquivos criados

- `src/app/(app)/ajuda/layout.tsx` — Layout com tabs condicionais
- `src/app/(app)/ajuda/page.tsx` — Redirect para /ajuda/usuario
- `src/app/(app)/ajuda/usuario/page.tsx` — Guia do Usuário
- `src/app/(app)/ajuda/admin/page.tsx` — Guia do Admin (guard admin)
- `src/components/features/ajuda/ajuda-shell.tsx` — Shell com tabs + sidebar
- `src/components/features/ajuda/docs-sidebar.tsx` — Sidebar de navegação interna
- `src/components/features/ajuda/section-heading.tsx` — Heading reutilizável
- `src/components/features/ajuda/callout.tsx` — Callout (info/warning/tip)
- `src/components/features/ajuda/usuario/primeiros-passos.tsx`
- `src/components/features/ajuda/usuario/catalogo.tsx`
- `src/components/features/ajuda/usuario/catia-guia.tsx`
- `src/components/features/ajuda/usuario/faq.tsx`
- `src/components/features/ajuda/admin/aplicacoes.tsx`
- `src/components/features/ajuda/admin/categorias.tsx`
- `src/components/features/ajuda/admin/permissoes.tsx`
- `src/components/features/ajuda/admin/tool-registry.tsx`
- `src/components/features/ajuda/admin/monitoramento.tsx`
- `src/components/features/ajuda/admin/configuracao.tsx`
- `src/mdx-components.tsx` — MDX components file (para uso futuro)

## Arquivos modificados

- `next.config.ts` — Adicionado suporte MDX (pageExtensions + createMDX)
- `src/config/navigation.ts` — Adicionado NavDivider type + item Ajuda + breadcrumb labels
- `src/components/layout/sidebar.tsx` — Suporte a dividers
- `src/components/layout/mobile-drawer.tsx` — Suporte a dividers
- `src/components/layout/user-dropdown.tsx` — Link "Ajuda & Documentação"
- `src/components/layout/mobile-nav.tsx` — (item Ajuda via mobileNavItems atualizado)
- `src/__tests__/lib/navigation.test.ts` — Atualizado para dividers + Ajuda

## Dependências adicionadas

- `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `rehype-highlight`, `@types/mdx`

## Validação

- `tsc --noEmit` — OK
- `npm run lint` — OK
- `vitest run --reporter=verbose` — 37 test files, 241 tests, 0 failures
