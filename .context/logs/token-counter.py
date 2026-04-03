#!/usr/bin/env python3
"""
Utilitário de estimativa de tokens para o Log de Interações do Portal Cateno.

Uso:
  python3 token-counter.py <input_chars> <output_chars>

Exemplo:
  python3 token-counter.py 5200 12800

Metodologia:
  - Ratio: 3.7 caracteres por token (média ponderada pt-BR + código-fonte)
  - Contagem de caracteres feita manualmente:
    - INPUT: mensagens do usuário + arquivos lidos (Read tool)
    - OUTPUT: mensagens do assistente + arquivos escritos/editados (Write/Edit tools)
  - LIMITAÇÃO: Isso é estimativa, não contagem real da API.
    Para tokens reais, consultar o dashboard Anthropic.
"""

import sys

RATIO = 3.7  # chars por token

def estimate(chars: int) -> int:
    return round(chars / RATIO)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python3 token-counter.py <input_chars> <output_chars>")
        sys.exit(1)

    input_chars = int(sys.argv[1])
    output_chars = int(sys.argv[2])

    input_tokens = estimate(input_chars)
    output_tokens = estimate(output_chars)
    total_tokens = input_tokens + output_tokens

    print(f"Input:  {input_chars:>8,} chars ≈ {input_tokens:>7,} tokens")
    print(f"Output: {output_chars:>8,} chars ≈ {output_tokens:>7,} tokens")
    print(f"Total:  {input_chars + output_chars:>8,} chars ≈ {total_tokens:>7,} tokens")
    print(f"Ratio:  {RATIO} chars/token")
