import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';

export const libraryRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/library', async (req) => {
    const { kind, q } = req.query as { kind?: string; q?: string };
    const items = await prisma.libraryItem.findMany({
      where: {
        ...(kind ? { kind: kind as 'ebook' | 'audio' | 'video' | 'artigo' } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  });
};
