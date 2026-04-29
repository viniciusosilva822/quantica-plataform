import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { loginSchema, changePasswordSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { env } from '../env.js';

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { access: true },
    });
    if (!user) return reply.code(401).send({ error: 'Credenciais inválidas' });
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: 'Credenciais inválidas' });

    if (user.role !== 'ADMIN' && (!user.access || user.access.status !== 'ACTIVE')) {
      return reply.code(403).send({ error: 'Sua compra ainda não está ativa. Verifique seu e-mail.' });
    }

    const token = app.jwt.sign({ id: user.id, role: user.role, email: user.email });
    reply
      .setCookie('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      })
      .send({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp },
      });
  });

  app.post('/auth/logout', async (_req, reply) => {
    reply.clearCookie('token', { path: '/' }).send({ ok: true });
  });

  app.get('/auth/me', { preHandler: requireAuth }, async (req) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        access: { select: { status: true, productName: true, approvedAt: true } },
      },
    });
    return { user };
  });

  app.post('/auth/change-password', { preHandler: requireAuth }, async (req, reply) => {
    const body = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' });
    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) return reply.code(400).send({ error: 'Senha atual inválida' });
    const hash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    return { ok: true };
  });
};
