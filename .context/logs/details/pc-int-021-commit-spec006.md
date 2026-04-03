# PC-INT-021 — Git: commit SPEC-006 + fix hooks condicionais

| Campo          | Valor                            |
| -------------- | -------------------------------- |
| **ID**         | PC-INT-021                       |
| **Início**     | 2026-04-03T20:12 -03             |
| **Fim**        | 2026-04-03T20:14 -03             |
| **Duração**    | ≈2 min                           |
| **Branch**     | feat/PC-006-design-system-tokens |
| **Tokens in**  | ≈200                             |
| **Tokens out** | ≈400                             |

## Contexto

Retomada da sessão. Patrick pediu análise do projeto e confirmou commit da SPEC-006.

## O que foi feito

1. **Análise do estado do projeto** — lido interaction-log, specs, git log para montar resumo
2. **Tentativa de commit** — falhou no pre-commit hook (eslint): `React.useId()` chamado condicionalmente via `??` em `checkbox.tsx` e `toggle.tsx`
3. **Fix**: movido `React.useId()` para variável `generatedId` antes de qualquer condicional nos dois componentes
4. **Commit bem-sucedido**: `1c83707` — 25 arquivos, 1565 inserções

## Arquivos modificados

| Arquivo | Ação |
| --- | --- |
| `src/components/ui/checkbox.tsx` | Fix: useId condicional → incondicional |
| `src/components/ui/toggle.tsx` | Fix: useId condicional → incondicional |

## Commit

```
1c83707 feat(PC-006): design system tokens e componentes UI
```
