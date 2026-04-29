import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';

export const liveRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/lives', async () => {
    const now = new Date();
    const upcoming = await prisma.live.findMany({
      where: { scheduledAt: { gte: now } },
      orderBy: { scheduledAt: 'asc' },
    });
    const past = await prisma.live.findMany({
      where: { scheduledAt: { lt: now } },
      orderBy: { scheduledAt: 'desc' },
      take: 30,
    });
    return { upcoming, past };
  });
};
