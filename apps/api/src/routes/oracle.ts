import type { FastifyInstance } from 'fastify';
import { oracleDeck } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';
import { todayKey } from '../utils/date.js';

export const oracleRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/oracle/today', async (req) => {
    const userId = req.user!.id;
    const today = todayKey();
    const draw = await prisma.oracleDraw.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (!draw) return { draw: null, card: null };
    const card = oracleDeck.find((c) => c.id === draw.cardId);
    return { draw, card };
  });

  app.post('/oracle/draw', async (req, reply) => {
    const userId = req.user!.id;
    const today = todayKey();
    const existing = await prisma.oracleDraw.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      const card = oracleDeck.find((c) => c.id === existing.cardId);
      return reply.send({ draw: existing, card, alreadyDrawn: true });
    }
    const card = oracleDeck[Math.floor(Math.random() * oracleDeck.length)];
    const draw = await prisma.oracleDraw.create({
      data: { userId, date: today, cardId: card.id },
    });
    await addXp(userId, 'oracleDraw');
    const awarded: string[] = [];
    const total = await prisma.oracleDraw.count({ where: { userId } });
    if (total === 1 && (await grantBadge(userId, 'first_oracle'))) awarded.push('first_oracle');
    return { draw, card, awarded };
  });

  app.get('/oracle/history', async (req) => {
    const draws = await prisma.oracleDraw.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return {
      items: draws.map((d) => ({ ...d, card: oracleDeck.find((c) => c.id === d.cardId) })),
    };
  });
};
