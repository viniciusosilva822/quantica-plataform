import type { FastifyInstance } from 'fastify';
import { wheelEntrySchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const wheelRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/wheel', async (req) => {
    const items = await prisma.wheelEntry.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return { items };
  });

  app.post('/wheel', async (req) => {
    const body = wheelEntrySchema.parse(req.body);
    const userId = req.user!.id;
    const created = await prisma.wheelEntry.create({
      data: { userId, scores: body.scores },
    });
    await addXp(userId, 'wheelEntry');
    const total = await prisma.wheelEntry.count({ where: { userId } });
    const awarded: string[] = [];
    if (total === 1 && (await grantBadge(userId, 'first_wheel'))) awarded.push('first_wheel');
    return { entry: created, awarded };
  });
};
