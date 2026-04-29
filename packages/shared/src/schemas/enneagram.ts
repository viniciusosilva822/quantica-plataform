import { z } from 'zod';

export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const enneagramTypes: Record<
  EnneagramType,
  { name: string; description: string }
> = {
  1: { name: 'Tipo 1 — O Perfeccionista', description: 'Movido por princípios. Busca melhorar o mundo e a si mesmo.' },
  2: { name: 'Tipo 2 — O Prestativo', description: 'Movido pelo amor. Quer ser necessário e cuidar.' },
  3: { name: 'Tipo 3 — O Realizador', description: 'Movido por conquistas. Busca ser admirado por suas vitórias.' },
  4: { name: 'Tipo 4 — O Individualista', description: 'Movido pela autenticidade. Profundo, sensível, criativo.' },
  5: { name: 'Tipo 5 — O Investigador', description: 'Movido pelo conhecimento. Observador, analítico, reservado.' },
  6: { name: 'Tipo 6 — O Leal', description: 'Movido pela segurança. Comprometido, prudente, vigilante.' },
  7: { name: 'Tipo 7 — O Entusiasta', description: 'Movido pela alegria. Versátil, otimista, busca novidade.' },
  8: { name: 'Tipo 8 — O Desafiador', description: 'Movido pelo poder. Direto, protetor, combativo.' },
  9: { name: 'Tipo 9 — O Pacificador', description: 'Movido pela paz. Acolhedor, mediador, evita conflito.' },
};

export type EnneagramQuestion = { id: number; type: EnneagramType; text: string };

export const enneagramQuestions: EnneagramQuestion[] = [
  { id: 1, type: 1, text: 'Tenho dificuldade em aceitar imperfeições, em mim e nos outros.' },
  { id: 2, type: 1, text: 'Sinto uma voz interna constante apontando o que poderia melhorar.' },
  { id: 3, type: 1, text: 'Valorizo ordem, ética e fazer as coisas “do jeito certo”.' },
  { id: 4, type: 2, text: 'Coloco frequentemente as necessidades dos outros antes das minhas.' },
  { id: 5, type: 2, text: 'Sinto-me realizado(a) quando posso ajudar alguém.' },
  { id: 6, type: 2, text: 'Tenho dificuldade em pedir ajuda ou expressar minhas próprias necessidades.' },
  { id: 7, type: 3, text: 'Estou sempre buscando metas, conquistas e reconhecimento.' },
  { id: 8, type: 3, text: 'Adapto minha imagem conforme o ambiente para ser bem-sucedido(a).' },
  { id: 9, type: 3, text: 'Tenho dificuldade em parar — produtividade me define.' },
  { id: 10, type: 4, text: 'Sinto-me diferente das outras pessoas, com uma profundidade própria.' },
  { id: 11, type: 4, text: 'Tenho oscilações intensas de humor e me conecto com a beleza melancólica.' },
  { id: 12, type: 4, text: 'Sinto que falta algo em mim que existe nos outros.' },
  { id: 13, type: 5, text: 'Prefiro observar e analisar antes de agir.' },
  { id: 14, type: 5, text: 'Preciso de tempo sozinho(a) para recarregar e processar.' },
  { id: 15, type: 5, text: 'Acumulo conhecimento como forma de me sentir seguro(a).' },
  { id: 16, type: 6, text: 'Antecipo problemas e cenários ruins.' },
  { id: 17, type: 6, text: 'Valorizo lealdade e tenho dificuldade em confiar de imediato.' },
  { id: 18, type: 6, text: 'Sinto-me mais seguro(a) com regras claras e grupos confiáveis.' },
  { id: 19, type: 7, text: 'Busco constantemente novas experiências e estímulos.' },
  { id: 20, type: 7, text: 'Tenho dificuldade em ficar com sentimentos desconfortáveis.' },
  { id: 21, type: 7, text: 'Costumo ter muitos planos ao mesmo tempo.' },
  { id: 22, type: 8, text: 'Sou direto(a) e não tenho medo de confronto quando preciso.' },
  { id: 23, type: 8, text: 'Protejo quem amo e me incomoda injustiça.' },
  { id: 24, type: 8, text: 'Tenho dificuldade em mostrar vulnerabilidade.' },
  { id: 25, type: 9, text: 'Costumo ceder para manter a paz.' },
  { id: 26, type: 9, text: 'Tenho dificuldade em saber o que eu mesmo(a) quero.' },
  { id: 27, type: 9, text: 'Procrastino decisões importantes esperando que se resolvam sozinhas.' },
];

export const enneagramAnswerSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5)).length(27),
});

export type EnneagramAnswerInput = z.infer<typeof enneagramAnswerSchema>;

export type EnneagramScores = Record<EnneagramType, number>;

export const computeEnneagram = (answers: number[]): { dominant: EnneagramType; scores: EnneagramScores } => {
  const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } as EnneagramScores;
  enneagramQuestions.forEach((q, i) => {
    scores[q.type] += answers[i];
  });
  let dominant: EnneagramType = 1;
  let max = -1;
  (Object.keys(scores) as unknown as EnneagramType[]).forEach((t) => {
    const k = Number(t) as EnneagramType;
    if (scores[k] > max) {
      max = scores[k];
      dominant = k;
    }
  });
  return { dominant, scores };
};
