import { z } from 'zod';

export const chakraKeys = [
  'raiz',
  'sacro',
  'plexo',
  'cardiaco',
  'laringeo',
  'frontal',
  'coronario',
] as const;

export type ChakraKey = (typeof chakraKeys)[number];

export const chakraInfo: Record<
  ChakraKey,
  { name: string; color: string; element: string; practice: string }
> = {
  raiz: {
    name: 'Raiz (Muladhara)',
    color: '#dc2626',
    element: 'Terra',
    practice: 'Caminhada descalço, alimentação consciente, exercícios de aterramento.',
  },
  sacro: {
    name: 'Sacro (Svadhisthana)',
    color: '#ea580c',
    element: 'Água',
    practice: 'Dança livre, banho longo, prazer estético, criatividade.',
  },
  plexo: {
    name: 'Plexo Solar (Manipura)',
    color: '#eab308',
    element: 'Fogo',
    practice: 'Respiração de fogo, exposição ao sol, decisões pequenas com firmeza.',
  },
  cardiaco: {
    name: 'Cardíaco (Anahata)',
    color: '#16a34a',
    element: 'Ar',
    practice: 'Práticas de gratidão, perdão, abrir o peito (expansão torácica).',
  },
  laringeo: {
    name: 'Laríngeo (Vishuddha)',
    color: '#0284c7',
    element: 'Éter',
    practice: 'Cantar, mantras, expressar verdades guardadas.',
  },
  frontal: {
    name: 'Terceiro Olho (Ajna)',
    color: '#4338ca',
    element: 'Luz',
    practice: 'Meditação silenciosa, journaling de sonhos, contemplação.',
  },
  coronario: {
    name: 'Coroa (Sahasrara)',
    color: '#9333ea',
    element: 'Consciência',
    practice: 'Silêncio, oração, conexão com algo maior.',
  },
};

export type ChakraQuestion = { id: number; chakra: ChakraKey; text: string };

export const chakraQuestions: ChakraQuestion[] = [
  { id: 1, chakra: 'raiz', text: 'Sinto-me seguro(a) em minha vida material e estabilidade financeira.' },
  { id: 2, chakra: 'raiz', text: 'Tenho boa relação com meu corpo e necessidades básicas.' },
  { id: 3, chakra: 'raiz', text: 'Sinto pertencimento a um lugar ou comunidade.' },
  { id: 4, chakra: 'sacro', text: 'Permito-me sentir prazer e expressar afeto.' },
  { id: 5, chakra: 'sacro', text: 'Tenho criatividade fluindo em minhas atividades.' },
  { id: 6, chakra: 'sacro', text: 'Sinto-me confortável com minha sexualidade e emoções.' },
  { id: 7, chakra: 'plexo', text: 'Confio nas minhas decisões e tenho autoestima.' },
  { id: 8, chakra: 'plexo', text: 'Sinto-me capaz de realizar meus objetivos.' },
  { id: 9, chakra: 'plexo', text: 'Imponho limites saudáveis com facilidade.' },
  { id: 10, chakra: 'cardiaco', text: 'Amo e sou amado(a) com facilidade.' },
  { id: 11, chakra: 'cardiaco', text: 'Pratico compaixão comigo e com os outros.' },
  { id: 12, chakra: 'cardiaco', text: 'Perdoo e me sinto perdoado(a).' },
  { id: 13, chakra: 'laringeo', text: 'Expresso o que penso e sinto sem medo.' },
  { id: 14, chakra: 'laringeo', text: 'Sei dizer não quando preciso.' },
  { id: 15, chakra: 'laringeo', text: 'Sinto que minha voz é ouvida.' },
  { id: 16, chakra: 'frontal', text: 'Confio na minha intuição.' },
  { id: 17, chakra: 'frontal', text: 'Tenho clareza sobre meus propósitos.' },
  { id: 18, chakra: 'frontal', text: 'Consigo visualizar e imaginar com nitidez.' },
  { id: 19, chakra: 'coronario', text: 'Sinto conexão com algo maior do que eu.' },
  { id: 20, chakra: 'coronario', text: 'Tenho momentos de paz profunda.' },
  { id: 21, chakra: 'coronario', text: 'Aceito o fluxo da vida com confiança.' },
];

export const chakraAnswerSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5)).length(21),
});

export type ChakraAnswerInput = z.infer<typeof chakraAnswerSchema>;

export type ChakraScore = Record<ChakraKey, number>;

export const computeChakraScores = (answers: number[]): ChakraScore => {
  const buckets: Record<ChakraKey, number[]> = {
    raiz: [],
    sacro: [],
    plexo: [],
    cardiaco: [],
    laringeo: [],
    frontal: [],
    coronario: [],
  };
  chakraQuestions.forEach((q, i) => {
    buckets[q.chakra].push(answers[i]);
  });
  const scores = {} as ChakraScore;
  for (const k of chakraKeys) {
    const arr = buckets[k];
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    scores[k] = Math.round((avg / 5) * 100);
  }
  return scores;
};
