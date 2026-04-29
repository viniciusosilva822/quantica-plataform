import type { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { checkinSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';
import { todayKey } from '../utils/date.js';

const computeStreak = async (userId: string) => {
  const checkins = await prisma.checkin.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
    take: 60,
  });
  let streak = 0;
  let cursor = dayjs().startOf('day');
  for (const c of checkins) {
    const d = dayjs(c.date).startOf('day');
    if (d.isSame(cursor)) {
      streak++;
      cursor = cursor.subtract(1, 'day');
    } else if (d.isBefore(cursor)) {
      break;
    }
  }
  return streak;
};

export const checkinRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/checkins', async (req) => {
    const userId = req.user!.id;
    const list = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 60,
    });
    const streak = await computeStreak(userId);
    return { items: list, streak };
  });

  app.get('/checkins/today', async (req) => {
    const today = await prisma.checkin.findUnique({
      where: { userId_date: { userId: req.user!.id, date: todayKey() } },
    });
    return { checkin: today };
  });

  app.post('/checkins', async (req, reply) => {
    const body = checkinSchema.parse(req.body);
    const userId = req.user!.id;
    const today = todayKey();
    const existing = await prisma.checkin.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      const updated = await prisma.checkin.update({
        where: { id: existing.id },
        data: { mood: body.mood, energy: body.energy, note: body.note },
      });
      return reply.send({ checkin: updated, awarded: [] });
    }
    const created = await prisma.checkin.create({
      data: { userId, date: today, ...body },
    });
    await addXp(userId, 'checkin');

    const awarded: string[] = [];
    const total = await prisma.checkin.count({ where: { userId } });
    if (total === 1 && (await grantBadge(userId, 'first_checkin'))) awarded.push('first_checkin');
    const streak = await computeStreak(userId);
    if (streak >= 7 && (await grantBadge(userId, 'streak_7'))) awarded.push('streak_7');
    if (streak >= 30 && (await grantBadge(userId, 'streak_30'))) awarded.push('streak_30');

    return reply.send({ checkin: created, streak, awarded });
  });
};
