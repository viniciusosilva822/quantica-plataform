'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  enneagramTypes,
  type EnneagramQuestion,
  type EnneagramType,
} from '@plataforma/shared';

export default function EnneagramPage() {
  const [questions, setQuestions] = useState<EnneagramQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ dominant: EnneagramType; scores: Record<string, number> } | null>(null);

  useEffect(() => {
    api<{ questions: EnneagramQuestion[] }>('/enneagram/questions').then((r) => {
      setQuestions(r.questions);
      setAnswers(Array(r.questions.length).fill(3));
    });
    api<{ result: { dominant: number; scores: Record<string, number> } | null }>('/enneagram/last').then((r) => {
      if (r.result) {
        setResult({ dominant: r.result.dominant as EnneagramType, scores: r.result.scores });
      }
    });
  }, []);

  const setAnswer = (i: number, v: number) =>
    setAnswers((a) => a.map((x, idx) => (idx === i ? v : x)));

  const submit = async () => {
    const r = await api<{ dominant: EnneagramType; scores: Record<string, number> }>(
      '/enneagram',
      { method: 'POST', body: { answers } },
    );
    setResult({ dominant: r.dominant, scores: r.scores });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Eneagrama</h1>
        <p className="text-white/60">9 tipos. 27 perguntas. Responda com sinceridade.</p>
      </div>

      {result && (
        <section className="card">
          <p className="text-white/60 text-sm uppercase tracking-wider">Seu tipo dominante</p>
          <p className="font-display text-3xl mt-1">{enneagramTypes[result.dominant].name}</p>
          <p className="text-white/80 mt-2">{enneagramTypes[result.dominant].description}</p>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-9 gap-2">
            {([1, 2, 3, 4, 5, 6, 7, 8, 9] as EnneagramType[]).map((t) => (
              <div key={t} className="text-center">
                <p className="text-xs text-white/60">{t}</p>
                <p className={`font-display ${t === result.dominant ? 'text-gold' : ''}`}>
                  {result.scores[t]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card space-y-4">
        <h2 className="font-display text-xl">Questionário</h2>
        {questions.map((q, i) => (
          <div key={q.id} className="border-b border-white/5 pb-4">
            <p className="text-sm">{q.text}</p>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setAnswer(i, n)}
                  className={`flex-1 py-2 rounded-lg text-sm border ${
                    answers[i] === n
                      ? 'bg-violet border-violet text-white'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="btn-primary" onClick={submit} disabled={answers.length === 0}>
          Descobrir meu tipo
        </button>
      </section>
    </div>
  );
}
