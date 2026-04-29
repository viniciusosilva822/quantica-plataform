import type { FastifyInstance } from 'fastify';
import {
  enneagramAnswerSchema,
  enneagramQuestions,
  enneagramTypes,
  computeEnneagram,
} from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const enneagramRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/enneagram/questions', async () => {
    return { questions: enneagramQuestions, types: enneagramTypes };
  });

  app.get('/enneagram/last', async (req) => {
    const result = await prisma.enneagramResult.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    return { result };
  });

  app.post('/enneagram', async (req) => {
    const body = enneagramAnswerSchema.parse(req.body);
    const { dominant, scores } = computeEnneagram(body.answers);
    const userId = req.user!.id;
    const created = await prisma.enneagramResult.create({
      data: {
        userId,
        dominant,
        scores: scores as unknown as object,
        answers: body.answers as unknown as object,
      },
    });
    await addXp(userId, 'enneagramComplete');
    const awarded: string[] = [];
    if (await grantBadge(userId, 'enneagram_done')) awarded.push('enneagram_done');
    return { result: created, dominant, scores, awarded };
  });
};
