import type { FastifyInstance } from 'fastify';
import {
  chakraAnswerSchema,
  chakraQuestions,
  chakraInfo,
  computeChakraScores,
} from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { addXp, grantBadge } from '../gamification.js';

export const chakraRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth);

  app.get('/chakras/questions', async () => {
    return { questions: chakraQuestions, info: chakraInfo };
  });

  app.get('/chakras/last', async (req) => {
    const result = await prisma.chakraResult.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    return { result };
  });

  app.post('/chakras', async (req) => {
    const body = chakraAnswerSchema.parse(req.body);
    const scores = computeChakraScores(body.answers);
    const userId = req.user!.id;
    const created = await prisma.chakraResult.create({
      data: { userId, scores: scores as unknown as object, answers: body.answers as unknown as object },
    });
    await addXp(userId, 'chakraDiagnose');
    const awarded: string[] = [];
    if (await grantBadge(userId, 'chakras_done')) awarded.push('chakras_done');
    return { result: created, scores, awarded };
  });
};
