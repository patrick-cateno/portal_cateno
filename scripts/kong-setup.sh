#!/bin/bash
# ═══════════════════════════════════════════
# CSA - CatIA Super App — Kong Gateway Setup
# Executar uma vez apos `docker compose up -d kong`
# Idempotente: usa PUT para services, POST com fallback para routes/plugins
# ═══════════════════════════════════════════
set -e

KONG_ADMIN="${KONG_ADMIN_URL:-http://localhost:8001}"

echo "Aguardando Kong inicializar..."
until curl -s "$KONG_ADMIN/status" > /dev/null 2>&1; do sleep 2; done
echo "Kong pronto."

# Helper: cria route se nao existir (por nome)
create_route() {
  local service="$1"
  local name="$2"
  local data="$3"
  existing=$(curl -s "$KONG_ADMIN/services/$service/routes" | grep -o "\"name\":\"$name\"" || true)
  if [ -z "$existing" ]; then
    curl -s -X POST "$KONG_ADMIN/services/$service/routes" \
      -H "Content-Type: application/json" \
      -d "$data" > /dev/null
    echo "  + rota $name criada"
  else
    echo "  = rota $name ja existe"
  fi
}

# Helper: cria plugin se nao existir (por nome no service)
create_plugin() {
  local service="$1"
  local plugin_name="$2"
  local data="$3"
  existing=$(curl -s "$KONG_ADMIN/services/$service/plugins" | grep -o "\"name\":\"$plugin_name\"" || true)
  if [ -z "$existing" ]; then
    curl -s -X POST "$KONG_ADMIN/services/$service/plugins" \
      -H "Content-Type: application/json" \
      -d "$data" > /dev/null
    echo "  + plugin $plugin_name criado"
  else
    echo "  = plugin $plugin_name ja existe"
  fi
}

# Helper: cria plugin em uma rota (por nome) se nao existir
create_route_plugin() {
  local route="$1"
  local plugin_name="$2"
  local data="$3"
  existing=$(curl -s "$KONG_ADMIN/routes/$route/plugins" | grep -o "\"name\":\"$plugin_name\"" || true)
  if [ -z "$existing" ]; then
    curl -s -X POST "$KONG_ADMIN/routes/$route/plugins" \
      -H "Content-Type: application/json" \
      -d "$data" > /dev/null
    echo "  + plugin $plugin_name criado na rota $route"
  else
    echo "  = plugin $plugin_name ja existe na rota $route"
  fi
}

# Helper: cria plugin global se nao existir
create_global_plugin() {
  local plugin_name="$1"
  local data="$2"
  existing=$(curl -s "$KONG_ADMIN/plugins" | grep -o "\"name\":\"$plugin_name\"" || true)
  if [ -z "$existing" ]; then
    curl -s -X POST "$KONG_ADMIN/plugins" \
      -H "Content-Type: application/json" \
      -d "$data" > /dev/null
    echo "  + plugin global $plugin_name criado"
  else
    echo "  = plugin global $plugin_name ja existe"
  fi
}

# ── Servico: Portal Shell (Next.js) ──────────────────────
echo ""
echo "Configurando portal-shell..."
curl -s -X PUT "$KONG_ADMIN/services/portal-shell" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://host.docker.internal:3000"}' > /dev/null

create_route "portal-shell" "portal-route" \
  '{"name":"portal-route","paths":["/"],"strip_path":false}'
echo "  portal-shell -> http://host.docker.internal:3000"

# ── Servico: ms-reservas (preparatorio — ms ainda nao existe) ──
echo ""
echo "Configurando ms-reservas (preparatorio)..."
curl -s -X PUT "$KONG_ADMIN/services/ms-reservas" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://ms-reservas:3000"}' > /dev/null

# Rota health — sem JWT (mais especifica, Kong avalia antes)
create_route "ms-reservas" "reservas-health-route" \
  '{"name":"reservas-health-route","paths":["/api/reservas/health"],"strip_path":true}'

# Rota principal — com JWT e rate-limit
create_route "ms-reservas" "reservas-route" \
  '{"name":"reservas-route","paths":["/api/reservas"],"strip_path":true}'

# Plugin JWT na ROTA principal (nao no service, para que /health fique sem JWT)
create_route_plugin "reservas-route" "jwt" \
  '{"name":"jwt","config":{"key_claim_name":"kid","claims_to_verify":["exp"],"header_names":["authorization"]}}'

# Plugin rate-limiting na ROTA principal
create_route_plugin "reservas-route" "rate-limiting" \
  '{"name":"rate-limiting","config":{"minute":100,"hour":2000,"policy":"local","fault_tolerant":true}}'

echo "  ms-reservas -> http://ms-reservas:3000"
echo "  - /api/reservas/health (sem JWT)"
echo "  - /api/reservas (com JWT + rate-limit)"

# ── Plugin global: Correlation ID ────────────────────────
echo ""
echo "Configurando plugins globais..."
create_global_plugin "correlation-id" \
  '{"name":"correlation-id","config":{"header_name":"X-Request-ID","generator":"uuid","echo_downstream":true}}'

# ── Resumo ───────────────────────────────────────────────
echo ""
echo "Kong configurado com sucesso."
echo ""
echo "Servicos:"
curl -s "$KONG_ADMIN/services" 2>/dev/null | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"$//' | while read name; do echo "  - $name"; done
echo ""
echo "Rotas:"
curl -s "$KONG_ADMIN/routes" 2>/dev/null | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"$//' | while read name; do echo "  - $name"; done
