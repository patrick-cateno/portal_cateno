# PC-INT-011 — Formatação de requisitos como tabelas em todas as 6 SPECs

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-011                      |
| **Início**     | 2026-04-03T11:18 -03            |
| **Fim**        | 2026-04-03T11:30 -03            |
| **Duração**    | ≈12 min                         |
| **Branch**     | —                               |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick viu a SPEC-001 renderizada e percebeu que os requisitos formatados como parágrafos contínuos estavam difíceis de ler. Solicitou: "não está legal a forma que os requisitos estão formatados, acho melhor que seja como tabelas, não acha?"

## O que foi feito

1. Convertidos os requisitos funcionais (RF) de todas as 6 SPECs do formato parágrafo para tabelas com colunas `ID | Descrição`
2. Convertidos os requisitos não-funcionais (RNF) de todas as 6 SPECs para tabelas com colunas `ID | Categoria | Descrição`
3. Mantidos os IDs e conteúdos originais, alterando apenas a formatação

## Arquivos modificados

- `pc-spec-001-projeto-setup.md` — RF e RNF como tabelas
- `pc-spec-002-autenticacao.md` — RF e RNF como tabelas
- `pc-spec-003-layout-navegacao.md` — RF e RNF como tabelas
- `pc-spec-004-visao-cards.md` — RF e RNF como tabelas
- `pc-spec-005-catia-conversacional.md` — RF e RNF como tabelas
- `pc-spec-006-design-system-tokens.md` — RF e RNF como tabelas

## Decisões

- Padrão de tabela: `| ID | Descrição |` para RF, `| ID | Categoria | Descrição |` para RNF
- Aplicado uniformemente em todas as SPECs para consistência
