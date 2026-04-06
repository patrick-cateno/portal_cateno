# Kickoff — PC-SPEC-019: Documentação Devs (Docusaurus)

**Agente:** documentation-writer + frontend-specialist
**Repositório:** portal-cateno-docs (NOVO — separado do portal)
**Estimativa:** ~26.5h
**Referência visual:** https://ionicframework.com/docs

## Antes de começar

Leia a spec completa:
```
.context/docs/specs/backlog/pc-019-Documentacao-Devs-Docusaurus/pc-spec-019-Documentacao-Devs-Docusaurus.md
```

Tenha disponível para consulta:
- `service-registry-openapi.yaml` — fonte da referência da API
- `.context/docs/architecture.md` — para a seção de visão geral
- `.context/docs/specs/backlog/pc-015-Tool-Registry/pc-spec-015-Tool-Registry.md` — para a seção de Tool Registry

## Passo 1 — Criar e inicializar o repositório

```bash
# Em um diretório FORA do portal-cateno
cd C:\Users\patrick.iarrocheski\Documents
npx create-docusaurus@latest portal-cateno-docs classic --typescript
cd portal-cateno-docs
```

## Passo 2 — Instalar plugins

```bash
npm install docusaurus-plugin-openapi-docs docusaurus-theme-openapi-docs
npm install @docusaurus/plugin-ideal-image
```

## Passo 3 — Configurar tema Cateno

Substituir `src/css/custom.css` com os tokens exatos do `cateno-design-system.jsx`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  /* Teal — escala completa */
  --ifm-color-primary:          #0D9488;  /* teal-600 — COR PRINCIPAL */
  --ifm-color-primary-dark:     #0F766E;  /* teal-700 — hover */
  --ifm-color-primary-darker:   #115E59;  /* teal-800 */
  --ifm-color-primary-darkest:  #134E4A;  /* teal-900 */
  --ifm-color-primary-light:    #14B8A6;  /* teal-500 */
  --ifm-color-primary-lighter:  #5EEAD4;  /* teal-300 — bordas ativas */
  --ifm-color-primary-lightest: #99F6E4;  /* teal-200 — hover leve */

  /* Tipografia */
  --ifm-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ifm-code-font-size: 90%;

  /* Background — igual ao portal */
  --ifm-background-color: #F0FDFA;           /* teal-50 */
  --ifm-background-surface-color: #FFFFFF;   /* neutral-0 — cards */

  /* Navbar — branco com borda */
  --ifm-navbar-background-color: #FFFFFF;
  --ifm-navbar-shadow: 0 1px 0 #E2E8F0;     /* neutral-200 */

  /* Bordas e textos */
  --ifm-color-emphasis-300: #E2E8F0;        /* neutral-200 */
  --ifm-color-emphasis-600: #64748B;        /* neutral-500 */

  /* Border radius */
  --ifm-global-radius: 8px;                /* radius-md */
  --ifm-code-border-radius: 6px;           /* radius-sm */

  /* Sombras */
  --ifm-global-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
}

[data-theme='dark'] {
  --ifm-color-primary:          #2DD4BF;  /* teal-400 */
  --ifm-color-primary-dark:     #14B8A6;  /* teal-500 */
  --ifm-color-primary-darker:   #0D9488;  /* teal-600 */
  --ifm-color-primary-darkest:  #0F766E;  /* teal-700 */
  --ifm-color-primary-light:    #5EEAD4;  /* teal-300 */
  --ifm-color-primary-lighter:  #99F6E4;  /* teal-200 */
  --ifm-color-primary-lightest: #CCFBF1;  /* teal-100 */
  --ifm-background-color:       #0F172A;  /* neutral-900 */
  --ifm-navbar-background-color: #1E293B; /* neutral-800 */
}
```

## Passo 4 — Configurar docusaurus.config.ts

Ver spec seção 4 para a configuração completa. Pontos críticos:

```typescript
// Apontar o OpenAPI spec para o arquivo do portal
config: {
  cateno: {
    specPath: '../portal-cateno/service-registry-openapi.yaml',
    outputDir: 'docs/api-reference',
    sidebarOptions: { groupPathsBy: 'tag' },
  },
},
```

> Ajustar o caminho `specPath` conforme onde os dois repositórios estão
> no sistema de arquivos.

## Passo 5 — Criar estrutura de docs

```bash
# Remover docs de exemplo do Docusaurus
rm -rf docs/

# Criar estrutura
mkdir -p docs/getting-started
mkdir -p docs/integrating
mkdir -p docs/api-reference
mkdir -p docs/catia
mkdir -p docs/guides
```

## Passo 6 — Escrever conteúdo por prioridade

### 6.1 Quickstart (PRIORIDADE MÁXIMA)

`docs/getting-started/quickstart.md` — O desenvolvedor deve conseguir:
1. Registrar seu microsserviço no catálogo
2. Configurar o health check
3. Ver o app aparecer no portal

Em 5 minutos, com exemplos curl prontos para copiar.

### 6.2 Tool Registry (SEGUNDA PRIORIDADE)

`docs/integrating/tool-registry.md` — O diferencial do portal:
- O que são Tools e como o CatIA as usa
- Contrato do `POST /api/tools/register`
- Como escrever descriptions que o LLM entende
- Exemplos para os 3 tipos de tool (listagem, criação, upload)
- Autenticação: o JWT do usuário é propagado automaticamente

### 6.3 Health Check

`docs/integrating/health-check.md`:
```markdown
## Contrato do endpoint /health

Seu microsserviço deve expor um endpoint GET /health que retorne:

### Online
HTTP 200
{ "status": "online" }

### Manutenção programada
HTTP 503
{ "status": "maintenance", "message": "Manutenção programada até 18h" }

### Offline
Qualquer erro de conexão ou HTTP 5xx sem body
```

### 6.4 Seções restantes

Escrever as demais seções conforme spec seção 2 (sidebar detalhada).

## Passo 7 — Página inicial com cards (estilo Ionic)

`src/pages/index.tsx` — quatro cards de quick access:

```tsx
const features = [
  {
    title: '🚀 Quickstart',
    description: 'Em 5 minutos seu microsserviço aparece no portal.',
    link: '/docs/getting-started/quickstart',
  },
  {
    title: '📋 Registrar Microsserviço',
    description: 'Passo a passo completo com exemplos de código.',
    link: '/docs/integrating/register-microservice',
  },
  {
    title: '🤖 CatIA Tools',
    description: 'Exponha seus dados e ações para o assistente de IA.',
    link: '/docs/catia/how-it-works',
  },
  {
    title: '📖 Referência da API',
    description: 'Endpoints, schemas e exemplos interativos.',
    link: '/docs/api-reference',
  },
];
```

## Passo 8 — Exemplos de código com tabs

Para cada endpoint relevante, usar o padrão de tabs do Docusaurus
com curl + TypeScript:

```mdx
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="curl" label="curl" default>
    ```bash
    curl -X POST https://portal.cateno.com.br/api/tools/register \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "applicationSlug": "meu-servico",
        "tools": [...]
      }'
    ```
  </TabItem>
  <TabItem value="typescript" label="TypeScript">
    ```typescript
    const response = await fetch('/api/tools/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ... }),
    });
    ```
  </TabItem>
</Tabs>
```

## Passo 9 — Deploy com GitHub Actions

Criar `.github/workflows/deploy-docs.yml` conforme spec seção 7.

```bash
git init
git add .
git commit -m "feat: portal cateno developer docs — initial setup"
# Criar repo no GitHub: portal-cateno-docs
git remote add origin https://github.com/[org]/portal-cateno-docs.git
git push -u origin main
```

## Critérios de aceite

- [ ] Repositório portal-cateno-docs criado e publicado
- [ ] Docusaurus 3 com tema Cateno (teal-600 + Inter)
- [ ] Página inicial com 4 cards estilo Ionic docs
- [ ] Quickstart: desenvolvedor registra microsserviço em 5 minutos
- [ ] Seção Tool Registry completa com exemplos
- [ ] Referência da API gerada do service-registry-openapi.yaml
- [ ] Exemplos curl + TypeScript em todos os endpoints
- [ ] Deploy automático via GitHub Actions configurado

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "documentation-writer", to: "devops-specialist", artifacts: ["portal-cateno-docs/"] })
```
