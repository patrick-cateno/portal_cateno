# PC-INT-020 — SPEC-006: Design System Tokens e Componentes

| Campo          | Valor                            |
| -------------- | -------------------------------- |
| **ID**         | PC-INT-020                       |
| **Início**     | 2026-04-03T16:47 -03             |
| **Fim**        | 2026-04-03T17:02 -03             |
| **Duração**    | ≈15 min                          |
| **Branch**     | feat/PC-006-design-system-tokens |
| **Tokens in**  | ≈1.100                           |
| **Tokens out** | ≈8.200                           |

## Contexto

Retomada da sessão anterior. Patrick havia confirmado "sim" para iniciar a SPEC-006.
Sessão nova — contexto resumido pelo sistema.

## O que foi feito

1. **Branch criada**: `feat/PC-006-design-system-tokens` a partir de `feat/PC-001-projeto-setup`
2. **`src/styles/design-tokens.css`** — Reescrito com CSS custom properties completas:
   - Primary teal (50–900), neutral (50–900), lime (50–600)
   - Semantic colors, status colors, surface/border tokens
   - Typography: font-family, 9 font-size levels, line-heights, letter-spacings
   - Spacing (base 4px, 15 steps), border-radius (xs–full), shadows (sm, md, lg, xl, glow, card)
   - Layout vars: sidebar-width, sidebar-collapsed, header-height
   - Dark mode prep: @media (prefers-color-scheme: dark) com vars prontas
3. **`src/app/globals.css`** — Reescrito com `@theme inline` completo (Tailwind 4):
   - Mapeia todos os tokens CSS vars para classes Tailwind utilitárias
   - Base styles: body font, anti-aliasing, box-sizing, :focus-visible (teal ring)
4. **`src/components/ui/CatenoLogo.tsx`** — Server Component com SVG real:
   - Props: `size` (sm/md/lg), `variant` (white/dark), `className`
   - Ondas sempre `#00AAB5`, texto/detalhes parametrizados por variant
   - ARIA: `role="img"`, `aria-label="Logo Cateno"`
5. **`src/components/ui/button.tsx`** — CVA variants: primary (teal-600), secondary, ghost, destructive, outline, link; sizes: sm/md/lg/icon
6. **`src/components/ui/input.tsx`** — Estados: default, focus (teal), error (red/aria-invalid), disabled; label, helperText, size props
7. **`src/components/ui/card.tsx`** — padding/border/shadow configuráveis via CVA; subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
8. **`src/components/ui/badge.tsx`** — Variants: online (lime), maintenance (amber), offline (red), primary, neutral, info; dot indicator; sizes sm/md/lg
9. **`src/components/ui/toggle.tsx`** — Client component; on (primary-600) / off (neutral-200); controlled + uncontrolled; label; disabled
10. **`src/components/ui/tabs.tsx`** — Client component; underline active indicator (primary-600); onValueChange; disabled tab support; TabsContent
11. **`src/components/ui/checkbox.tsx`** — Client component; checked/unchecked/indeterminate; controlled + uncontrolled; teal checked state; label; helperText
12. **`src/components/ui/index.ts`** — Barrel export de todos os componentes
13. **Testes** — 69 testes criados em `src/__tests__/components/ui/`, todos passando:
    - Button (10), Checkbox (9), Input (9), Tabs (8), Card (9), Toggle (9), CatenoLogo (6), Badge (9)
14. **Fixes colaterais**: `package.json`, `tsconfig.json`, `vitest.config.ts` estavam truncados — corrigidos

## Problemas encontrados

- **Arquivos truncados (`package.json`, `tsconfig.json`, `vitest.config.ts`)**: vitest falhava com "Unterminated string literal". Cause: truncação do contexto anterior. Corrigidos com Write/Edit.
- **`@testing-library/user-event` não instalado**: Testes reescritos com `fireEvent` do `@testing-library/react` que já estava disponível.
- **Sandbox lento**: Cada processo `vitest run` demora ~30s só para iniciar. Testes executados em grupos de arquivos por exec para maximizar o que cabia no timeout.

## Arquivos criados/modificados

| Arquivo | Ação |
| --- | --- |
| `src/styles/design-tokens.css` | Reescrito completo |
| `src/app/globals.css` | Reescrito com @theme inline |
| `src/components/ui/CatenoLogo.tsx` | Criado |
| `src/components/ui/button.tsx` | Criado |
| `src/components/ui/input.tsx` | Criado |
| `src/components/ui/card.tsx` | Criado |
| `src/components/ui/badge.tsx` | Criado |
| `src/components/ui/toggle.tsx` | Criado |
| `src/components/ui/tabs.tsx` | Criado |
| `src/components/ui/checkbox.tsx` | Criado |
| `src/components/ui/index.ts` | Criado |
| `src/__tests__/components/ui/*.test.tsx` | 7 arquivos criados (69 testes) |
| `package.json` | Fix truncation |
| `tsconfig.json` | Fix truncation |
| `vitest.config.ts` | Fix truncation |
