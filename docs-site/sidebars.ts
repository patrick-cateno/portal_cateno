import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/overview', 'getting-started/quickstart', 'getting-started/concepts'],
    },
    {
      type: 'category',
      label: 'Integrando com o Portal',
      items: [
        'integrating/register-microservice',
        'integrating/health-check',
        'integrating/tool-registry',
      ],
    },
    {
      type: 'category',
      label: 'Referência da API',
      items: ['api-reference/applications', 'api-reference/tools', 'api-reference/authentication'],
    },
    {
      type: 'category',
      label: 'CatIA',
      items: ['catia/how-it-works', 'catia/writing-tools'],
    },
    {
      type: 'category',
      label: 'Guias Avançados',
      items: ['guides/integration-types', 'guides/rbac', 'guides/troubleshooting'],
    },
    {
      type: 'category',
      label: 'Ferramentas de Desenvolvimento',
      items: ['dev-tools/claude-code'],
    },
  ],
};

export default sidebars;
