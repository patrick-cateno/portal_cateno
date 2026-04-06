# PC-SPEC-018 — Documentação in-portal (Admin + Usuário)

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | PC-SPEC-018                        |
| **Status**       | Backlog                            |
| **Prioridade**   | Média                              |
| **Complexidade** | Baixa                              |
| **Autor**        | Patrick Iarrocheski                |
| **Branch**       | feat/PC-018-documentacao-portal    |

## 1. Objetivo

Criar a documentação de ajuda integrada ao portal, acessível via `/ajuda`.
O conteúdo é renderizado em HTML dentro do próprio portal, usando o design
system Cateno. O controle de visibilidade é feito por role:

- Role `admin` → vê duas abas: **Guia do Usuário** + **Guia do Administrador**
- Role `user` / `viewer` → vê apenas **Guia do Usuário**

## 2. Acesso à documentação

### 2.1 Menu lateral

Adicionar item "Ajuda" no final da sidebar, separado dos itens de navegação
principais por um divisor visual:

```
── Aplicações
── CatIA
── (divisor)
── Ajuda          ← novo item, ícone HelpCircle
```

### 2.2 Dropdown do perfil

Adicionar link "Ajuda & Documentação" no dropdown do avatar do usuário,
antes do item "Logout":

```
Patrick Iarrocheski
patrick@cateno.com.br
──────────────
Meu Perfil
Configurações
Ajuda & Documentação   ← novo item
──────────────
Logout
```

## 3. Estrutura de rotas

```
src/app/(app)/ajuda/
├── layout.tsx          # Layout da página de ajuda (tabs admin/user)
├── page.tsx            # Redireciona para /ajuda/usuario
├── usuario/
│   └── page.tsx        # Conteúdo do Guia do Usuário
└── admin/
    └── page.tsx        # Conteúdo do Guia do Admin (guard: role admin)
```

## 4. Layout da página /ajuda

```tsx
// layout.tsx
// Tabs condicionais por role
<div className="max-w-4xl mx-auto py-8 px-6">
  <h1>Central de Ajuda</h1>

  {/* Tabs — admin vê as duas, user vê só a primeira */}
  <Tabs defaultValue="usuario">
    <TabsList>
      <TabsTrigger value="usuario">Guia do Usuário</TabsTrigger>
      {isAdmin && (
        <TabsTrigger value="admin">Guia do Administrador</TabsTrigger>
      )}
    </TabsList>
  </Tabs>

  {children}
</div>
```

## 5. Conteúdo — Guia do Usuário

### 5.1 Primeiros passos
- O que é o Portal Cateno
- Como fazer login (via Keycloak — botão "Entrar com Login Cateno")
- Visão geral da interface

### 5.2 Catálogo de Aplicações
- Navegando pelos cards de aplicações
- Usando os filtros de categoria
- Buscando por nome ou descrição
- Marcando aplicações como favoritas
- Entendendo os status (online, manutenção, offline)
- Abrindo uma aplicação

### 5.3 CatIA — Assistente Inteligente
- O que o CatIA pode fazer
- Exemplos de perguntas:
  - "Quais apps de Cartões estão disponíveis?"
  - "Como está o status do portal?"
  - "Abrir Fatura Digital"
- Chips de aplicação nas respostas
- Limitações do CatIA

### 5.4 FAQ
- Não consigo fazer login — o que faço?
- Por que não vejo todas as aplicações?
- O status de uma aplicação está errado, o que fazer?
- Como reportar um problema?

## 6. Conteúdo — Guia do Administrador

### 6.1 Gestão de Aplicações
- Acessando o painel de administração (/admin)
- Criando uma nova aplicação (campos obrigatórios, tipos de integração)
- Editando informações de uma aplicação
- Arquivando uma aplicação
- Entendendo os tipos de integração (redirect, embed, modal)

### 6.2 Gestão de Categorias
- Criando e editando categorias
- Reordenando categorias via drag-and-drop
- Excluindo categorias (e restrição quando há apps vinculados)

### 6.3 Gestão de Permissões
- Diferença entre roles (admin, user, viewer)
- Concedendo acesso granular a usuários viewer
- Verificando quais aplicações um usuário pode ver

### 6.4 Tool Registry — Integrações com CatIA
- O que é o Tool Registry
- Visualizando tools registradas pelos microsserviços
- Ativando e desativando tools

### 6.5 Monitoramento
- Entendendo o Health Checker
- Verificando o histórico de saúde das aplicações
- O que fazer quando uma aplicação fica offline

### 6.6 Configuração do ambiente
- Variáveis de ambiente importantes
- Reiniciando serviços via Docker Compose
- Gerenciamento de usuários e roles no Keycloak

## 7. Implementação técnica

### Conteúdo como MDX
O conteúdo de cada página é escrito em MDX em arquivos separados,
facilitando manutenção sem tocar no código de layout:

```
src/content/ajuda/
├── usuario/
│   ├── primeiros-passos.mdx
│   ├── catalogo.mdx
│   ├── catia.mdx
│   └── faq.mdx
└── admin/
    ├── aplicacoes.mdx
    ├── categorias.mdx
    ├── permissoes.mdx
    ├── tool-registry.mdx
    ├── monitoramento.mdx
    └── configuracao.mdx
```

### Navegação interna
Sidebar de navegação dentro da página de ajuda para navegar entre seções,
independente da sidebar principal do portal.

### Design
- Seguir tokens do Design System Cateno (teal-600, neutral, Inter)
- Ícones Lucide React para ilustrar seções
- Código com destaque de sintaxe via `rehype-highlight`
- Screenshots/imagens em `public/docs/`

## 8. Critérios de aceite

- [ ] Item "Ajuda" na sidebar com ícone HelpCircle, separado por divisor
- [ ] Link "Ajuda & Documentação" no dropdown do perfil
- [ ] Rota /ajuda acessível após login
- [ ] Admin vê tabs "Guia do Usuário" e "Guia do Administrador"
- [ ] User/viewer vê apenas "Guia do Usuário"
- [ ] Conteúdo completo das seções 5 e 6 escrito em MDX
- [ ] Navegação interna entre seções funcionando
- [ ] Design consistente com o portal (tokens Cateno)

## 9. Dependências

- **Depende de:** PC-SPEC-003 (layout/navegação), PC-SPEC-002 (auth/roles)
- **Não é bloqueante** para outras specs
