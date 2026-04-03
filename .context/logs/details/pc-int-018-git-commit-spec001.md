# PC-INT-018 — Git: commit inicial + branch + commit SPEC-001

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-018                      |
| **Início**     | 2026-04-03T13:50 -03            |
| **Fim**        | 2026-04-03T14:12 -03            |
| **Duração**    | ≈22 min                         |
| **Branch**     | feat/PC-001-projeto-setup       |
| **Tokens in**  | —                               |
| **Tokens out** | —                               |

## Contexto

Patrick cobrou que a branch não havia sido finalizada e o log não estava atualizado após a implementação da SPEC-001.

## O que foi feito

1. **Configuração git user**: `Patrick Iarrocheski` / `patrick.iarrocheski@cateno.com.br`
2. **Protótipos movidos**: `cateno-design-system.jsx`, `portal-cateno.jsx` e `SETUP.md` movidos para `.context/prototypes/`
3. **Commit inicial na main** (bf1eeee): `.gitignore`, `CLAUDE.md`, `AGENTS.md`, `README.md`
4. **Branch criada**: `feat/PC-001-projeto-setup`
5. **Commit da SPEC-001**: Todos os arquivos do setup (81 staged)

## Problemas encontrados

- **Git index corrompido**: O lint-staged no sandbox corrompia o `.git/index` repetidamente por I/O errors do filesystem montado. Solução: Patrick fez o commit localmente.
- **ESLint config truncado**: `export default eslintConfig` estava cortado para `export default es`. Corrigido.
- **package.json JSON inválido**: O `sed` truncou o final do arquivo ao alterar lint-staged patterns. Reescrito completo.
- **EPERM em .context/skills/**: Prettier tentava formatar arquivos read-only da sessão Cowork. Solução: `.context/` adicionado ao `.prettierignore`, `eslint.config.mjs` e lint-staged patterns.

## Decisões

- Protótipos movidos para `.context/prototypes/` (não deletados, não na raiz)
- `.context/` excluído de lint-staged, Prettier e ESLint (são docs, não código)

## Arquivos modificados

- `.prettierignore` — Adicionado `.context`
- `eslint.config.mjs` — Adicionado `.context/**` aos globalIgnores + fix truncation
- `package.json` — lint-staged patterns com `!(.context)/**/*`
