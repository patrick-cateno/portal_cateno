# PC-INT-009 — Correção do Resumo Acumulado e Adição de Colunas de Tempo

| Campo          | Valor                       |
| -------------- | --------------------------- |
| **ID**         | PC-INT-009                  |
| **Início**     | 2026-04-03T11:11 -03 (real) |
| **Fim**        | 2026-04-03T11:11 -03 (real) |
| **Input (≈)**  | 208 chars ≈ 56 tokens       |
| **Output (≈)** | 3.329 chars ≈ 900 tokens    |
| **Branch**     | — (documentação)            |

## Descrição

Patrick apontou dois problemas no log:

1. O resumo acumulado não somava os tokens da INT-008 (mostrava "—" em vez dos valores)
2. Faltavam as colunas `Min` (duração em minutos) e `Min (Σ)` (tempo cumulativo) que ele havia solicitado originalmente

## Correções

- Resumo acumulado agora soma tokens de todas as interações com dados (INT-008+)
- Adicionadas colunas `Min` e `Min (Σ)` na tabela
- Tempo calculado pela diferença real entre timestamps de início e fim
- Regra 8 e 9 adicionadas à seção de regras do log

## Referência

- [← Voltar ao Log](../interaction-log.md)
