# PC-SPEC-019 — Documentação para Desenvolvedores (Docusaurus)

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **ID**           | PC-SPEC-019                             |
| **Status**       | Backlog                                 |
| **Prioridade**   | Alta — desenvolvedores de microsserviços precisam disso para integrar |
| **Complexidade** | Média                                   |
| **Autor**        | Patrick Iarrocheski                     |
| **Branch**       | feat/PC-019-documentacao-devs           |
| **Referência**   | https://ionicframework.com/docs         |

## 1. Objetivo

Criar um site de documentação técnica para os desenvolvedores dos microsserviços
da Cateno que precisam integrar com o Portal. Usando Docusaurus 3 — inspirado
no Ionic docs: sidebar estruturada, cards de quick start, busca, referência
OpenAPI integrada.

O site vive em um repositório separado (`portal-cateno-docs`) e é publicado
em `docs.cateno.com.br` (ou subpath). Desenvolvedores não precisam ter acesso
ao portal para consultar a documentação.

## 2. Estrutura do site

### Navegação principal (inspirada no Ionic docs)

```
Getting Started      ← Overview + quickstart em 5 minutos
Integrando           ← Como registrar microsserviço e tools
Referência da API    ← Gerada do OpenAPI
CatIA                ← Como o assistente usa as tools
Guias                ← Tópicos avançados
```

### Sidebar detalhada

```
Getting Started
├── Visão Geral
│   ├── O que é o Portal Cateno
│   ├── Arquitetura (diagrama)
│   └── Conceitos fundamentais
├── Quickstart
│   ├── Pré-requisitos
│   ├── Registrar seu microsserviço (5 min)
│   └── Expor sua primeira tool para o CatIA

Integrando com o Portal
├── Registro de Microsserviço
│   ├── POST /api/applications — contrato completo
│   ├── Campos obrigatórios e opcionais
│   ├── Tipos de integração (redirect, embed, modal)
│   └── Exemplo completo (curl + TypeScript + Python)
├── Health Check
│   ├── Contrato do endpoint /health
│   ├── Formato de resposta esperado
│   ├── Status: online, maintenance, offline
│   └── Exemplo de implementação
├── Tool Registry — Integrando com o CatIA
│   ├── O que são Tools
│   ├── POST /api/tools/register — contrato completo
│   ├── Definindo o inputSchema (JSON Schema)
│   ├── Autenticação das chamadas (JWT propagado)
│   ├── Exemplos por caso de uso
│   │   ├── Tool de listagem (GET)
│   │   ├── Tool de criação (POST com payload)
│   │   └── Tool com upload de arquivo
│   └── Boas práticas para descriptions (o LLM lê isso)

Referência da API
├── Catálogo de Aplicações
│   ├── GET /api/applications
│   ├── POST /api/applications
│   ├── GET /api/applications/{slug}
│   ├── GET /api/applications/status
│   └── PATCH /api/applications/{slug}/health
├── Tool Registry
│   ├── POST /api/tools/register
│   ├── GET /api/tools
│   └── PATCH /api/tools/{id}
└── Autenticação
    ├── Fluxo OAuth2 PKCE
    ├── Estrutura do JWT
    └── Roles disponíveis

CatIA — Como o assistente usa suas tools
├── Como o CatIA decide qual tool usar
├── O loop agentic explicado
├── Escrevendo boas descriptions de tools
├── Testando suas tools no CatIA
└── Limitações e comportamentos esperados

Guias Avançados
├── RBAC — Controlando quem vê o quê
├── Tipos de integração em detalhe
│   ├── redirect — app standalone
│   ├── embed — micro-frontend/iframe
│   └── modal — dados inline no portal
├── Ciclo de vida de uma tool
└── Troubleshooting
    ├── 403 no health endpoint
    ├── CatIA não usa minha tool
    └── App não aparece no catálogo
```

## 3. Página inicial (estilo Ionic docs)

```
┌─────────────────────────────────────────────────────┐
│  Portal Cateno — Developer Docs                     │
│  Integre seus microsserviços ao portal em minutos   │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ 🚀 Quickstart    │  │ 📋 Registrar Microsserviço│ │
│  │ Em 5 minutos seu │  │ Passo a passo completo   │ │
│  │ serviço no portal│  │ com exemplos de código   │ │
│  └──────────────────┘  └──────────────────────────┘ │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ 🤖 CatIA Tools   │  │ 📖 Referência da API     │ │
│  │ Exponha seus     │  │ Endpoints, schemas e     │ │
│  │ dados para a IA  │  │ exemplos interativos     │ │
│  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 4. Configuração do Docusaurus

### Estrutura do repositório

```
portal-cateno-docs/
├── docs/
│   ├── getting-started/
│   │   ├── overview.md
│   │   ├── quickstart.md
│   │   └── concepts.md
│   ├── integrating/
│   │   ├── register-microservice.md
│   │   ├── health-check.md
│   │   └── tool-registry.md
│   ├── api-reference/
│   │   ├── applications.md     ← gerado do OpenAPI
│   │   ├── tools.md
│   │   └── authentication.md
│   ├── catia/
│   │   ├── how-it-works.md
│   │   ├── writing-tools.md
│   │   └── testing.md
│   └── guides/
│       ├── rbac.md
│       ├── integration-types.md
│       └── troubleshooting.md
├── src/
│   ├── pages/
│   │   └── index.tsx           ← página inicial com cards
│   └── css/
│       └── custom.css          ← cores Cateno (teal)
├── static/
│   └── img/
│       ├── logo-cateno.svg
│       └── diagrams/
├── docusaurus.config.ts
├── sidebars.ts
└── package.json
```

### docusaurus.config.ts

```typescript
import { themes } from 'prism-react-renderer';

const config = {
  title: 'Portal Cateno — Developer Docs',
  tagline: 'Integre seus microsserviços ao portal em minutos',
  url: 'https://docs.cateno.com.br',
  baseUrl: '/',
  favicon: 'img/favicon.ico',

  themeConfig: {
    navbar: {
      logo: { src: 'img/logo-cateno.svg' },
      items: [
        { label: 'Getting Started', to: '/docs/getting-started/overview' },
        { label: 'Integrando', to: '/docs/integrating/register-microservice' },
        { label: 'Referência da API', to: '/docs/api-reference/applications' },
        { label: 'CatIA', to: '/docs/catia/how-it-works' },
      ],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
    },
    prism: {
      theme: themes.github,
      additionalLanguages: ['bash', 'json', 'typescript', 'python'],
    },
    algolia: {
      // Busca via Algolia DocSearch (gratuito para docs open source)
      appId: 'TODO',
      apiKey: 'TODO',
      indexName: 'portal-cateno-docs',
    },
  },

  presets: [['classic', {
    docs: {
      sidebarPath: './sidebars.ts',
      editUrl: 'https://github.com/cateno/portal-cateno-docs/edit/main/',
    },
  }]],
};
```

### Tema visual — cores Cateno (tokens exatos do cateno-design-system.jsx)

```css
/* src/css/custom.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  /* Teal — escala completa conforme design system */
  --ifm-color-primary:          #0D9488;  /* teal-600 — COR PRINCIPAL */
  --ifm-color-primary-dark:     #0F766E;  /* teal-700 — hover de botões */
  --ifm-color-primary-darker:   #115E59;  /* teal-800 — texto sobre fundo claro */
  --ifm-color-primary-darkest:  #134E4A;  /* teal-900 — texto forte */
  --ifm-color-primary-light:    #14B8A6;  /* teal-500 — CTA secundário */
  --ifm-color-primary-lighter:  #5EEAD4;  /* teal-300 — bordas ativas */
  --ifm-color-primary-lightest: #99F6E4;  /* teal-200 — hover leve */

  /* Tipografia */
  --ifm-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ifm-code-font-size: 90%;

  /* Background — teal-50 como no portal */
  --ifm-background-color: #F0FDFA;
  --ifm-background-surface-color: #FFFFFF;  /* neutral-0 — cards */

  /* Navbar — branco com borda, igual ao portal */
  --ifm-navbar-background-color: #FFFFFF;
  --ifm-navbar-shadow: 0 1px 0 #E2E8F0;     /* neutral-200 */

  /* Bordas */
  --ifm-color-emphasis-300: #E2E8F0;        /* neutral-200 */
  --ifm-color-emphasis-600: #64748B;        /* neutral-500 — texto secundário */

  /* Border radius — alinhado com design system */
  --ifm-global-radius: 8px;                 /* radius-md */
  --ifm-code-border-radius: 6px;            /* radius-sm */

  /* Sombras */
  --ifm-global-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
  --ifm-global-shadow-lw: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
}

[data-theme='dark'] {
  --ifm-color-primary:          #2DD4BF;  /* teal-400 — ícones secundários */
  --ifm-color-primary-dark:     #14B8A6;  /* teal-500 */
  --ifm-color-primary-darker:   #0D9488;  /* teal-600 */
  --ifm-color-primary-darkest:  #0F766E;  /* teal-700 */
  --ifm-color-primary-light:    #5EEAD4;  /* teal-300 */
  --ifm-color-primary-lighter:  #99F6E4;  /* teal-200 */
  --ifm-color-primary-lightest: #CCFBF1;  /* teal-100 */
  --ifm-background-color:       #0F172A;  /* neutral-900 */
  --ifm-navbar-background-color: #1E293B; /* neutral-800 */
}

/* Lime — tags e badges, conforme design system */
.badge--lime {
  background: #BEF264;  /* lime-300 */
  color: #1E293B;       /* neutral-800 */
}

/* Semânticas */
.alert--success { --ifm-alert-background-color: rgba(16, 185, 129, 0.1); }  /* success */
.alert--warning { --ifm-alert-background-color: rgba(245, 158, 11, 0.1); }  /* warning */
.alert--danger  { --ifm-alert-background-color: rgba(239, 68, 68, 0.1); }   /* danger */
```
```

## 5. Referência da API — integração com OpenAPI

Usar o plugin `docusaurus-plugin-openapi-docs` para gerar automaticamente
a referência da API a partir do `service-registry-openapi.yaml`:

```bash
npm install docusaurus-plugin-openapi-docs docusaurus-theme-openapi-docs
```

```typescript
// docusaurus.config.ts
plugins: [
  ['docusaurus-plugin-openapi-docs', {
    id: 'api',
    docsPluginId: 'classic',
    config: {
      cateno: {
        specPath: '../portal-cateno/service-registry-openapi.yaml',
        outputDir: 'docs/api-reference',
        sidebarOptions: { groupPathsBy: 'tag' },
      },
    },
  }],
],
```

## 6. Exemplos de código — múltiplas linguagens

Cada endpoint deve ter exemplos em:
- **curl** — para testes rápidos
- **TypeScript** — padrão dos microsserviços Node.js
- **Python** — para equipes que usam Python

Usar tabs do Docusaurus:

```mdx
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="curl" label="curl">
    ```bash
    curl -X POST https://portal.cateno.com.br/api/tools/register \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{ ... }'
    ```
  </TabItem>
  <TabItem value="typescript" label="TypeScript">
    ```typescript
    await fetch('/api/tools/register', { ... });
    ```
  </TabItem>
</Tabs>
```

## 7. Deploy

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

## 8. Critérios de aceite

- [ ] Repositório `portal-cateno-docs` criado
- [ ] Docusaurus 3 configurado com tema Cateno (teal-600)
- [ ] Página inicial com 4 cards de quick access
- [ ] Todas as seções do sidebar escritas e publicadas
- [ ] Referência da API gerada do `service-registry-openapi.yaml`
- [ ] Exemplos em curl + TypeScript para todos os endpoints
- [ ] Busca Algolia funcionando
- [ ] Deploy automático via GitHub Actions
- [ ] Acessível em docs.cateno.com.br (ou URL definida)
- [ ] Quickstart: desenvolvedor consegue registrar microsserviço em 5 minutos seguindo o guia

## 9. Dependências

- **Depende de:** PC-SPEC-007 (Service Registry — API de referência), PC-SPEC-015 (Tool Registry)
- **Repositório separado:** `portal-cateno-docs`
- **Não é bloqueante** para o portal em si
