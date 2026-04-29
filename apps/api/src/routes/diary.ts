import type { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { diaryEntrySchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp } from '../gamification.js';

export const diaryRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/diary/prompt', async () => {
    const prompts = await prisma.diaryPrompt.findMany();
    if (!prompts.length) return { prompt: null };
    const day = dayjs().diff(dayjs('2024-01-01'), 'day');
    const prompt = prompts[Math.abs(day) % prompts.length];
    return { prompt };
  });

  app.get('/diary/entries', async (req) => {
    const items = await prisma.diaryEntry.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { prompt: true },
    });
    return { items };
  });

  app.post('/diary/entries', async (req) => {
    const body = diaryEntrySchema.parse(req.body);
    const created = await prisma.diaryEntry.create({
      data: { ...body, userId: req.user!.id },
      include: { prompt: true },
    });
    await addXp(req.user!.id, 'diary');
    return { entry: created };
  });

  app.delete('/diary/entries/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== req.user!.id) return reply.code(404).send({ error: 'Não encontrado' });
    await prisma.diaryEntry.delete({ where: { id } });
    return { ok: true };
  });
};
