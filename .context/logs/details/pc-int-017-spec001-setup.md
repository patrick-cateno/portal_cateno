# PC-INT-017 — SPEC-001: Implementação do setup do projeto

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-017                      |
| **Início**     | 2026-04-03T12:30 -03            |
| **Fim**        | 2026-04-03T13:31 -03            |
| **Duração**    | ≈61 min                         |
| **Branch**     | feat/PC-001-projeto-setup       |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick solicitou iniciar a implementação. Seguindo a ordem definida, começamos pela SPEC-001 (Setup do Projeto).

## Desafio encontrado

O `node_modules` estava corrompido com diretórios temporários do npm que não podiam ser deletados (ghost dirs no filesystem montado). Solução: renomear `node_modules` para `node_modules_old` e recriar. Depois de instalar, npm não conseguia fazer instalações incrementais por conta de ENOTEMPTY em renomeações internas. Decisão: criar todos os arquivos de configuração manualmente e o usuário rodará `npm install` localmente.

## O que foi feito

### Arquivos criados/modificados

**Raiz:**

- `package.json` — Reescrito com todas as dependências (Prisma, shadcn/ui deps, Vitest, Prettier, Husky, lint-staged, Testing Library, Zod, lucide-react, tsx)
- `.prettierrc` — Configuração Prettier com plugin tailwindcss
- `.prettierignore` — Ignora node_modules, .next, migrations
- `eslint.config.mjs` — Atualizado com eslint-config-prettier
- `tsconfig.json` — Adicionado strictNullChecks e noImplicitAny explícitos
- `vitest.config.ts` — Vitest com jsdom, path aliases, cobertura v8
- `components.json` — shadcn/ui config (new-york style, RSC, aliases)
- `docker-compose.yml` — PostgreSQL 16 + Langflow (profile ai)
- `.gitignore` — Expandido (env files, IDE, OS, Prisma, node_modules_old)
- `README.md` — Reescrito completo com setup, scripts, estrutura

**Prisma:**

- `prisma/schema.prisma` — Schema completo: User, Account, Session, VerificationToken, Role, Permission, Category, Application, Favorite, AuditLog
- `prisma/seed.ts` — Seed com 6 categorias default

**Source:**

- `src/app/layout.tsx` — Layout raiz com metadata Portal Cateno, lang pt-BR
- `src/app/page.tsx` — Home page com branding Cateno
- `src/app/globals.css` — Tailwind 4 + design tokens + theme inline
- `src/styles/design-tokens.css` — Tokens completos: brand, neutrals, semantic, status, typography, spacing, radius, shadows
- `src/lib/utils.ts` — cn() utility (clsx + tailwind-merge)
- `src/lib/db.ts` — Prisma singleton client
- `src/lib/validations/common.ts` — Schemas Zod base (pagination, id)
- `src/config/site.ts` — Configuração do site
- `src/config/navigation.ts` — Navegação principal tipada (NavItem[])
- `src/types/index.ts` — Types compartilhados (ApplicationCard, CategoryItem)
- `src/types/api.ts` — Types de API (ApiResponse, ApiError)

**Testes:**

- `src/__tests__/setup.ts` — Setup Vitest + jest-dom
- `src/__tests__/lib/utils.test.ts` — 4 testes (cn utility)
- `src/__tests__/lib/site-config.test.ts` — 3 testes
- `src/__tests__/lib/navigation.test.ts` — 3 testes

**DevOps:**

- `.husky/pre-commit` — Roda lint-staged
- `.github/workflows/ci.yml` — GitHub Actions (lint, type-check, format, test, build)
- `scripts/setup.sh` — Script de setup completo

**Estrutura de pastas criada:**

- `src/app/(auth)/login/`, `src/app/(auth)/logout/`
- `src/app/(app)/dashboard/`, `src/app/(app)/aplicacoes/`, `src/app/(app)/catia/`
- `src/app/api/auth/`, `src/app/api/applications/`, `src/app/api/favorites/`
- `src/components/ui/`, `src/components/layout/`, `src/components/features/{auth,applications,catia}/`
- `src/hooks/`, `src/__tests__/{hooks,utils}/`

## Validação no sandbox

- ✅ `npm install` — 556 packages, 0 vulnerabilities
- ✅ `vitest run` — 3 test files, 10 tests passed
- ❌ `tsc --noEmit` — OOM no sandbox (limitação de recursos, OK localmente)
- ❌ `prisma generate` — 403 no download de engines (rede restrita, OK localmente)

## Próximo passo

O usuário deve rodar localmente:

```bash
rm -rf node_modules node_modules_old
npm install
npx prisma generate
npm run test
npm run type-check
npm run build
```
