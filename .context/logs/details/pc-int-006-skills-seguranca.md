# PC-INT-006 — Instalação de Skills de Segurança e Atualização da Constitution

| Campo          | Valor            |
| -------------- | ---------------- |
| **ID**         | PC-INT-006       |
| **Início**     | 2026-04-03T11:30 |
| **Fim**        | 2026-04-03T12:00 |
| **Branch**     | — (documentação) |
| **Fase PREVC** | Planning         |

## Descrição

Avaliação e instalação de 4 skills de segurança enviadas pelo Patrick, criação de uma 5ª skill específica para Next.js 15, e atualização da CONSTITUTION.md com regras de segurança obrigatórias extraídas das skills.

## Skills Instaladas

Todas em `.context/docs/skills/security/`:

| Skill                            | Origem                  | Foco                                                          |
| -------------------------------- | ----------------------- | ------------------------------------------------------------- |
| `api-security-best-practices.md` | Community               | JWT, Zod, rate limiting, Prisma, OWASP API Top 10             |
| `frontend-security-coder.md`     | Community               | XSS, CSP, DOM security, clickjacking, SRI                     |
| `securityAudit.md`               | Community               | DevSecOps, threat modeling, compliance, OWASP                 |
| `top-web-vulnerabilities.md`     | Community               | Catálogo 100 vulnerabilidades web com mitigações              |
| `nextjs15-security.md`           | **Criado internamente** | Server/Client boundary, Server Actions, middleware, CSP, CSRF |

## Decisões Tomadas

- Instalar todas as 4 skills + criar skill Next.js 15 Security
- Adicionar seção "Security Standards" na CONSTITUTION.md com regras-chave extraídas

## Alterações na CONSTITUTION.md

Seção 4.1 Segurança expandida de 8 para 26 regras organizadas em 7 subseções:

1. Regras Obrigatórias por PR
2. Segurança Next.js 15 (Server/Client Boundary)
3. Headers e Proteção de Transporte
4. Proteção contra Vulnerabilidades Comuns
5. Auditoria e Monitoramento
6. Dependências
7. Skills de Referência (tabela)

## Artefatos Criados/Modificados

- `.context/docs/skills/security/api-security-best-practices.md` (copiado)
- `.context/docs/skills/security/frontend-security-coder.md` (copiado)
- `.context/docs/skills/security/securityAudit.md` (copiado)
- `.context/docs/skills/security/top-web-vulnerabilities.md` (copiado)
- `.context/docs/skills/security/nextjs15-security.md` (criado)
- `.context/docs/CONSTITUTION.md` (atualizado seção 4.1)

## Referência

- [← Voltar ao Log](../interaction-log.md)
