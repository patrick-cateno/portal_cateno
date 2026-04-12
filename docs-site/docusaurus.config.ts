import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Portal Cateno — Developer Docs',
  tagline: 'Integre seus microsserviços ao portal em minutos',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.cateno.com.br',
  baseUrl: '/',

  organizationName: 'patrick-cateno',
  projectName: 'portal-cateno-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/patrick-cateno/portal_cateno/edit/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/cateno-social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Portal Cateno',
      logo: {
        alt: 'Cateno Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Getting Started',
        },
        {
          to: '/docs/integrating/register-microservice',
          label: 'Integrando',
          position: 'left',
        },
        {
          to: '/docs/api-reference/applications',
          label: 'Referência da API',
          position: 'left',
        },
        {
          to: '/docs/catia/how-it-works',
          label: 'CatIA',
          position: 'left',
        },
        {
          href: 'https://github.com/patrick-cateno/portal_cateno',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            { label: 'Quickstart', to: '/docs/getting-started/quickstart' },
            { label: 'Referência da API', to: '/docs/api-reference/applications' },
          ],
        },
        {
          title: 'Integração',
          items: [
            { label: 'Registrar Microsserviço', to: '/docs/integrating/register-microservice' },
            { label: 'CatIA Tools', to: '/docs/catia/how-it-works' },
            { label: 'Health Check', to: '/docs/integrating/health-check' },
          ],
        },
        {
          title: 'Mais',
          items: [{ label: 'GitHub', href: 'https://github.com/patrick-cateno/portal_cateno' }],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cateno. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
