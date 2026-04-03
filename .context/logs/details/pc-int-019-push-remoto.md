# PC-INT-019 — Push para repositório remoto GitHub

| Campo          | Valor                     |
| -------------- | ------------------------- |
| **ID**         | PC-INT-019                |
| **Início**     | 2026-04-03T14:12 -03      |
| **Fim**        | 2026-04-03T16:38 -03      |
| **Duração**    | ≈146 min (inclui pausas)  |
| **Branch**     | feat/PC-001-projeto-setup |
| **Tokens in**  | ≈280                      |
| **Tokens out** | ≈950                      |

## Contexto

Patrick perguntou se o código havia sido enviado ao repositório remoto. Não estava — apenas local até então.

## O que foi feito

1. **Remote configurado**: `git remote add origin https://github.com/patrick-cateno/portal_cateno.git`
2. **Problema de permissão**: Usuário `patrickdev-ia` não tinha acesso ao repo `patrick-cateno/portal_cateno`
3. **Solução**: Patrick configurou PAT (Personal Access Token) via URL do remote
4. **Problema de scope**: PAT sem permissão `workflow` bloqueou push do `.github/workflows/ci.yml`
5. **Solução**: Patrick regenerou o PAT adicionando o scope `workflow`
6. **Push bem-sucedido**: `main` e `feat/PC-001-projeto-setup` enviadas ao GitHub

## Problemas encontrados

- **403 Forbidden**: Autenticado como usuário errado (`patrickdev-ia` vs `patrick-cateno`)
- **Password auth not supported**: GitHub não aceita senha — precisa de PAT no campo Password
- **Credential Manager**: Windows interceptava com credencial antiga, resolvido com token na URL
- **Missing `workflow` scope**: PAT sem permissão para arquivos `.github/workflows/`

## Decisão sobre tokens daqui para frente

Patrick decidiu retomar estimativas de tokens a partir da INT-019, com as INT-011–018 ficando sem dados por causa da compactação de contexto.

## Repositório

`https://github.com/patrick-cateno/portal_cateno.git`
