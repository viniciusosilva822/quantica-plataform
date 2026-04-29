import type { FastifyInstance } from 'fastify';
import { meditationLogSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const meditationRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/meditations', async (req) => {
    const { category } = req.query as { category?: string };
    const items = await prisma.meditation.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  });

  app.get('/meditations/stats', async (req) => {
    const userId = req.user!.id;
    const logs = await prisma.meditationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
    const totalSec = logs.reduce((a, b) => a + b.durationSec, 0);
    const totalSessions = logs.length;
    const days = new Set(logs.map((l) => l.createdAt.toISOString().slice(0, 10)));
    return {
      totalMinutes: Math.round(totalSec / 60),
      totalSessions,
      uniqueDays: days.size,
      recent: logs.slice(0, 10),
    };
  });

  app.post('/meditations/log', async (req) => {
    const body = meditationLogSchema.parse(req.body);
    const userId = req.user!.id;
    const log = await prisma.meditationLog.create({
      data: { ...body, userId },
    });
    await addXp(userId, 'meditationLog');

    const awarded: string[] = [];
    const total = await prisma.meditationLog.count({ where: { userId } });
    if (total === 1 && (await grantBadge(userId, 'first_meditation'))) awarded.push('first_meditation');
    const totalSecAgg = await prisma.meditationLog.aggregate({
      where: { userId },
      _sum: { durationSec: true },
    });
    const totalMin = (totalSecAgg._sum.durationSec ?? 0) / 60;
    if (totalMin >= 60 && (await grantBadge(userId, 'meditation_60'))) awarded.push('meditation_60');
    if (totalMin >= 600 && (await grantBadge(userId, 'meditation_600'))) awarded.push('meditation_600');

    return { log, awarded };
  });
};
