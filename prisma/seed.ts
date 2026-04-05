import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ──
  const categories = [
    { name: 'Cartões', slug: 'cartoes', icon: 'CreditCard', order: 1 },
    { name: 'Financeiro', slug: 'financeiro', icon: 'DollarSign', order: 2 },
    { name: 'Operações', slug: 'operacoes', icon: 'Settings', order: 3 },
    { name: 'Compliance', slug: 'compliance', icon: 'Shield', order: 4 },
    { name: 'Analytics', slug: 'analytics', icon: 'BarChart3', order: 5 },
    { name: 'Infraestrutura', slug: 'infraestrutura', icon: 'Server', order: 6 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  console.log(`✅ ${categories.length} categories seeded`);

  // ── Applications ──
  const applications = [
    {
      name: 'Gestão de Cartões',
      slug: 'gestao-cartoes',
      description: 'Gerenciamento completo de cartões, limites e bloqueios em tempo real.',
      icon: 'CreditCard',
      categorySlug: 'cartoes',
      status: 'online' as const,
      url: '/apps/gestao-cartoes',
      healthCheckUrl: 'https://cartoes.cateno.com.br/gestao/health',
      integrationType: 'redirect',
      userCount: 2340,
      trend: 12.5,
    },
    {
      name: 'Emissão de Cartões',
      slug: 'emissao-cartoes',
      description: 'Fluxo de emissão e personalização de novos cartões para clientes.',
      icon: 'PlusCircle',
      categorySlug: 'cartoes',
      status: 'online' as const,
      url: '/apps/emissao-cartoes',
      healthCheckUrl: 'https://cartoes.cateno.com.br/emissao/health',
      integrationType: 'redirect',
      userCount: 1890,
      trend: 8.3,
    },
    {
      name: 'Contestações',
      slug: 'contestacoes',
      description: 'Central de contestações e chargebacks com fluxo automatizado.',
      icon: 'AlertTriangle',
      categorySlug: 'cartoes',
      status: 'maintenance' as const,
      url: '/apps/contestacoes',
      healthCheckUrl: 'https://cartoes.cateno.com.br/contestacoes/health',
      integrationType: 'redirect',
      userCount: 980,
      trend: -2.1,
    },
    {
      name: 'Conciliação Financeira',
      slug: 'conciliacao-financeira',
      description: 'Conciliação automática de transações e fechamento contábil.',
      icon: 'DollarSign',
      categorySlug: 'financeiro',
      status: 'online' as const,
      url: '/apps/conciliacao-financeira',
      healthCheckUrl: 'https://financeiro.cateno.com.br/conciliacao/health',
      integrationType: 'redirect',
      userCount: 1560,
      trend: 5.7,
    },
    {
      name: 'Faturamento',
      slug: 'faturamento',
      description: 'Geração e gestão de faturas, cobranças e pagamentos.',
      icon: 'FileText',
      categorySlug: 'financeiro',
      status: 'online' as const,
      url: '/apps/faturamento',
      healthCheckUrl: 'https://financeiro.cateno.com.br/faturamento/health',
      integrationType: 'redirect',
      userCount: 2100,
      trend: 3.2,
    },
    {
      name: 'Tesouraria',
      slug: 'tesouraria',
      description: 'Controle de fluxo de caixa, investimentos e liquidez.',
      icon: 'Landmark',
      categorySlug: 'financeiro',
      status: 'offline' as const,
      url: '/apps/tesouraria',
      healthCheckUrl: 'https://financeiro.cateno.com.br/tesouraria/health',
      integrationType: 'redirect',
      userCount: 450,
      trend: 0,
    },
    {
      name: 'BIN Manager',
      slug: 'bin-manager',
      description: 'Gerenciamento de faixas BIN e configuração de bandeiras.',
      icon: 'Settings',
      categorySlug: 'operacoes',
      status: 'online' as const,
      url: '/apps/bin-manager',
      healthCheckUrl: 'https://operacoes.cateno.com.br/bin-manager/health',
      integrationType: 'redirect',
      userCount: 320,
      trend: 1.8,
    },
    {
      name: 'Processamento',
      slug: 'processamento',
      description: 'Monitoramento de processamento de transações em tempo real.',
      icon: 'Activity',
      categorySlug: 'operacoes',
      status: 'online' as const,
      url: '/apps/processamento',
      healthCheckUrl: 'https://operacoes.cateno.com.br/processamento/health',
      integrationType: 'embed',
      userCount: 780,
      trend: 15.2,
    },
    {
      name: 'PLD/FT',
      slug: 'pld-ft',
      description: 'Prevenção à lavagem de dinheiro e financiamento ao terrorismo.',
      icon: 'Shield',
      categorySlug: 'compliance',
      status: 'online' as const,
      url: '/apps/pld-ft',
      healthCheckUrl: 'https://compliance.cateno.com.br/pld-ft/health',
      integrationType: 'redirect',
      userCount: 640,
      trend: 7.9,
    },
    {
      name: 'KYC',
      slug: 'kyc',
      description: 'Know Your Customer — validação e enriquecimento cadastral.',
      icon: 'UserCheck',
      categorySlug: 'compliance',
      status: 'online' as const,
      url: '/apps/kyc',
      healthCheckUrl: 'https://compliance.cateno.com.br/kyc/health',
      integrationType: 'redirect',
      userCount: 1120,
      trend: 22.4,
    },
    {
      name: 'Dashboard Executivo',
      slug: 'dashboard-executivo',
      description: 'Painel consolidado com KPIs, métricas e indicadores do negócio.',
      icon: 'BarChart3',
      categorySlug: 'analytics',
      status: 'online' as const,
      url: '/apps/dashboard-executivo',
      healthCheckUrl: 'https://analytics.cateno.com.br/dashboard/health',
      integrationType: 'embed',
      userCount: 3200,
      trend: 18.6,
    },
    {
      name: 'Relatórios',
      slug: 'relatorios',
      description: 'Geração de relatórios customizados e exportação de dados.',
      icon: 'FileBarChart',
      categorySlug: 'analytics',
      status: 'online' as const,
      url: '/apps/relatorios',
      healthCheckUrl: 'https://analytics.cateno.com.br/relatorios/health',
      integrationType: 'redirect',
      userCount: 1750,
      trend: 4.1,
    },
    {
      name: 'API Gateway',
      slug: 'api-gateway',
      description: 'Gerenciamento de APIs, rate limiting e monitoramento de tráfego.',
      icon: 'Globe',
      categorySlug: 'infraestrutura',
      status: 'online' as const,
      url: '/apps/api-gateway',
      healthCheckUrl: 'https://infra.cateno.com.br/api-gateway/health',
      integrationType: 'redirect',
      userCount: 280,
      trend: 9.3,
    },
    {
      name: 'Monitoramento',
      slug: 'monitoramento',
      description: 'Observabilidade da infraestrutura, alertas e métricas de sistema.',
      icon: 'Monitor',
      categorySlug: 'infraestrutura',
      status: 'online' as const,
      url: '/apps/monitoramento',
      healthCheckUrl: 'https://infra.cateno.com.br/monitoramento/health',
      integrationType: 'embed',
      userCount: 190,
      trend: 6.5,
    },
  ];

  for (const app of applications) {
    const { categorySlug, ...appData } = app;
    const categoryId = categoryMap[categorySlug];

    await prisma.application.upsert({
      where: { slug: appData.slug },
      update: {},
      create: {
        ...appData,
        categoryId,
      },
    });
  }

  console.log(`✅ ${applications.length} applications seeded`);

  // ── Microservice Tools (example: gestao-cartoes) ──
  const gestaoCartoes = await prisma.application.findUnique({ where: { slug: 'gestao-cartoes' } });

  if (gestaoCartoes) {
    const tools = [
      {
        applicationId: gestaoCartoes.id,
        name: 'consultar_cartao',
        description:
          'Consulta dados de um cartão pelo número ou CPF do titular. Use quando o usuário perguntar sobre um cartão específico.',
        inputSchema: {
          type: 'object',
          required: ['identificador'],
          properties: {
            identificador: { type: 'string', description: 'Número do cartão ou CPF do titular' },
          },
        },
        endpoint: 'https://cartoes.cateno.com.br/api/cartoes/consulta',
        method: 'GET',
        requiredRole: 'user',
      },
      {
        applicationId: gestaoCartoes.id,
        name: 'bloquear_cartao',
        description:
          'Bloqueia um cartão por perda, roubo ou suspeita de fraude. Use quando o usuário pedir para bloquear um cartão.',
        inputSchema: {
          type: 'object',
          required: ['cartao_id', 'motivo'],
          properties: {
            cartao_id: { type: 'string', description: 'ID do cartão' },
            motivo: {
              type: 'string',
              enum: ['perda', 'roubo', 'fraude', 'outros'],
              description: 'Motivo do bloqueio',
            },
          },
        },
        endpoint: 'https://cartoes.cateno.com.br/api/cartoes/bloquear',
        method: 'POST',
        requiredRole: 'user',
      },
    ];

    for (const tool of tools) {
      await prisma.microserviceTool.upsert({
        where: { applicationId_name: { applicationId: tool.applicationId, name: tool.name } },
        update: {},
        create: tool,
      });
    }

    console.log(`✅ ${tools.length} microservice tools seeded`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
