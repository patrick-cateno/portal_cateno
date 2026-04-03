# PC-INT-008 — Reestruturação do Log: Tokens Input/Output por Contagem de Caracteres

| Campo          | Valor                       |
| -------------- | --------------------------- |
| **ID**         | PC-INT-008                  |
| **Início**     | 2026-04-03T11:01 -03 (real) |
| **Fim**        | 2026-04-03T11:04 -03 (real) |
| **Input (≈)**  | 424 chars ≈ 115 tokens      |
| **Output (≈)** | 8.508 chars ≈ 2.299 tokens  |
| **Branch**     | — (documentação)            |

## Descrição

Patrick identificou que:

1. Os tokens registrados eram todos **estimativas fabricadas** (números inventados)
2. Faltava separação entre **input** (tokens consumidos pelo usuário/contexto) e **output** (tokens gerados pelo assistente)
3. Precisamos de valores reais ou a melhor aproximação possível

## Investigação

1. **tiktoken** (tokenizer OpenAI): instalação falhou — proxy bloqueia download do modelo de encoding
2. **API Anthropic**: não há endpoint acessível de dentro da sessão para obter token counts reais
3. **session_info MCP**: retorna sessões de exemplo, não da conversa atual
4. **Conclusão**: não é possível obter tokens reais programaticamente neste ambiente

## Solução Adotada

Estimativa por contagem de caracteres:

- **Ratio**: 3.7 caracteres por token (média ponderada para pt-BR + código-fonte TypeScript)
- **Input**: caracteres das mensagens do usuário + arquivos lidos via Read tool
- **Output**: caracteres das mensagens do assistente + arquivos escritos/editados via Write/Edit
- **Utilitário**: `python3 .context/logs/token-counter.py <input_chars> <output_chars>`
- **Marcação**: todos valores com prefixo `≈` para deixar claro que são estimativas

## Limitação

Essa contagem **não inclui**:

- Tokens do system prompt (são fixos por sessão, não muda por interação)
- Tokens de tool calls (Read, Write, Bash) — apenas o conteúdo retornado/enviado
- Overhead de formatação de mensagens da API

Para valores exatos, consultar o dashboard de uso da Anthropic.

## Alterações

- Reescrito `interaction-log.md` com colunas `In (≈tok)` e `Out (≈tok)`
- Criado utilitário `token-counter.py`
- Interações retroativas (001-007) marcadas sem dados de tokens

## Referência

- [← Voltar ao Log](../interaction-log.md)
