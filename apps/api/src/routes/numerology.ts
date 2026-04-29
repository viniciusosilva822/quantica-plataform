import type { FastifyInstance } from 'fastify';
import { numerologyInputSchema, calculateNumerology } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const numerologyRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/numerology/last', async (req) => {
    const map = await prisma.numerologyMap.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    return { map };
  });

  app.post('/numerology', async (req) => {
    const body = numerologyInputSchema.parse(req.body);
    const result = calculateNumerology(body);
    const userId = req.user!.id;
    const created = await prisma.numerologyMap.create({
      data: {
        userId,
        fullName: body.fullName,
        birthDate: new Date(body.birthDate),
        result: result as unknown as object,
      },
    });
    await addXp(userId, 'numerologyMap');
    const awarded: string[] = [];
    if (await grantBadge(userId, 'numerology_done')) awarded.push('numerology_done');
    return { map: created, result, awarded };
  });
};
