export const xpRules = {
  checkin: 10,
  diary: 15,
  habitToggle: 5,
  meditationLog: 20,
  breathingLog: 10,
  wheelEntry: 25,
  oracleDraw: 8,
  chakraDiagnose: 30,
  enneagramComplete: 30,
  numerologyMap: 20,
  communityPost: 12,
};

export const levelForXp = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
export const xpForLevel = (level: number) => Math.pow(level - 1, 2) * 50;
export const nextLevelProgress = (xp: number) => {
  const lvl = levelForXp(xp);
  const cur = xpForLevel(lvl);
  const next = xpForLevel(lvl + 1);
  return { level: lvl, current: xp - cur, total: next - cur };
};

export type BadgeDef = {
  code: string;
  name: string;
  description: string;
  emoji: string;
};

export const badgeDefs: BadgeDef[] = [
  { code: 'first_checkin', name: 'Primeiro Despertar', description: 'Fez seu primeiro check-in', emoji: '🌅' },
  { code: 'streak_7', name: 'Constância de 7', description: 'Check-in por 7 dias seguidos', emoji: '🔥' },
  { code: 'streak_30', name: 'Disciplina Lunar', description: '30 dias seguidos de check-in', emoji: '🌕' },
  { code: 'first_meditation', name: 'Silêncio Sagrado', description: 'Concluiu sua primeira meditação', emoji: '🧘' },
  { code: 'meditation_60', name: 'Hora Quântica', description: 'Acumulou 60 minutos de meditação', emoji: '⏳' },
  { code: 'meditation_600', name: 'Mente Cristal', description: '600 minutos meditados', emoji: '💎' },
  { code: 'first_wheel', name: 'Roda Inicial', description: 'Primeira Roda da Vida', emoji: '🎡' },
  { code: 'first_oracle', name: 'Primeira Carta', description: 'Tirou sua primeira carta do oráculo', emoji: '🃏' },
  { code: 'numerology_done', name: 'Mapa Pessoal', description: 'Gerou seu mapa numerológico', emoji: '🔢' },
  { code: 'chakras_done', name: 'Sete Centros', description: 'Concluiu o diagnóstico de chakras', emoji: '🌈' },
  { code: 'enneagram_done', name: 'Auto-conhecimento', description: 'Concluiu o eneagrama', emoji: '🧭' },
  { code: 'community_first', name: 'Voz na Comunidade', description: 'Primeira publicação no mural', emoji: '💬' },
];
