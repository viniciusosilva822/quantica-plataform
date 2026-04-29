import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { env } from './env.js';
import { authRoutes } from './routes/auth.js';
import { checkinRoutes } from './routes/checkin.js';
import { diaryRoutes } from './routes/diary.js';
import { habitRoutes } from './routes/habits.js';
import { meditationRoutes } from './routes/meditation.js';
import { breathingRoutes } from './routes/breathing.js';
import { wheelRoutes } from './routes/wheel.js';
import { oracleRoutes } from './routes/oracle.js';
import { numerologyRoutes } from './routes/numerology.js';
import { chakraRoutes } from './routes/chakras.js';
import { enneagramRoutes } from './routes/enneagram.js';
import { libraryRoutes } from './routes/library.js';
import { liveRoutes } from './routes/lives.js';
import { communityRoutes } from './routes/community.js';
import { gamificationRoutes } from './routes/gamification.js';
import { mantraRoutes } from './routes/mantra.js';
import { hotmartRoutes } from './routes/hotmart.js';
import { adminRoutes } from './routes/admin.js';

const buildServer = async () => {
  const app = Fastify({ logger: { level: env.NODE_ENV === 'production' ? 'info' : 'warn' } });

  await app.register(cors, {
    origin: [env.WEB_URL, 'http://localhost:3000'],
    credentials: true,
  });
  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'token', signed: false },
  });

  app.setErrorHandler((err: FastifyError, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'Dados inválidos', issues: err.flatten() });
    }
    app.log.error(err);
    return reply.code(err.statusCode ?? 500).send({ error: err.message ?? 'Erro interno' });
  });

  app.get('/health', async () => ({ ok: true, ts: Date.now() }));

  await app.register(authRoutes);
  await app.register(checkinRoutes);
  await app.register(diaryRoutes);
  await app.register(habitRoutes);
  await app.register(meditationRoutes);
  await app.register(breathingRoutes);
  await app.register(wheelRoutes);
  await app.register(oracleRoutes);
  await app.register(numerologyRoutes);
  await app.register(chakraRoutes);
  await app.register(enneagramRoutes);
  await app.register(libraryRoutes);
  await app.register(liveRoutes);
  await app.register(communityRoutes);
  await app.register(gamificationRoutes);
  await app.register(mantraRoutes);
  await app.register(hotmartRoutes);
  await app.register(adminRoutes);

  return app;
};

const start = async () => {
  const app = await buildServer();
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`API em http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
