import { z } from 'zod';

export const numerologyInputSchema = z.object({
  fullName: z.string().min(2),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type NumerologyInput = z.infer<typeof numerologyInputSchema>;

const charMap: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

const reduce = (n: number): number => {
  while (n > 9 && n !== 11 && n !== 22) {
    n = String(n)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
};

const letterSum = (s: string, filter?: (c: string) => boolean) => {
  const norm = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
  return Array.from(norm)
    .filter((c) => (filter ? filter(c) : true))
    .reduce((a, c) => a + (charMap[c] ?? 0), 0);
};

export type NumerologyResult = {
  lifePath: number;
  destiny: number;
  soul: number;
  personality: number;
  birthday: number;
  meanings: Record<string, string>;
};

export const numerologyMeanings: Record<number, string> = {
  1: 'Liderança, pioneirismo, autonomia. Energia de iniciar.',
  2: 'Cooperação, sensibilidade, parceria. Energia de unir.',
  3: 'Expressão, criatividade, alegria. Energia de comunicar.',
  4: 'Estrutura, disciplina, ordem. Energia de construir.',
  5: 'Liberdade, mudança, aventura. Energia de transformar.',
  6: 'Família, harmonia, cuidado. Energia de servir com amor.',
  7: 'Sabedoria, introspecção, espiritualidade. Energia de buscar.',
  8: 'Realização material, poder, justiça. Energia de manifestar.',
  9: 'Compaixão, finalização, humanidade. Energia de transcender.',
  11: 'Mestre da intuição. Inspiração espiritual.',
  22: 'Mestre construtor. Manifestação em larga escala.',
};

export const calculateNumerology = (input: NumerologyInput): NumerologyResult => {
  const [y, m, d] = input.birthDate.split('-').map(Number);
  const lifePath = reduce(reduce(y) + reduce(m) + reduce(d));
  const destiny = reduce(letterSum(input.fullName));
  const soul = reduce(letterSum(input.fullName, (c) => vowels.has(c)));
  const personality = reduce(letterSum(input.fullName, (c) => !vowels.has(c)));
  const birthday = reduce(d);

  const numbers = [lifePath, destiny, soul, personality, birthday];
  const meanings: Record<string, string> = {};
  for (const n of numbers) {
    meanings[String(n)] = numerologyMeanings[n] ?? 'Energia única em manifestação.';
  }

  return { lifePath, destiny, soul, personality, birthday, meanings };
};
