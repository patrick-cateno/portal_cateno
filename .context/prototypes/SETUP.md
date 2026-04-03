# Setup Rápido — Portal Cateno

## Pré-requisitos

- Node.js 20+ LTS
- npm 10+
- Git

## Inicialização

```bash
# 1. Navegue até a pasta do projeto
cd Documents/portal-cateno

# 2. Inicialize o repositório Git
git init -b main

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env.local

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O portal estará disponível em [http://localhost:3000](http://localhost:3000).

## Instalação do dotcontext MCP

```bash
# Instalar globalmente
npx dotcontext mcp:install

# Ou configurar manualmente no Claude Desktop
# Edite %APPDATA%\Claude\claude_desktop_config.json:
```

```json
{
  "mcpServers": {
    "dotcontext": {
      "command": "npx",
      "args": ["@dotcontext/cli", "mcp"]
    }
  }
}
```

## Estrutura do Projeto

```
portal-cateno/
├── .context/           ← Documentação SDD, SPECs, logs
├── src/                ← Código-fonte Next.js
├── prisma/             ← Schema do banco
├── public/             ← Assets estáticos
├── tests/              ← Testes
├── CONSTITUTION.md     → .context/docs/CONSTITUTION.md
└── SETUP.md            ← Este arquivo
```

## Comandos Úteis

| Comando         | Descrição                   |
| --------------- | --------------------------- |
| `npm run dev`   | Servidor de desenvolvimento |
| `npm run build` | Build de produção           |
| `npm run test`  | Executar testes (Vitest)    |
| `npm run lint`  | Verificar linting           |

## Próximos Passos

Consulte o [backlog de SPECs](.context/docs/specs/backlog/) para as funcionalidades planejadas.
A ordem recomendada de implementação é:

1. **PC-SPEC-001** — Setup do Projeto (configurações e tokens)
2. **PC-SPEC-006** — Design System: Tokens e Componentes
3. **PC-SPEC-002** — Sistema de Autenticação
4. **PC-SPEC-003** — Layout Principal e Navegação
5. **PC-SPEC-004** — Visão de Cards de Aplicações
6. **PC-SPEC-005** — CatIA Interface Conversacional
