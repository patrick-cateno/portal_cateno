# Kickoff — PC-SPEC-011: Health Checker (Container Standalone)

**Agente:** backend-specialist
**Wave:** 3 — requer pc-007 + pc-008 + pc-009 completos
**Estimativa:** ~7.5h

## Antes de começar

Confirme que pc-007 (PATCH /health funcionando) e pc-009 (HEALTH_CHECKER_SECRET definido) estão completos.
Leia a spec completa:
```
.context/docs/specs/backlog/pc-011-Health-Checker/pc-spec-011-Health-Checker.md
```

## Por que container separado

Next.js em produção roda múltiplas instâncias. `node-cron` dentro do Next.js
geraria múltiplos health checkers simultâneos. Container dedicado = singleton garantido.

## O que implementar

Criar serviço em `health-checker/`:

```
health-checker/
├── src/
│   ├── index.ts        # Entry: node-cron 30s + p-limit 10
│   ├── checker.ts      # fetch com timeout 5s + resolveStatus()
│   └── registry.ts     # fetchActiveApps() + patchHealth() com Bearer token
├── Dockerfile
├── package.json
└── tsconfig.json
```

**Regras críticas:**
- `Promise.allSettled()` — falha num app não para o ciclo dos demais
- `p-limit(10)` — máx 10 checks simultâneos
- Timeout 5s por check via `headersTimeout` e `bodyTimeout` do undici
- HTTP 503 + body com "maintenance" → status `maintenance`
- `HEALTH_CHECKER_SECRET` para autenticar no PATCH /health

## Critérios de aceite

- [ ] Ciclo exato de 30s
- [ ] Máx 10 checks simultâneos (p-limit)
- [ ] Timeout 5s por check
- [ ] maintenance detectado corretamente
- [ ] Falha isolada por app
- [ ] Dockerfile criado
- [ ] Adicionado ao docker-compose.yml

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "backend-specialist", to: "backend-specialist", artifacts: ["health-checker/", "docker-compose.yml"] })
```
