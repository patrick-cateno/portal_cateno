# PC-SPEC-015 — Tool Registry Dinâmico do CatIA

| Campo            | Valor                       |
| ---------------- | --------------------------- |
| **ID**           | PC-SPEC-015                 |
| **Status**       | Backlog                     |
| **Prioridade**   | Média                       |
| **Complexidade** | Alta                        |
| **Autor**        | Patrick Iarrocheski         |
| **Branch**       | feat/PC-015-tool-registry   |

## 1. Objetivo

Implementar o mecanismo pelo qual o CatIA descobre e usa as capacidades dos microsserviços da Cateno dinamicamente. Quando um novo microsserviço é integrado ao portal, ele registra suas tools — e o CatIA passa a oferecer essas operações ao usuário sem mudança de código no CatIA.

## 2. Problema que resolve

Sem Tool Registry, cada nova operação de negócio (cadastrar vaga, gerar contrato, listar fornecedores) exige:
1. Implementar a chamada de API no código do CatIA
2. Definir a tool manualmente no nó tool-caller
3. Redeploy do portal

Com Tool Registry:
1. O microsserviço registra suas capabilities via API
2. O CatIA carrega as tools dinamicamente no boot e a cada request
3. Zero mudança no CatIA

## 3. Modelo de dados

```prisma
// Adicionar ao prisma/schema.prisma

model MicroserviceTool {
  id              String      @id @default(cuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  name            String      // Ex: "criar_vaga", "listar_fornecedores"
  description     String      // Usado pelo LLM para decidir quando usar
  inputSchema     Json        // JSON Schema dos parâmetros de entrada
  outputSchema    Json?       // JSON Schema da resposta esperada
  endpoint        String      // URL do endpoint REST a chamar
  method          String      @default("POST")
  requiredRole    String?     // Role mínima para usar esta tool
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([applicationId, name])
  @@index([applicationId, isActive])
  @@map("microservice_tool")
}
```

## 4. API de registro — microsserviços registram suas tools

```typescript
// POST /api/tools/register
// Chamado pelo microsserviço durante o deploy ou bootstrap

// Request
{
  "applicationSlug": "gestao-de-vagas",
  "tools": [
    {
      "name": "criar_vaga",
      "description": "Cadastra uma nova vaga de contratação com o perfil profissional desejado. Use quando o usuário quiser abrir uma vaga.",
      "inputSchema": {
        "type": "object",
        "required": ["titulo", "perfil", "nivel"],
        "properties": {
          "titulo":      { "type": "string", "description": "Título da vaga" },
          "perfil":      { "type": "string", "description": "Descrição do perfil desejado" },
          "nivel":       { "type": "string", "enum": ["junior", "pleno", "senior"] },
          "ferramentas": { "type": "array", "items": { "type": "string" } }
        }
      },
      "endpoint": "https://vagas.cateno.com.br/api/vagas",
      "method": "POST",
      "requiredRole": "user"
    },
    {
      "name": "listar_vagas_abertas",
      "description": "Lista todas as vagas abertas. Use quando o usuário perguntar sobre vagas disponíveis.",
      "inputSchema": { "type": "object", "properties": {
        "status": { "type": "string", "enum": ["aberta", "fechada", "todas"] }
      }},
      "endpoint": "https://vagas.cateno.com.br/api/vagas",
      "method": "GET",
      "requiredRole": "user"
    }
  ]
}
```

## 5. Carregamento dinâmico das tools no CatIA

```typescript
// src/lib/catia/tools/registry.ts

export async function loadToolsForUser(userRoles: string[]): Promise<AnthropicTool[]> {
  // Busca tools ativas que o usuário tem permissão de usar
  const tools = await prisma.microserviceTool.findMany({
    where: {
      isActive: true,
      OR: [
        { requiredRole: null },
        { requiredRole: { in: userRoles } },
        ...(userRoles.includes("admin") ? [{}] : []),
      ],
    },
    include: { application: true },
  });

  // Converte para o formato do SDK Anthropic (tool calling)
  return tools.map(tool => ({
    name: tool.name,
    description: `[${tool.application.name}] ${tool.description}`,
    input_schema: tool.inputSchema as AnthropicTool["input_schema"],
  }));
}
```

## 6. Execução das tools — CatIA chama o microsserviço

```typescript
// src/lib/catia/tools/executor.ts

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userToken: string,   // JWT do usuário — RBAC no microsserviço
): Promise<unknown> {
  const tool = await prisma.microserviceTool.findFirst({
    where: { name: toolName, isActive: true },
  });

  if (!tool) throw new Error(`Tool não encontrada: ${toolName}`);

  const response = await fetch(tool.endpoint, {
    method: tool.method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,  // JWT original do usuário
    },
    body: tool.method !== "GET" ? JSON.stringify(toolInput) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro na tool ${toolName}: ${response.status} — ${error}`);
  }

  return response.json();
}
```

## 7. Admin Panel — gestão de tools

Adicionar à PC-SPEC-010 (Admin Panel):
- Listagem de tools registradas por microsserviço
- Ativar/desativar tools sem redeploy
- Visualizar schema de entrada e saída
- Testar tool diretamente no admin

## 8. Fluxo completo — exemplo "cadastrar vaga"

```
Usuário: "Preciso abrir uma vaga de desenvolvedor sênior React"

1. Nó intent → classifica como "business_op"
2. Nó orchestrator (Gemini 2.5 Pro) → planeja:
   - Usar tool "criar_vaga" do microsserviço "gestao-de-vagas"
   - Coletar: titulo, perfil, nivel, ferramentas
3. Nó tool-caller (Claude Sonnet) →
   - Carrega tools via loadToolsForUser()
   - "criar_vaga" está disponível com description clara
   - Claude decide usar "criar_vaga"
   - Extrai parâmetros da mensagem do usuário
   - Chama POST https://vagas.cateno.com.br/api/vagas com JWT do usuário
4. Nó responder → confirma ao usuário: "Vaga criada com sucesso! ID: #4521"
```

## 9. Critérios de Aceite

- [ ] Model MicroserviceTool no Prisma com migration
- [ ] POST /api/tools/register funcionando (requer role admin ou service account)
- [ ] loadToolsForUser() filtra por role do usuário
- [ ] executeTool() propaga JWT do usuário para o microsserviço
- [ ] Nó tool-caller do PC-SPEC-012 integrado com loadToolsForUser()
- [ ] Admin Panel exibe e gerencia tools (PC-SPEC-010)
- [ ] Exemplo funcional: cadastrar vaga via CatIA ponta a ponta

## 10. Dependências

- **Depende de:** PC-SPEC-012 (CatIA Backend), PC-SPEC-008 (schema), PC-SPEC-010 (Admin Panel)
- **É bloqueante para:** qualquer operação de negócio via CatIA
