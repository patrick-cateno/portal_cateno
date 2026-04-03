# PC-INT-007 — Correção do Processo de Logging

| Campo      | Valor                       |
| ---------- | --------------------------- |
| **ID**     | PC-INT-007                  |
| **Início** | 2026-04-03T10:57 -03 (real) |
| **Fim**    | 2026-04-03T10:57 -03 (real) |
| **Branch** | — (documentação)            |

## Descrição

Patrick identificou dois problemas no log de interações:

1. **Nem todas as interações estavam sendo registradas** — a regra dizia "cada interação relevante", mas deveria ser TODAS sem exceção
2. **Timestamps falsos** — os horários das interações 001-006 eram estimativas arredondadas (T09:00, T09:15, etc.), não timestamps reais capturados pelo sistema

## Correções Aplicadas

1. Reescrito o header do `interaction-log.md` com regras explícitas:
   - TODAS as interações registradas, sem exceção
   - Timestamps reais via `TZ="America/Sao_Paulo" date`
   - Nunca estimar ou arredondar
2. Interações 001-006 marcadas com ⚠️ retroativo (transparência sobre a falta de timestamp real)
3. A partir desta interação (007), todos os timestamps são capturados pelo comando de data real
4. Removidas colunas de "Tempo" e "Tempo (Σ)" que dependiam de timestamps falsos

## Lição

Rastreabilidade exige honestidade nos dados. Timestamps fabricados violam o princípio SDD de fonte única de verdade.

## Referência

- [← Voltar ao Log](../interaction-log.md)
