import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from './prisma.js';

export type AuthUser = {
  id: string;
  role: 'STUDENT' | 'ADMIN';
  email: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      reply.code(401).send({ error: 'Não autenticado' });
      return;
    }
    const decoded = req.server.jwt.verify(token) as AuthUser;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { access: true },
    });
    if (!user) {
      reply.code(401).send({ error: 'Usuário não encontrado' });
      return;
    }
    if (user.role !== 'ADMIN') {
      if (!user.access || user.access.status !== 'ACTIVE') {
        reply.code(403).send({ error: 'Acesso bloqueado. Verifique sua compra.' });
        return;
      }
    }
    req.user = { id: user.id, role: user.role, email: user.email };
  } catch {
    reply.code(401).send({ error: 'Sessão inválida' });
  }
};

export const requireAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(req, reply);
  if (reply.sent) return;
  if (req.user?.role !== 'ADMIN') {
    reply.code(403).send({ error: 'Apenas admin' });
  }
};
