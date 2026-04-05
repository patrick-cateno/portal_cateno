import cron from 'node-cron';
import { prisma } from './db';

export function startCleanupJobs() {
  // Limpar app_health com mais de 7 dias — roda todo dia às 02h
  cron.schedule('0 2 * * *', async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const deleted = await prisma.appHealth.deleteMany({
      where: { checkedAt: { lt: cutoff } },
    });
    console.log(`[cleanup] app_health: ${deleted.count} registros removidos`);
  });

  // Limpar app_metrics com mais de 90 dias — roda todo domingo às 03h
  cron.schedule('0 3 * * 0', async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const deleted = await prisma.appMetrics.deleteMany({
      where: { recordedAt: { lt: cutoff } },
    });
    console.log(`[cleanup] app_metrics: ${deleted.count} registros removidos`);
  });

  console.log('[cleanup] Jobs de retenção iniciados');
}
