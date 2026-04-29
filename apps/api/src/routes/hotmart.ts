import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { hotmartWebhookSchema } from '@plataforma/shared';
import { prisma } from '../prisma.js';
import { env } from '../env.js';

const generateTempPassword = () => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 10; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
};

export const hotmartRoutes = async (app: FastifyInstance) => {
  app.post('/webhooks/hotmart', async (req, reply) => {
    const token = req.headers['x-hotmart-hottok'];
    if (token !== env.HOTMART_WEBHOOK_TOKEN) {
      return reply.code(401).send({ error: 'Token inválido' });
    }
    const parsed = hotmartWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Payload inválido', issues: parsed.error.flatten() });
    }
    const { event, data } = parsed.data;
    const email = data.buyer.email.toLowerCase();
    const name = data.buyer.name ?? email.split('@')[0];

    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
      let user = await prisma.user.findUnique({ where: { email }, include: { access: true } });
      let tempPassword: string | null = null;
      if (!user) {
        tempPassword = generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        user = await prisma.user.create({
          data: { email, name, passwordHash },
          include: { access: true },
        });
      }
      await prisma.access.upsert({
        where: { userId: user.id },
        update: {
          status: 'ACTIVE',
          hotmartTxn: data.purchase?.transaction,
          productName: data.product?.name,
          revokedAt: null,
        },
        create: {
          userId: user.id,
          status: 'ACTIVE',
          hotmartTxn: data.purchase?.transaction,
          productName: data.product?.name,
        },
      });
      return reply.send({ ok: true, userId: user.id, tempPassword });
    }

    if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CHARGEBACK' || event === 'PURCHASE_CANCELED') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return reply.send({ ok: true, ignored: true });
      const status = event === 'PURCHASE_REFUNDED' ? 'REFUNDED' : event === 'PURCHASE_CHARGEBACK' ? 'REFUNDED' : 'CANCELLED';
      await prisma.access.update({
        where: { userId: user.id },
        data: { status, revokedAt: new Date() },
      });
      return reply.send({ ok: true, userId: user.id, status });
    }

    return reply.send({ ok: true });
  });
};
