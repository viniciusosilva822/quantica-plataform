import type { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { habitSchema, habitToggleSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp } from '../gamification.js';
import { dayKey } from '../utils/date.js';

export const habitRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/habits', async (req) => {
    const userId = req.user!.id;
    const since = dayjs().subtract(6, 'day').startOf('day').toDate();
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      orderBy: { createdAt: 'asc' },
      include: {
        toggles: {
          where: { date: { gte: since } },
          select: { date: true },
        },
      },
    });
    return { items: habits };
  });

  app.post('/habits', async (req) => {
    const body = habitSchema.parse(req.body);
    const created = await prisma.habit.create({
      data: { ...body, userId: req.user!.id },
    });
    return { habit: created };
  });

  app.patch('/habits/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = habitSchema.partial().parse(req.body);
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== req.user!.id) return reply.code(404).send({ error: 'Não encontrado' });
    const updated = await prisma.habit.update({ where: { id }, data: body });
    return { habit: updated };
  });

  app.delete('/habits/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== req.user!.id) return reply.code(404).send({ error: 'Não encontrado' });
    await prisma.habit.update({ where: { id }, data: { archived: true } });
    return { ok: true };
  });

  app.post('/habits/:id/toggle', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = habitToggleSchema.parse(req.body);
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== req.user!.id) return reply.code(404).send({ error: 'Não encontrado' });
    const date = dayKey(body.date);
    const existing = await prisma.habitToggle.findUnique({
      where: { habitId_date: { habitId: id, date } },
    });
    if (existing) {
      await prisma.habitToggle.delete({ where: { id: existing.id } });
      return { state: false };
    }
    await prisma.habitToggle.create({
      data: { habitId: id, userId: req.user!.id, date },
    });
    await addXp(req.user!.id, 'habitToggle');
    return { state: true };
  });
};
