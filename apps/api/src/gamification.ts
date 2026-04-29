import { prisma } from './prisma.js';
import { xpRules, badgeDefs } from '@plataforma/shared';

export const addXp = async (userId: string, key: keyof typeof xpRules) => {
  const value = xpRules[key];
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: value } },
  });
};

export const grantBadge = async (userId: string, code: string) => {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return null;
  try {
    return await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });
  } catch {
    return null;
  }
};

export const ensureBadgeDefs = async () => {
  for (const b of badgeDefs) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, emoji: b.emoji },
      create: b,
    });
  }
};
