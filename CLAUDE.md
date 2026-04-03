@AGENTS.md

# Protocolo Obrigatório — Portal Cateno

## 1. Log de Interações (OBRIGATÓRIO a cada interação)

**Regra absoluta**: após CADA interação significativa com o usuário (qualquer pergunta respondida, decisão tomada, arquivo criado/editado, revisão feita), o assistente DEVE:

1. **Capturar timestamp de início** — executar `TZ="America/Sao_Paulo" date` no início da interação
2. **Capturar timestamp de fim** — executar `TZ="America/Sao_Paulo" date` ao concluir
3. **Adicionar entrada na tabela** de `.context/logs/interaction-log.md` (ordem: mais recente primeiro)
4. **Criar arquivo de detalhe** em `.context/logs/details/pc-int-NNN-<slug>.md`
5. **Atualizar o resumo acumulado** (total de interações, tempo acumulado)
6. **Marcar o checkbox** na seção "Checklist da Sessão Atual" do log

### Quando NÃO é necessário logar

- Mensagens puramente conversacionais sem decisão ou artefato ("ok", "entendi", "pode ser")
- Continuação direta da mesma interação (mesmo tema, sem pausa)

### Formato do ID

`PC-INT-{NNN}` — sequencial, sem pular números.

## 2. Leitura de Docs do Next.js

Antes de escrever qualquer código Next.js, ler o guia relevante em `node_modules/next/dist/docs/`. Respeitar deprecation notices.

## 3. Spec-Driven Development (SDD)

- Nunca implementar sem SPEC aprovada
- Seguir workflow PREVC: Plan → Review → Execute → Validate → Commit
- Ordem de implementação: SPEC-001 → SPEC-006 → SPEC-002 → SPEC-003 → SPEC-004 → SPEC-005
