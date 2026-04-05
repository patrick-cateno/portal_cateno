# Kickoff — PC-SPEC-013: API Gateway (Caddy)

**Agente:** devops-specialist
**Wave:** 6 — necessário apenas para produção, não bloqueia desenvolvimento
**Estimativa:** ~3.5h

## Antes de começar

Leia a spec completa:
```
.context/docs/specs/backlog/pc-013-API-Gateway/pc-spec-013-API-Gateway.md
```

## O que implementar

Criar `infra/Caddyfile`:

```caddyfile
{
  admin off
  log { output stdout; format json }
}

portal.cateno.com.br {
  rate_limit {remote.ip} 500r/m

  reverse_proxy portal:3000 {
    header_up X-Real-IP {remote.ip}
    header_up X-Request-ID {http.request.uuid}
    flush_interval -1    # CRÍTICO para SSE do CatIA
  }

  handle /healthz {
    respond `{"status":"ok"}` 200
  }
}
```

Adicionar ao `docker-compose.yml`:
```yaml
caddy:
  image: caddy:2-alpine
  ports: ["80:80", "443:443"]
  volumes:
    - ./infra/Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
  depends_on: [portal]
```

## Regra crítica

`flush_interval -1` é **obrigatório** para o streaming SSE do CatIA funcionar.
Sem isso o Caddy bufferiza as respostas e o streaming não chega ao cliente.

## Critérios de aceite

- [ ] Caddyfile criado em infra/
- [ ] HTTPS automático com Let's Encrypt
- [ ] SSE /api/catia/chat funciona sem buffering
- [ ] GET /healthz responde 200
- [ ] Rate limit 500 req/min por IP
- [ ] Portal não exposto diretamente (apenas via Caddy)
- [ ] Adicionado ao docker-compose.yml

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "devops-specialist", to: "devops-specialist", artifacts: ["infra/Caddyfile", "docker-compose.yml"] })
```
