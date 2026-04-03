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

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} categories seeded`);
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
