import type { FastifyInstance } from 'fastify';
import { breathingLogSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp } from '../gamification.js';

export const breathingRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.post('/breathing/log', async (req) => {
    const body = breathingLogSchema.parse(req.body);
    const log = await prisma.breathingLog.create({
      data: { ...body, userId: req.user!.id },
    });
    await addXp(req.user!.id, 'breathingLog');
    return { log };
  });

  app.get('/breathing/logs', async (req) => {
    const items = await prisma.breathingLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return { items };
  });
};
