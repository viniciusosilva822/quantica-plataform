import type { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';

export const mantraRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/mantra/today', async () => {
    const all = await prisma.mantra.findMany({ where: { active: true } });
    if (!all.length) return { mantra: null };
    const idx = Math.abs(dayjs().diff(dayjs('2024-01-01'), 'day')) % all.length;
    return { mantra: all[idx] };
  });
};
