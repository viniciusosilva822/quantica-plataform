import type { FastifyInstance } from 'fastify';
import { nextLevelProgress } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';

export const gamificationRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/me/progress', async (req) => {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });
    const xp = user?.xp ?? 0;
    return { xp, ...nextLevelProgress(xp) };
  });

  app.get('/me/badges', async (req) => {
    const items = await prisma.userBadge.findMany({
      where: { userId: req.user!.id },
      orderBy: { awardedAt: 'desc' },
      include: { badge: true },
    });
    const all = await prisma.badge.findMany({ orderBy: { code: 'asc' } });
    const earned = new Set(items.map((i) => i.badge.code));
    return { earned: items, all: all.map((b) => ({ ...b, earned: earned.has(b.code) })) };
  });
};
