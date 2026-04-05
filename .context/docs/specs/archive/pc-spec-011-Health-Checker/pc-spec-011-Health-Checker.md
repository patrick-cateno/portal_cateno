# PC-SPEC-011 — Health Checker (Serviço Standalone)

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | PC-SPEC-011                |
| **Status**       | Concluída                  |
| **Prioridade**   | Média                      |
| **Complexidade** | Baixa                      |
| **Autor**        | Patrick Iarrocheski        |
| **Branch**       | feat/PC-011-health-checker |

## 1. Objetivo

Implementar o Health Checker como um container Node.js standalone separado do Next.js. A separação é necessária porque precisa rodar como singleton — um único processo fazendo checks periódicos — o que não é garantido dentro do Next.js com múltiplas instâncias.

## 2. Decisão de Arquitetura

**Por que não dentro do Next.js?**
- Next.js em produção roda múltiplas instâncias (HA) → múltiplos health checkers simultâneos
- `node-cron` dentro de API Routes pode ser reiniciado a qualquer momento pelo runtime
- Container dedicado garante exatamente 1 processo ativo

**Por que não um microsserviço complexo?**
- É um script simples: loop de 30s → check → PATCH
- Sem interface, sem banco direto, sem auth de usuário
- ~100 linhas de código

## 3. Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 22 LTS |
| Linguagem | TypeScript |
| Scheduler | `node-cron` |
| HTTP | `undici` |
| Concorrência | `p-limit` (máx 10 checks simultâneos) |

## 4. Implementação

### Estrutura

```
health-checker/
├── src/
│   ├── index.ts        # Entry point + cron
│   ├── checker.ts      # Lógica de verificação
│   └── registry.ts     # Comunicação com /api/applications
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Ciclo principal

```typescript
// src/index.ts
import cron from 'node-cron';
import pLimit from 'p-limit';
import { fetchActiveApps, patchHealth } from './registry';
import { checkHealth } from './checker';

const limit = pLimit(10);

cron.schedule('*/30 * * * * *', async () => {
  const apps = await fetchActiveApps();

  await Promise.allSettled(
    apps.map(app => limit(async () => {
      const result = await checkHealth(app.healthCheckUrl);
      await patchHealth(app.slug, result);
    }))
  );
});
```

### Comunicação com o Next.js

```typescript
// src/registry.ts
const PORTAL_URL = process.env.PORTAL_URL!;
const SECRET = process.env.HEALTH_CHECKER_SECRET!;

export async function fetchActiveApps() {
  // Não precisa de JWT — endpoint público com filtro de apps ativas
  const res = await fetch(`${PORTAL_URL}/api/applications?status=active`);
  const data = await res.json();
  return data.applications.filter((a: any) => a.healthCheckUrl);
}

export async function patchHealth(slug: string, result: HealthResult) {
  await fetch(`${PORTAL_URL}/api/applications/${slug}/health`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
    body: JSON.stringify(result),
  });
}
```

### Check com timeout 5s

```typescript
// src/checker.ts
import { request } from 'undici';

export async function checkHealth(url: string): Promise<HealthResult> {
  const start = Date.now();
  try {
    const { statusCode, body } = await request(url, {
      headersTimeout: 5000,
      bodyTimeout: 5000,
    });
    const responseTimeMs = Date.now() - start;

    // HTTP 503 + body { status: "maintenance" } → maintenance
    if (statusCode === 503) {
      const text = await body.text();
      if (text.includes('"maintenance"')) {
        return { status: 'maintenance', responseTimeMs, errorMessage: null };
      }
    }

    return {
      status: statusCode < 500 ? 'online' : 'offline',
      responseTimeMs,
      errorMessage: null,
    };
  } catch (err: any) {
    return {
      status: 'offline',
      responseTimeMs: null,
      errorMessage: err.message.slice(0, 200),
    };
  }
}
```

## 5. Variáveis de ambiente

```env
PORTAL_URL=http://portal:3000
HEALTH_CHECKER_SECRET=<mesmo-secret-do-.env.local-do-portal>
CHECK_INTERVAL_SECONDS=30
CONCURRENCY_LIMIT=10
LOG_LEVEL=info
```

## 6. Critérios de Aceite

- [ ] Ciclo de 30s verificado via logs
- [ ] Máx 10 checks simultâneos (p-limit)
- [ ] Timeout 5s por check — app offline não trava o ciclo
- [ ] HTTP 503 + "maintenance" → status maintenance
- [ ] Falha num app não para o ciclo dos demais
- [ ] `HEALTH_CHECKER_SECRET` validado pelo portal
- [ ] Container sobe com `docker compose up`

## 7. Dependências

- **Depende de:** PC-SPEC-007 (endpoint /health), PC-SPEC-008 (schema AppHealth), PC-SPEC-009 (secret)
- **Não é bloqueante** para outras specs
