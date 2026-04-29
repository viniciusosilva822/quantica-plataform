'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { api } from '@/lib/api';
import { chakraInfo, chakraKeys, type ChakraKey, type ChakraQuestion } from '@plataforma/shared';

export default function ChakrasPage() {
  const [questions, setQuestions] = useState<ChakraQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scores, setScores] = useState<Record<ChakraKey, number> | null>(null);

  useEffect(() => {
    api<{ questions: ChakraQuestion[] }>('/chakras/questions').then((r) => {
      setQuestions(r.questions);
      setAnswers(Array(r.questions.length).fill(3));
    });
    api<{ result: { scores: Record<ChakraKey, number> } | null }>('/chakras/last').then((r) => {
      if (r.result) setScores(r.result.scores);
    });
  }, []);

  const setAnswer = (i: number, v: number) =>
    setAnswers((a) => a.map((x, idx) => (idx === i ? v : x)));

  const submit = async () => {
    const r = await api<{ scores: Record<ChakraKey, number> }>('/chakras', {
      method: 'POST',
      body: { answers },
    });
    setScores(r.scores);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const data =
    scores &&
    chakraKeys.map((k) => ({
      name: chakraInfo[k].name.split(' ')[0],
      valor: scores[k],
      color: chakraInfo[k].color,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Diagnóstico de chakras</h1>
        <p className="text-white/60">Responda 1 (discordo) a 5 (concordo plenamente).</p>
      </div>

      {scores && data && (
        <section className="card">
          <h2 className="font-display text-xl mb-3">Seu mapa atual</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#fff" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#fff" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a1530', border: '1px solid #ffffff20', borderRadius: 12 }} />
                <Bar dataKey="valor">
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {chakraKeys.map((k) => (
              <div key={k} className="rounded-lg border border-white/10 p-3">
                <p className="font-display" style={{ color: chakraInfo[k].color }}>
                  {chakraInfo[k].name}
                </p>
                <p className="text-white/60 text-xs">Energia: {scores[k]}%</p>
                <p className="text-white/80 text-sm mt-1">{chakraInfo[k].practice}</p>
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
          Calcular meu diagnóstico
        </button>
      </section>
    </div>
  );
}
