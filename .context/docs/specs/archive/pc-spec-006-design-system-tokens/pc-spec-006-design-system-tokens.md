# PC-SPEC-006 — Design System: Tokens e Componentes

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | PC-SPEC-006                      |
| **Status**       | Done                             |
| **Prioridade**   | Alta                             |
| **Complexidade** | Baixa                            |
| **Criado em**    | 2026-04-03                       |
| **Autor**        | Patrick Iarrocheski              |
| **Branch**       | feat/PC-006-design-system-tokens |

## 1. Objetivo

Implementar o Design System Cateno como código — tokens de cor, tipografia, spacing, borders, shadows e componentes. Estabelecer configuração Tailwind CSS com variáveis CSS customizáveis para suporte futuro de tema dinâmico (dark mode). Garantir consistência visual em toda a aplicação.

## 2. Escopo

### 2.1 Incluído

- Paleta Cateno em Tailwind config: teal (primary), neutral (grays), lime (tags), semantic colors
- CSS custom properties para runtime theming (preparação dark mode)
- Escala tipográfica Inter: 9 níveis (caption até display)
- Escala spacing: base 4px, 12 steps (0.5rem até 16rem)
- Border radius tokens: 6px até 9999px
- Shadow tokens: sm, md, lg, xl, glow, card
- Componentes shadcn/ui customizados: Button, Input, Card, Badge, Toggle, Tabs, Checkbox
- Logo SVG Cateno: grafismo com ondas em #00AAB5 (teal) + #FFFFFF (branco), texto "Cateno". Duas versões: branca (fundo escuro) e escura (fundo claro)
- Dark mode prep: CSS vars ready, não implementar tema ainda
- Figma export compatibility (tokens estruturados)

### 2.2 Excluído

- Implementação de dark mode (será futuro)
- Componentes complexos (Modal, Drawer, Popover — serão futuro)
- Animações complexas (detalhes em specs futuras)
- Documentação Storybook (será futuro)
- Temas customizáveis por usuário

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-006-01 | Tailwind config deve estender com todas as cores Cateno (teal, neutral, lime, semânticas)                                                                                                                                                      |
| RF-006-02 | CSS custom properties devem estar em root (:root) com fallbacks                                                                                                                                                                                |
| RF-006-03 | Tipografia Inter deve ter scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl                                                                                                                                                                      |
| RF-006-04 | Cada nível de tipografia deve ter line-height, letter-spacing definidos                                                                                                                                                                        |
| RF-006-05 | Spacing tokens devem estar em incrementos consistentes (0.5rem = 8px até 16rem)                                                                                                                                                                |
| RF-006-06 | Border radius: xs (6px), sm (8px), md (12px), lg (16px), full (9999px)                                                                                                                                                                         |
| RF-006-07 | Shadow tokens: sm, md, lg, xl, glow (para accent), card (elevado)                                                                                                                                                                              |
| RF-006-08 | Button component deve ter variants: primary (teal), secondary (neutral), ghost, danger                                                                                                                                                         |
| RF-006-09 | Input component deve ter states: default, focus (teal), error (red), disabled                                                                                                                                                                  |
| RF-006-10 | Card component com padding, border, shadow configuráveis                                                                                                                                                                                       |
| RF-006-11 | Badge component para status: online (green), maintenance (yellow), offline (gray)                                                                                                                                                              |
| RF-006-12 | Toggle component binário com states: on (teal), off (neutral)                                                                                                                                                                                  |
| RF-006-13 | Tabs component com underline active indicator (teal-600)                                                                                                                                                                                       |
| RF-006-14 | Checkbox component com teal checked state                                                                                                                                                                                                      |
| RF-006-15 | Logo Cateno SVG como Server Component React, duas versões: branca (fundo escuro) e escura (fundo claro). Cores do logo: ondas #00AAB5 (teal) + #FFFFFF (branco), texto branco ou teal conforme versão. SVG original em `.context/docs/assets/` |
| RF-006-16 | Componentes devem suportar size props: sm, md, lg                                                                                                                                                                                              |
| RF-006-17 | Componentes devem ter className prop para estender estilos                                                                                                                                                                                     |
| RF-006-18 | Cores semânticas: success (green), warning (yellow), error (red), info (blue)                                                                                                                                                                  |

## 4. Requisitos Não-Funcionais

| ID         | Categoria           | Descrição                                               |
| ---------- | ------------------- | ------------------------------------------------------- |
| RNF-006-01 | Performance         | CSS customizado não deve impactar LCP (< 2.5s)          |
| RNF-006-02 | Acessibilidade      | Contrast ratio >= 4.5:1 (AA), 7:1 (AAA) onde aplicável  |
| RNF-006-03 | Acessibilidade      | Focus indicators claros e visíveis em todos componentes |
| RNF-006-04 | Manutenibilidade    | Tokens em arquivo único fonte-da-verdade                |
| RNF-006-05 | Escalabilidade      | Adicionar nova cor/token sem refactor de components     |
| RNF-006-06 | DX                  | Tailwind IntelliSense funcione com custom tokens        |
| RNF-006-07 | Internacionalização | Tokens neutros, sem dependência de idioma               |

## 5. Interface / UX

### Paleta de Cores

#### Primary (Teal)

- **teal-50**: #F0FDFA (background apps)
- **teal-100**: #CCFBF1 (hover light)
- **teal-200**: #99F6E4 (border light)
- **teal-300**: #5EEAD4 (border default)
- **teal-400**: #2DD4BF (interactive)
- **teal-500**: #14B8A6 (solid)
- **teal-600**: #0D9488 (primary button, active state)
- **teal-700**: #0F766E (hover, dark button)
- **teal-800**: #134E4A (text, dark)
- **teal-900**: #0D3E3A (heading, darkest)

#### Neutral (Grays)

- **neutral-50**: #FAFAFA (bg light)
- **neutral-100**: #F3F4F6 (bg)
- **neutral-200**: #E5E7EB (border)
- **neutral-300**: #D1D5DB (border subtle)
- **neutral-400**: #9CA3AF (placeholder)
- **neutral-500**: #6B7280 (text muted)
- **neutral-600**: #4B5563 (text)
- **neutral-700**: #374151 (text strong)
- **neutral-800**: #1F2937 (text)
- **neutral-900**: #111827 (heading, darkest)

#### Semantic

- **success (Lime)**: #84CC16 (checkmarks, positive)
- **warning (Amber)**: #F59E0B (caution, maintenance)
- **error (Red)**: #EF4444 (danger, offline)
- **info (Sky)**: #0EA5E9 (information)

#### Accent

- **lime-50**: #F7FEE7
- **lime-200**: #DCFCE7
- **lime-300**: #BEF264
- **lime-400**: #A3E635
- **lime-500**: #84CC16 (tag color)
- **lime-600**: #65A30D (tag hover)

### Tipografia

**Font Family:** Inter (sans-serif)

| Nível           | Size | Weight | Line-Height | Letter-Spacing | Uso                      |
| --------------- | ---- | ------ | ----------- | -------------- | ------------------------ |
| **Caption**     | 11px | 400    | 1.4         | 0.2px          | Small labels, footnotes  |
| **Overline**    | 12px | 600    | 1.4         | 0.5px          | Tags, badges             |
| **Small**       | 13px | 400    | 1.5         | 0.1px          | Helper text, small input |
| **Base**        | 14px | 400    | 1.5         | 0px            | Body text default        |
| **Body Medium** | 15px | 500    | 1.6         | 0px            | Button text, emphasis    |
| **Large**       | 16px | 400    | 1.6         | 0px            | Subheading, card title   |
| **XL**          | 18px | 600    | 1.7         | -0.2px         | Heading level 3          |
| **2XL**         | 24px | 600    | 1.8         | -0.3px         | Heading level 2          |
| **Display**     | 32px | 700    | 1.9         | -0.5px         | Page title (h1)          |

### Spacing

**Base:** 4px (0.25rem)

| Token | Value | Multiple |
| ----- | ----- | -------- |
| px    | 1px   | 0.25x    |
| 0.5   | 2px   | 0.5x     |
| 1     | 4px   | 1x       |
| 1.5   | 6px   | 1.5x     |
| 2     | 8px   | 2x       |
| 2.5   | 10px  | 2.5x     |
| 3     | 12px  | 3x       |
| 3.5   | 14px  | 3.5x     |
| 4     | 16px  | 4x       |
| 5     | 20px  | 5x       |
| 6     | 24px  | 6x       |
| 8     | 32px  | 8x       |
| 10    | 40px  | 10x      |
| 12    | 48px  | 12x      |
| 16    | 64px  | 16x      |

### Border Radius

| Token    | Value  | Uso                    |
| -------- | ------ | ---------------------- |
| **xs**   | 6px    | Subtle, input focus    |
| **sm**   | 8px    | Cards, buttons         |
| **md**   | 12px   | Modal, popover         |
| **lg**   | 16px   | Large container        |
| **xl**   | 20px   | Extra rounded button   |
| **full** | 9999px | Avatar, rounded button |

### Shadows

```css
/* sm */
0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* md */
0 4px 6px -1px rgba(0, 0, 0, 0.1),
0 2px 4px -2px rgba(0, 0, 0, 0.1);

/* lg */
0 10px 15px -3px rgba(0, 0, 0, 0.1),
0 4px 6px -4px rgba(0, 0, 0, 0.1);

/* xl */
0 20px 25px -5px rgba(0, 0, 0, 0.1),
0 8px 10px -6px rgba(0, 0, 0, 0.1);

/* glow (accent) */
0 0 20px rgba(13, 148, 136, 0.3);

/* card (elevated) */
0 25px 50px -12px rgba(0, 0, 0, 0.15);
```

## 6. Modelo de Dados

### CSS Custom Properties (`src/styles/design-tokens.css`)

```css
:root {
  /* Colors */
  --color-primary-50: #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-200: #99f6e4;
  --color-primary-300: #5eead4;
  --color-primary-400: #2dd4bf;
  --color-primary-500: #14b8a6;
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;
  --color-primary-800: #134e4a;
  --color-primary-900: #0d3e3a;

  /* Neutrals */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;

  /* Semantic */
  --color-success: #84cc16;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #0ea5e9;

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-caption: 11px;
  --font-size-small: 13px;
  --font-size-base: 14px;
  --font-size-large: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 24px;
  --font-size-display: 32px;

  --line-height-tight: 1.4;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.7;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 48px;

  /* Border Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(13, 148, 136, 0.3);
  --shadow-card: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode colors — future implementation */
    --color-primary-50: #0d3e3a;
    --color-neutral-50: #1f2937;
    /* ... */
  }
}
```

### Tailwind Config (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#134E4A',
          900: '#0D3E3A',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        lime: {
          50: '#F7FEE7',
          200: '#DCFCE7',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.4', letterSpacing: '0.2px' }],
        xs: ['13px', { lineHeight: '1.5', letterSpacing: '0.1px' }],
        sm: ['14px', { lineHeight: '1.5', letterSpacing: '0px' }],
        base: ['15px', { lineHeight: '1.6', letterSpacing: '0px' }],
        lg: ['16px', { lineHeight: '1.6', letterSpacing: '0px' }],
        xl: ['18px', { lineHeight: '1.7', letterSpacing: '-0.2px' }],
        '2xl': ['24px', { lineHeight: '1.8', letterSpacing: '-0.3px' }],
        '3xl': ['32px', { lineHeight: '1.9', letterSpacing: '-0.5px' }],
      },
      spacing: {
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(13, 148, 136, 0.3)',
        card: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### Logo Cateno Component

```typescript
// src/components/ui/CatenoLogo.tsx
// Server Component (SVG puro, sem interatividade — não precisa de 'use client')
// SVG original salvo em: .context/docs/assets/cateno-logo-white.svg
// Cores do logo: ondas #00AAB5 (teal/ciano) + #FFFFFF (branco), texto "Cateno"

interface CatenoLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'white' | 'dark'  // white = fundo escuro, dark = fundo claro
}

const sizeMap = {
  sm: { width: 60, height: 23 },   // ~67% do md
  md: { width: 90, height: 34 },   // tamanho base do SVG
  lg: { width: 120, height: 46 },  // viewBox original
}

export function CatenoLogo({ size = 'md', variant = 'white' }: CatenoLogoProps) {
  const { width, height } = sizeMap[size]
  // Cores das ondas e texto variam conforme versão
  const waveColor = variant === 'white' ? '#00AAB5' : '#00AAB5'  // ondas sempre teal
  const fillColor = variant === 'white' ? '#FFFFFF' : '#0D9488'  // texto branco ou teal
  const accentColor = variant === 'white' ? '#FFFFFF' : '#FFFFFF' // detalhes brancos viram teal-50

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Cateno"
      role="img"
    >
      {/* Grafismo de ondas (teal) — paths com fill={waveColor} */}
      {/* Detalhes das ondas (branco/accent) — paths com fill={fillColor} ou {accentColor} */}
      {/* Texto "Cateno" — paths com fill={fillColor} */}
      {/* ... SVG completo com as cores parametrizadas ... */}
    </svg>
  )
}
  )
}
```

### Componente Button (shadcn/ui customizado)

```typescript
// src/components/ui/button.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-teal-600 text-white hover:bg-teal-700',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-teal-200 text-teal-600 hover:bg-teal-50',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
        link: 'text-teal-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## 7. Cenários de Teste

| ID        | Cenário                    | Entrada                                               | Resultado Esperado                                                              |
| --------- | -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| CT-006-01 | Tailwind config compilação | `npm run build`                                       | Sem erros de config, cores disponíveis                                          |
| CT-006-02 | CSS custom properties      | Inspect elemento                                      | `--color-primary-600` = #0D9488                                                 |
| CT-006-03 | Cor teal-600 no button     | Renderiza button primary                              | Background #0D9488 (teal-600)                                                   |
| CT-006-04 | Inter font aplicada        | Inspeciona font-family                                | Font: 'Inter', fallback system                                                  |
| CT-006-05 | Tipografia scale           | Renderiza h1, h2, h3, body                            | Tamanhos/weights corretos por nível                                             |
| CT-006-06 | Border radius tokens       | Renderiza card com md                                 | Border-radius: 12px                                                             |
| CT-006-07 | Shadow tokens              | Card com shadow-lg                                    | Box-shadow elevation lg aplicado                                                |
| CT-006-08 | Logo Cateno renders        | Renderiza CatenoLogo variant="white" e variant="dark" | SVG com grafismo teal (#00AAB5), texto correto por variant, ARIA label presente |
| CT-006-09 | Button variants            | Primary, secondary, ghost                             | Cores e estilos corretos por variant                                            |
| CT-006-10 | Contrast ratio compliance  | Medida com acessibilidade checker                     | >= 4.5:1 (AA) em todos textos                                                   |

## 8. Critérios de Aceite

- [ ] Tailwind config estendido com paleta Cateno (teal, neutral, lime)
- [ ] CSS custom properties em `src/styles/design-tokens.css` com todas as cores/tokens
- [ ] Fallbacks no :root para garantir compatibilidade
- [ ] Dark mode prep: CSS vars estruturados, media query ready (sem implementação tema)
- [ ] Inter font configurada, 9 níveis tipográficos (caption até display)
- [ ] Spacing tokens: base 4px, 12 steps até 16rem
- [ ] Border radius: xs (6px) até full (9999px)
- [ ] Shadow tokens: sm, md, lg, xl, glow, card
- [ ] CatenoLogo Server Component com duas versões: `variant="white"` (fundo escuro) e `variant="dark"` (fundo claro). Ondas #00AAB5, texto parametrizado
- [ ] Button component: primary (teal), secondary (neutral), ghost, destructive variants
- [ ] Button sizes: sm, md, lg, icon
- [ ] Input component com focus border-teal-600, error states
- [ ] Card component com padding, border, shadow configuráveis
- [ ] Badge component: online (green), maintenance (yellow), offline (gray)
- [ ] Toggle component: on (teal-600), off (neutral-100)
- [ ] Tabs component: underline active indicator teal-600
- [ ] Checkbox component: teal checked state
- [ ] Todos componentes com size props (sm, md, lg) e className extend
- [ ] Color contrast >= 4.5:1 (AA), >= 7:1 (AAA) testado
- [ ] Tailwind IntelliSense funciona com custom colors
- [ ] Build sem warning, CSS minificado
- [ ] Todos os 10 cenários de teste CT-006-01 até CT-006-10 passam

## 9. Dependências

- **Depende de:** PC-SPEC-001 (Setup do projeto)
- **Usado por:** PC-SPEC-003, 004, 005 (componentes dependem dos tokens)
- **Ordem de implementação:** Implementar ANTES de 003/004/005: 001 → 006 → 002 → 003 → 004 → 005

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
