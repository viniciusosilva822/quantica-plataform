import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import {
  grantAccessSchema,
  mantraSchema,
  promptSchema,
  meditationSchema,
  libraryItemSchema,
  liveSchema,
} from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAdmin } from '../auth.js';

export const adminRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAdmin);

  app.get('/admin/metrics', async () => {
    const [users, active, refunded, checkinsToday, meditations, posts] = await Promise.all([
      prisma.user.count(),
      prisma.access.count({ where: { status: 'ACTIVE' } }),
      prisma.access.count({ where: { status: 'REFUNDED' } }),
      prisma.checkin.count({ where: { date: dayjs().startOf('day').toDate() } }),
      prisma.meditationLog.count({
        where: { createdAt: { gte: dayjs().startOf('day').toDate() } },
      }),
      prisma.post.count(),
    ]);
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { access: true },
    });
    return {
      counts: { users, active, refunded, checkinsToday, meditationsToday: meditations, posts },
      recentUsers,
    };
  });

  app.get('/admin/users', async (req) => {
    const { q } = req.query as { q?: string };
    const items = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { access: true },
    });
    return { items };
  });

  app.post('/admin/users/grant', async (req) => {
    const body = grantAccessSchema.parse(req.body);
    const email = body.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword: string | null = null;
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-10).toUpperCase();
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      user = await prisma.user.create({
        data: { email, name: body.name ?? email.split('@')[0], passwordHash },
      });
    }
    await prisma.access.upsert({
      where: { userId: user.id },
      update: { status: 'ACTIVE', revokedAt: null, productName: 'Liberado manualmente' },
      create: { userId: user.id, status: 'ACTIVE', productName: 'Liberado manualmente' },
    });
    return { ok: true, userId: user.id, tempPassword };
  });

  app.post('/admin/users/:id/revoke', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.access.update({
      where: { userId: id },
      data: { status: 'CANCELLED', revokedAt: new Date() },
    });
    return { ok: true };
  });

  app.post('/admin/users/:id/reactivate', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.access.update({
      where: { userId: id },
      data: { status: 'ACTIVE', revokedAt: null },
    });
    return { ok: true };
  });

  app.get('/admin/mantras', async () => {
    const items = await prisma.mantra.findMany({ orderBy: { createdAt: 'desc' } });
    return { items };
  });

  app.post('/admin/mantras', async (req) => {
    const body = mantraSchema.parse(req.body);
    const mantra = await prisma.mantra.create({ data: body });
    return { mantra };
  });

  app.delete('/admin/mantras/:id', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.mantra.delete({ where: { id } });
    return { ok: true };
  });

  app.get('/admin/prompts', async () => {
    const items = await prisma.diaryPrompt.findMany({ orderBy: { createdAt: 'desc' } });
    return { items };
  });

  app.post('/admin/prompts', async (req) => {
    const body = promptSchema.parse(req.body);
    const prompt = await prisma.diaryPrompt.create({ data: body });
    return { prompt };
  });

  app.delete('/admin/prompts/:id', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.diaryPrompt.delete({ where: { id } });
    return { ok: true };
  });

  app.get('/admin/meditations', async () => {
    const items = await prisma.meditation.findMany({ orderBy: { createdAt: 'desc' } });
    return { items };
  });

  app.post('/admin/meditations', async (req) => {
    const body = meditationSchema.parse(req.body);
    const med = await prisma.meditation.create({ data: body });
    return { meditation: med };
  });

  app.delete('/admin/meditations/:id', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.meditation.update({ where: { id }, data: { active: false } });
    return { ok: true };
  });

  app.get('/admin/library', async () => {
    const items = await prisma.libraryItem.findMany({ orderBy: { createdAt: 'desc' } });
    return { items };
  });

  app.post('/admin/library', async (req) => {
    const body = libraryItemSchema.parse(req.body);
    const item = await prisma.libraryItem.create({ data: body });
    return { item };
  });

  app.delete('/admin/library/:id', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.libraryItem.delete({ where: { id } });
    return { ok: true };
  });

  app.get('/admin/lives', async () => {
    const items = await prisma.live.findMany({ orderBy: { scheduledAt: 'desc' } });
    return { items };
  });

  app.post('/admin/lives', async (req) => {
    const body = liveSchema.parse(req.body);
    const live = await prisma.live.create({
      data: { ...body, scheduledAt: new Date(body.scheduledAt) },
    });
    return { live };
  });

  app.delete('/admin/lives/:id', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.live.delete({ where: { id } });
    return { ok: true };
  });
};
