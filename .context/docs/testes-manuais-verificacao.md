# Testes Manuais — Verificação Portal Cateno

> Gerado em 2026-04-05. Todos os testes automatizados (tsc, lint, 240 unit tests) já passaram.
> Este guia cobre os testes que exigem browser e ambiente rodando.

---

## Pré-requisitos

### 1. Subir o ambiente

```bash
# Terminal 1 — Docker (postgres, keycloak, health-checker)
docker compose up -d

# Aguardar postgres ficar healthy e migrate encerrar
docker compose ps -a
# Esperado: migrate com Exited (0), postgres com (healthy)

# Terminal 2 — Next.js dev server
npm run dev
# Esperado: ✓ Ready in http://localhost:3000
```

### 2. URLs de acesso

| Serviço | URL |
|---------|-----|
| Portal | http://localhost:3000 |
| Keycloak Admin | http://localhost:8080/admin (admin/admin) |

### 3. Usuários de teste (Keycloak)

| Usuário | Senha | Role | Uso |
|---------|-------|------|-----|
| admin | admin123 | admin, user | Testes de admin |
| patrick | cateno123 | user | Testes de usuário padrão |
| viewer | viewer123 | viewer | Testes de RBAC restrito |

---

## BLOCO A — Autenticação (Prioridade ALTA — segurança fintech)

### Teste A1 — Login via Keycloak
1. Abra http://localhost:3000 no browser
2. Deve redirecionar para o Keycloak (localhost:8080)
3. Faça login com `admin` / `admin123`
4. ✅ **Esperado:** redirecionado para `/aplicacoes` com catálogo visível

### Teste A2 — JWT nunca em localStorage
1. Após login, abra DevTools (F12)
2. Vá em **Application** → **Local Storage** → `http://localhost:3000`
3. ✅ **Esperado:** nenhuma chave contendo "token", "jwt", "access_token" ou "refresh_token"
4. Verifique também **Session Storage** — mesmo critério

### Teste A3 — Rota protegida sem sessão
1. Abra uma janela anônima (Ctrl+Shift+N)
2. Acesse http://localhost:3000/aplicacoes
3. ✅ **Esperado:** redirect para `/login`

### Teste A4 — Back-channel logout (CRÍTICO)
1. Faça login no portal com `admin`
2. Em outra aba, acesse o Keycloak Admin: http://localhost:8080/admin
3. Login admin: `admin` / `admin`
4. Vá em **Cateno realm** → **Users** → clique no usuário `admin`
5. Aba **Sessions** → clique **Sign out** na sessão ativa
6. Volte à aba do portal e clique em qualquer link
7. ✅ **Esperado:** redirecionado para `/login` (sessão invalidada pelo Keycloak)

### Teste A5 — Logout completo
1. Faça login no portal
2. Clique no avatar/nome no header → **Sair**
3. ✅ **Esperado:** redirecionado para página de login do Keycloak, depois para `/login` do portal
4. Tente acessar `/aplicacoes` → deve redirecionar para `/login`

### Teste A6 — Sessão criada no banco
1. Após login bem-sucedido, abra um terminal:
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT id, \"userId\", expires FROM \"Session\" ORDER BY expires DESC LIMIT 3;"
```
2. ✅ **Esperado:** ao menos 1 sessão com expires no futuro

### Teste A7 — AuditLog registra login
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT action, \"userId\", \"createdAt\" FROM \"AuditLog\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```
✅ **Esperado:** registro com `action = 'login_success'`

---

## BLOCO B — Admin Panel

### Teste B1 — Acesso bloqueado para não-admin
1. Faça login como `patrick` (role: user)
2. Acesse http://localhost:3000/admin
3. ✅ **Esperado:** redirecionado para `/aplicacoes`

### Teste B2 — Dashboard admin
1. Faça login como `admin`
2. Acesse http://localhost:3000/admin
3. ✅ **Esperado:** 4 cards com contadores (Aplicações, Categorias, Online, Manutenção)

### Teste B3 — Criar nova aplicação
1. No admin, vá em **Aplicações** → **Nova Aplicação**
2. Preencha:
   - Nome: `Teste Manual`
   - Slug: `teste-manual`
   - Categoria: (qualquer uma)
   - Tipo: Redirect
3. Clique **Criar Aplicação**
4. ✅ **Esperado:** toast "Aplicação criada", app aparece na tabela
5. Vá para `/aplicacoes` e verifique que o app aparece no catálogo

### Teste B4 — Editar aplicação
1. Na tabela de apps, clique no ícone de lápis do app criado
2. Altere a descrição
3. Salve
4. ✅ **Esperado:** toast "Aplicação atualizada"

### Teste B5 — Arquivar aplicação
1. Na tabela de apps, clique no ícone de arquivo do app criado
2. Confirme no dialog
3. ✅ **Esperado:** toast "arquivada", app some da tabela (filtro padrão exclui arquivadas)

### Teste B6 — Categorias com drag-and-drop
1. Acesse `/admin/categorias`
2. Arraste uma categoria para cima/baixo (pelo ícone de grip ⠿)
3. ✅ **Esperado:** toast "Ordem atualizada", ordem persiste após refresh (F5)

### Teste B7 — Criar categoria
1. Clique **Nova Categoria**
2. Preencha Nome: `Teste`, Slug: `teste`
3. Clique no ✓
4. ✅ **Esperado:** categoria aparece na tabela

### Teste B8 — Excluir categoria vazia
1. Exclua a categoria `Teste` (ícone lixeira)
2. ✅ **Esperado:** excluída com sucesso

### Teste B9 — Excluir categoria com apps
1. Tente excluir uma categoria que tem aplicações
2. ✅ **Esperado:** toast de erro "Categoria possui N aplicação(ões). Mova-as antes de excluir."

### Teste B10 — Gestão de permissões (viewer)
1. Acesse `/admin/permissoes`
2. Marque o checkbox de `canView` para o usuário `viewer` em um app específico (ex: Gestão de Cartões)
3. ✅ **Esperado:** toast "Permissão atualizada"
4. **Validar:** faça login como `viewer` / `viewer123` — deve ver apenas esse app

---

## BLOCO C — Catálogo de Aplicações

### Teste C1 — RBAC: admin vê todas as apps
1. Login como `admin`
2. Vá para `/aplicacoes`
3. ✅ **Esperado:** todas as apps do seed visíveis (14 apps)

### Teste C2 — RBAC: viewer só vê apps permitidas
1. Após configurar permissão no Teste B10
2. Login como `viewer`
3. Vá para `/aplicacoes`
4. ✅ **Esperado:** apenas apps com permissão `canView = true`

### Teste C3 — Filtro por categoria
1. Login como `admin`
2. No catálogo, clique no filtro de categoria (ex: Cartões)
3. ✅ **Esperado:** apenas apps da categoria selecionada

### Teste C4 — Busca por nome
1. No catálogo, digite no campo de busca: "cartão"
2. ✅ **Esperado:** filtra em tempo real mostrando apps com "cartão" no nome ou descrição

### Teste C5 — Status dots
1. Observe os dots coloridos nos cards
2. ✅ **Esperado:** verde = online, amarelo = maintenance, vermelho = offline
3. **Nota:** o health-checker precisa ter rodado ao menos 1 ciclo (30s) para popular os status

---

## BLOCO D — Health Checker

### Teste D1 — Logs de checks
```bash
docker compose logs health-checker --tail=30
```
✅ **Esperado:** logs mostrando ciclo a cada 30s:
```
[health-checker] Checking N apps (concurrency=10)
[health-checker] Cycle done: X ok, Y errors (ZZZms)
```

### Teste D2 — Registros no banco
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "SELECT a.\"slug\", h.\"status\", h.\"responseTimeMs\", h.\"checkedAt\" 
      FROM app_health h 
      JOIN \"Application\" a ON a.id = h.\"applicationId\" 
      ORDER BY h.\"checkedAt\" DESC LIMIT 10;"
```
✅ **Esperado:** registros com `checkedAt` recentes (< 1 min)

### Teste D3 — PATCH /health com token correto
```bash
curl -s -w "\nHTTP: %{http_code}" -X PATCH \
  "http://localhost:3000/api/applications/gestao-cartoes/health" \
  -H "Authorization: Bearer health-checker-dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"status":"online","response_time_ms":42}'
```
✅ **Esperado:** `HTTP: 204`

### Teste D4 — PATCH /health com token errado
```bash
curl -s -w "\nHTTP: %{http_code}" -X PATCH \
  "http://localhost:3000/api/applications/gestao-cartoes/health" \
  -H "Authorization: Bearer TOKEN_ERRADO" \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'
```
✅ **Esperado:** `HTTP: 403`

---

## BLOCO E — CatIA (requer API keys configuradas)

> **Pré-requisito:** Configure `ANTHROPIC_API_KEY` e/ou `GOOGLE_AI_API_KEY` no `.env.local`
> Se apenas Google está configurado, o CatIA usa Gemini para todos os nós.

### Teste E1 — Resposta simples
1. Login como `admin`
2. Clique na aba **CatIA** (ou acesse `/catia`)
3. Digite: "Olá, o que você pode fazer?"
4. ✅ **Esperado:** resposta aparece explicando as capacidades do CatIA

### Teste E2 — Busca de apps
1. Digite: "Quais apps são de Cartões?"
2. ✅ **Esperado:** resposta lista apps da categoria Cartões com chips clicáveis `[app:slug:nome]`

### Teste E3 — Chip clicável
1. Clique em um chip de app retornado pelo CatIA
2. ✅ **Esperado:** navega para o catálogo com busca do app

### Teste E4 — Status via CatIA
1. Digite: "Como está o status das aplicações?"
2. ✅ **Esperado:** resposta com status real dos apps (online/manutenção/offline)

### Teste E5 — RBAC no CatIA
1. Login como `viewer` (com permissão apenas em 1 app)
2. Digite: "Mostre todos os apps"
3. ✅ **Esperado:** CatIA retorna apenas apps que o viewer tem acesso

### Teste E6 — Troca de modelo via .env
1. No `.env.local`, mude `CATIA_SIMPLE_RESPONSE_MODEL=gemini-2.0-flash` para outro modelo
2. Reinicie o dev server: Ctrl+C → `npm run dev`
3. Envie mensagem ao CatIA
4. ✅ **Esperado:** funciona com o novo modelo sem mudança de código

---

## BLOCO F — Tool Registry

### Teste F1 — Registrar tool via API
```bash
# Obtenha um cookie de sessão admin fazendo login no browser primeiro,
# ou use o HEALTH_CHECKER_SECRET como service account:
curl -s -w "\nHTTP: %{http_code}" -X POST \
  "http://localhost:3000/api/tools" \
  -H "Authorization: Bearer health-checker-dev-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationSlug": "gestao-cartoes",
    "tools": [{
      "name": "listar_cartoes_teste",
      "description": "Lista cartões do usuário. Use quando perguntar sobre cartões.",
      "inputSchema": { "type": "object", "properties": {} },
      "endpoint": "https://cartoes.cateno.com.br/api/cartoes",
      "method": "GET",
      "requiredRole": "user"
    }]
  }'
```
✅ **Esperado:** `HTTP: 201` com `{ "registered": 1, "tools": ["listar_cartoes_teste"] }`

### Teste F2 — Tool visível no Admin
1. Login como `admin`
2. Acesse `/admin/tools`
3. ✅ **Esperado:** tools do seed (consultar_cartao, bloquear_cartao) + a tool registrada acima

### Teste F3 — Desativar tool
1. No `/admin/tools`, clique no toggle de uma tool para desativar
2. ✅ **Esperado:** toast "Tool desativada", toggle muda para cinza

### Teste F4 — Tool desativada não aparece na API
```bash
curl -s "http://localhost:3000/api/tools" \
  -H "Cookie: <SEU_COOKIE_DE_SESSAO>" | python3 -m json.tool
```
✅ **Esperado:** tool desativada não aparece na lista (filtro `active=true` padrão)

---

## BLOCO G — Database

### Teste G1 — Tabelas existem
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "\dt" | grep -E "app_health|app_metrics|microservice_tool|permission"
```
✅ **Esperado:** 4 tabelas listadas

### Teste G2 — Índices de performance
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "\di" | grep -E "idx_perm|idx_app_health|idx_tool"
```
✅ **Esperado:** 3 índices listados

### Teste G3 — Unique constraint de tools
```bash
docker compose exec postgres psql -U cateno -d portal_cateno \
  -c "\d microservice_tool" | grep -i unique
```
✅ **Esperado:** `microservice_tool_applicationId_name_key UNIQUE`

---

## Checklist de Resultado

Marque cada teste após execução:

**Bloco A — Autenticação**
- [ ] A1 — Login via Keycloak
- [ ] A2 — JWT nunca em localStorage
- [ ] A3 — Rota protegida sem sessão
- [ ] A4 — Back-channel logout
- [ ] A5 — Logout completo
- [ ] A6 — Sessão no banco
- [ ] A7 — AuditLog login

**Bloco B — Admin Panel**
- [ ] B1 — Bloqueio non-admin
- [ ] B2 — Dashboard
- [ ] B3 — Criar app
- [ ] B4 — Editar app
- [ ] B5 — Arquivar app
- [ ] B6 — Drag-and-drop categorias
- [ ] B7 — Criar categoria
- [ ] B8 — Excluir categoria vazia
- [ ] B9 — Excluir categoria com apps (erro)
- [ ] B10 — Permissões viewer

**Bloco C — Catálogo**
- [ ] C1 — Admin vê todas
- [ ] C2 — Viewer restrito
- [ ] C3 — Filtro categoria
- [ ] C4 — Busca por nome
- [ ] C5 — Status dots

**Bloco D — Health Checker**
- [ ] D1 — Logs de checks
- [ ] D2 — Registros no banco
- [ ] D3 — PATCH token correto (204)
- [ ] D4 — PATCH token errado (403)

**Bloco E — CatIA** (requer API keys)
- [ ] E1 — Resposta simples
- [ ] E2 — Busca de apps
- [ ] E3 — Chip clicável
- [ ] E4 — Status via CatIA
- [ ] E5 — RBAC no CatIA
- [ ] E6 — Troca de modelo

**Bloco F — Tool Registry**
- [ ] F1 — Registrar tool via API
- [ ] F2 — Tool no Admin
- [ ] F3 — Desativar tool
- [ ] F4 — Tool desativada não na API

**Bloco G — Database**
- [ ] G1 — Tabelas existem
- [ ] G2 — Índices de performance
- [ ] G3 — Unique constraint
