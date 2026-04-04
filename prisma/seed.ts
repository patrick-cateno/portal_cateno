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
      status: 'online',
      url: '/apps/gestao-cartoes',
      userCount: 2340,
      trend: 12.5,
    },
    {
      name: 'Emissão de Cartões',
      slug: 'emissao-cartoes',
      description: 'Fluxo de emissão e personalização de novos cartões para clientes.',
      icon: 'PlusCircle',
      categorySlug: 'cartoes',
      status: 'online',
      url: '/apps/emissao-cartoes',
      userCount: 1890,
      trend: 8.3,
    },
    {
      name: 'Contestações',
      slug: 'contestacoes',
      description: 'Central de contestações e chargebacks com fluxo automatizado.',
      icon: 'AlertTriangle',
      categorySlug: 'cartoes',
      status: 'maintenance',
      url: '/apps/contestacoes',
      userCount: 980,
      trend: -2.1,
    },
    {
      name: 'Conciliação Financeira',
      slug: 'conciliacao-financeira',
      description: 'Conciliação automática de transações e fechamento contábil.',
      icon: 'DollarSign',
      categorySlug: 'financeiro',
      status: 'online',
      url: '/apps/conciliacao-financeira',
      userCount: 1560,
      trend: 5.7,
    },
    {
      name: 'Faturamento',
      slug: 'faturamento',
      description: 'Geração e gestão de faturas, cobranças e pagamentos.',
      icon: 'FileText',
      categorySlug: 'financeiro',
      status: 'online',
      url: '/apps/faturamento',
      userCount: 2100,
      trend: 3.2,
    },
    {
      name: 'Tesouraria',
      slug: 'tesouraria',
      description: 'Controle de fluxo de caixa, investimentos e liquidez.',
      icon: 'Landmark',
      categorySlug: 'financeiro',
      status: 'offline',
      url: '/apps/tesouraria',
      userCount: 450,
      trend: 0,
    },
    {
      name: 'BIN Manager',
      slug: 'bin-manager',
      description: 'Gerenciamento de faixas BIN e configuração de bandeiras.',
      icon: 'Settings',
      categorySlug: 'operacoes',
      status: 'online',
      url: '/apps/bin-manager',
      userCount: 320,
      trend: 1.8,
    },
    {
      name: 'Processamento',
      slug: 'processamento',
      description: 'Monitoramento de processamento de transações em tempo real.',
      icon: 'Activity',
      categorySlug: 'operacoes',
      status: 'online',
      url: '/apps/processamento',
      userCount: 780,
      trend: 15.2,
    },
    {
      name: 'PLD/FT',
      slug: 'pld-ft',
      description: 'Prevenção à lavagem de dinheiro e financiamento ao terrorismo.',
      icon: 'Shield',
      categorySlug: 'compliance',
      status: 'online',
      url: '/apps/pld-ft',
      userCount: 640,
      trend: 7.9,
    },
    {
      name: 'KYC',
      slug: 'kyc',
      description: 'Know Your Customer — validação e enriquecimento cadastral.',
      icon: 'UserCheck',
      categorySlug: 'compliance',
      status: 'online',
      url: '/apps/kyc',
      userCount: 1120,
      trend: 22.4,
    },
    {
      name: 'Dashboard Executivo',
      slug: 'dashboard-executivo',
      description: 'Painel consolidado com KPIs, métricas e indicadores do negócio.',
      icon: 'BarChart3',
      categorySlug: 'analytics',
      status: 'online',
      url: '/apps/dashboard-executivo',
      userCount: 3200,
      trend: 18.6,
    },
    {
      name: 'Relatórios',
      slug: 'relatorios',
      description: 'Geração de relatórios customizados e exportação de dados.',
      icon: 'FileBarChart',
      categorySlug: 'analytics',
      status: 'online',
      url: '/apps/relatorios',
      userCount: 1750,
      trend: 4.1,
    },
    {
      name: 'API Gateway',
      slug: 'api-gateway',
      description: 'Gerenciamento de APIs, rate limiting e monitoramento de tráfego.',
      icon: 'Globe',
      categorySlug: 'infraestrutura',
      status: 'online',
      url: '/apps/api-gateway',
      userCount: 280,
      trend: 9.3,
    },
    {
      name: 'Monitoramento',
      slug: 'monitoramento',
      description: 'Observabilidade da infraestrutura, alertas e métricas de sistema.',
      icon: 'Monitor',
      categorySlug: 'infraestrutura',
      status: 'online',
      url: '/apps/monitoramento',
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
