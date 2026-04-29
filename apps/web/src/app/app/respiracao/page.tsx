'use client';

import { useEffect, useRef, useState } from 'react';
import { breathingPatterns, breathingTechniques, type BreathingTechnique } from '@plataforma/shared';
import { api } from '@/lib/api';

export default function BreathingPage() {
  const [technique, setTechnique] = useState<BreathingTechnique>('4-7-8');
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const startRef = useRef<number>(0);

  const pattern = breathingPatterns[technique];

  useEffect(() => {
    if (!running) return;
    const phase = pattern.phases[phaseIdx];
    setSecLeft(phase.sec);
    const t = setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) {
          setPhaseIdx((p) => {
            const next = p + 1;
            if (next >= pattern.phases.length) {
              setCycles((c) => c + 1);
              return 0;
            }
            return next;
          });
          return pattern.phases[(phaseIdx + 1) % pattern.phases.length].sec;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phaseIdx, pattern]);

  const start = () => {
    setRunning(true);
    setPhaseIdx(0);
    setCycles(0);
    startRef.current = Date.now();
  };

  const stop = async () => {
    setRunning(false);
    const elapsed = Math.max(10, Math.round((Date.now() - startRef.current) / 1000));
    if (cycles >= 1) {
      await api('/breathing/log', {
        method: 'POST',
        body: { technique, cycles, durationSec: elapsed },
      });
    }
  };

  const phase = pattern.phases[phaseIdx];
  const scale = phase?.label === 'Inspire' ? 1.6 : phase?.label === 'Expire' ? 0.9 : 1.3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Respiração guiada</h1>
        <p className="text-white/60">Escolha uma técnica e respire com o círculo.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {breathingTechniques.map((t) => (
          <button
            key={t}
            onClick={() => !running && setTechnique(t)}
            className={`pill ${technique === t ? 'bg-violet text-white' : ''}`}
            disabled={running}
          >
            {breathingPatterns[t].name}
          </button>
        ))}
      </div>

      <section className="card flex flex-col items-center py-12">
        <div
          className="rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${running ? scale : 1})`,
          }}
        >
          <div className="text-center">
            <p className="font-display text-2xl">{running ? phase.label : 'Pronto'}</p>
            <p className="text-5xl font-display mt-2">{running ? secLeft : '—'}</p>
          </div>
        </div>
        <p className="text-white/60 mt-6">Ciclos: {cycles}</p>
        <div className="flex gap-3 mt-4">
          {!running ? (
            <button className="btn-primary" onClick={start}>Iniciar</button>
          ) : (
            <button className="btn-ghost" onClick={stop}>Parar e registrar</button>
          )}
        </div>
      </section>
    </div>
  );
}
