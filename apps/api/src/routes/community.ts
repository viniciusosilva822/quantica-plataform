import type { FastifyInstance } from 'fastify';
import { postSchema, reactionSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const communityRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/community/posts', async () => {
    const items = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
        reactions: { select: { kind: true, userId: true } },
      },
    });
    return { items };
  });

  app.post('/community/posts', async (req) => {
    const body = postSchema.parse(req.body);
    const userId = req.user!.id;
    const created = await prisma.post.create({
      data: { ...body, userId },
      include: { user: { select: { id: true, name: true } }, reactions: true },
    });
    await addXp(userId, 'communityPost');
    const total = await prisma.post.count({ where: { userId } });
    const awarded: string[] = [];
    if (total === 1 && (await grantBadge(userId, 'community_first'))) awarded.push('community_first');
    return { post: created, awarded };
  });

  app.delete('/community/posts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return reply.code(404).send({ error: 'Não encontrado' });
    if (post.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Sem permissão' });
    }
    await prisma.post.delete({ where: { id } });
    return { ok: true };
  });

  app.post('/community/posts/:id/react', async (req) => {
    const { id } = req.params as { id: string };
    const body = reactionSchema.parse(req.body);
    const userId = req.user!.id;
    const existing = await prisma.reaction.findUnique({
      where: { postId_userId_kind: { postId: id, userId, kind: body.kind } },
    });
    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return { state: false };
    }
    await prisma.reaction.create({ data: { postId: id, userId, kind: body.kind } });
    return { state: true };
  });
};
