'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { numerologyMeanings, type NumerologyResult } from '@plataforma/shared';

type Map = { id: string; fullName: string; birthDate: string; result: NumerologyResult };

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [last, setLast] = useState<Map | null>(null);
  const [result, setResult] = useState<NumerologyResult | null>(null);

  useEffect(() => {
    api<{ map: Map | null }>('/numerology/last').then((r) => {
      setLast(r.map);
      if (r.map) {
        setName(r.map.fullName);
        setBirth(r.map.birthDate.slice(0, 10));
        setResult(r.map.result);
      }
    });
  }, []);

  const calc = async () => {
    const r = await api<{ result: NumerologyResult }>('/numerology', {
      method: 'POST',
      body: { fullName: name, birthDate: birth },
    });
    setResult(r.result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Mapa numerológico</h1>
        <p className="text-white/60">Os números que vibram em sua história.</p>
      </div>

      <section className="card grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Nome completo de nascimento</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Data de nascimento</label>
          <input type="date" className="input" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <button className="btn-primary" onClick={calc}>Calcular</button>
        </div>
      </section>

      {result && (
        <section className="grid sm:grid-cols-2 gap-4">
          <Box title="Caminho de vida" n={result.lifePath} desc={numerologyMeanings[result.lifePath] ?? ''} />
          <Box title="Destino (Expressão)" n={result.destiny} desc={numerologyMeanings[result.destiny] ?? ''} />
          <Box title="Alma (Motivação)" n={result.soul} desc={numerologyMeanings[result.soul] ?? ''} />
          <Box title="Personalidade" n={result.personality} desc={numerologyMeanings[result.personality] ?? ''} />
          <Box title="Aniversário" n={result.birthday} desc={numerologyMeanings[result.birthday] ?? ''} />
        </section>
      )}
    </div>
  );
}

function Box({ title, n, desc }: { title: string; n: number; desc: string }) {
  return (
    <div className="card">
      <p className="text-white/60 text-sm">{title}</p>
      <p className="font-display text-5xl text-gold mt-1">{n}</p>
      <p className="text-white/80 mt-2 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
