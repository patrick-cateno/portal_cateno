# PC-INT-016 — Protocolo obrigatório no CLAUDE.md + checklist no log

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-016                      |
| **Início**     | 2026-04-03T12:20 -03            |
| **Fim**        | 2026-04-03T12:26 -03            |
| **Duração**    | ≈6 min                          |
| **Branch**     | —                               |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick identificou que o log de interações não estava sendo mantido durante a sessão anterior e perguntou: "de que forma vc pode garantir que não esquecerá mais de fazer o que foi definido como obrigatório?"

## Decisão

Implementar dupla garantia: protocolo obrigatório no CLAUDE.md (lido automaticamente em toda sessão) + checklist visual no interaction-log.md.

## O que foi feito

### CLAUDE.md

- Adicionada seção "Protocolo Obrigatório — Portal Cateno"
- Regra 1: Log de Interações obrigatório com 6 passos (capturar timestamps, adicionar entrada, criar detalhe, atualizar resumo, marcar checklist)
- Regra 2: Leitura de docs Next.js antes de codificar
- Regra 3: SDD workflow PREVC e ordem de implementação

### interaction-log.md

- Adicionada seção "Checklist da Sessão Atual" com template de checkbox
- Template inclui instrução para limpar ao iniciar nova sessão

## Por que funciona

O CLAUDE.md é carregado automaticamente no início de cada sessão pelo sistema, independentemente de compactação de contexto ou troca de sessão. Isso garante que as regras serão lidas mesmo que todo o histórico conversacional seja perdido.

## Arquivos modificados

- `CLAUDE.md` — protocolo obrigatório adicionado
- `.context/logs/interaction-log.md` — seção checklist adicionada + INT-016 registrada
