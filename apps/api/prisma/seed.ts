import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { badgeDefs } from '@plataforma/shared';

const prisma = new PrismaClient();

const mantras = [
  { text: 'Eu sou luz, presença e expansão.' },
  { text: 'O que eu busco também me busca.' },
  { text: 'Hoje eu confio no fluxo da vida.' },
  { text: 'Sou guardião(ã) do meu próprio centro.' },
  { text: 'Cada respiração é um recomeço.' },
  { text: 'Eu mereço receber o bem que penso para os outros.' },
  { text: 'Há mais calma do que pressa dentro de mim.' },
  { text: 'A paz é o caminho — e o destino.' },
  { text: 'Sou abundância em manifestação.' },
  { text: 'Estou exatamente onde preciso estar.' },
  { text: 'A gratidão expande tudo o que toca.' },
  { text: 'Sou força que se permite suavidade.' },
  { text: 'Confio na sabedoria do meu corpo.' },
  { text: 'Eu sou o silêncio entre os pensamentos.' },
  { text: 'O universo conspira a meu favor agora.' },
];

const prompts = [
  'O que pediu sua atenção hoje?',
  'Pelo que você é grato(a) neste momento?',
  'Que emoção atravessou você hoje? O que ela quer dizer?',
  'O que você precisa soltar?',
  'Onde sua energia foi alta hoje? E onde caiu?',
  'Qual a verdade que você está evitando?',
  'O que seu corpo está pedindo?',
  'Que parte sua merece mais cuidado nesta semana?',
  'O que a vida te ensinou nas últimas 24h?',
  'Se hoje fosse perfeito, como seria?',
  'O que você faria se ninguém estivesse olhando?',
  'O que você quer atrair? E o que precisa fazer espaço primeiro?',
  'Que sinal você recebeu recentemente que ignorou?',
  'Qual versão sua está nascendo agora?',
  'O que você quer dizer e ainda não disse?',
];

const meditations = [
  {
    title: 'Sono profundo — descer ao silêncio',
    description: 'Preparando o corpo para o descanso profundo.',
    category: 'sono',
    durationSec: 600,
    audioUrl: 'https://cdn.example.com/medit/sono-1.mp3',
  },
  {
    title: 'Liberar a ansiedade do dia',
    description: 'Desfazer a tensão acumulada nos ombros e na mente.',
    category: 'ansiedade',
    durationSec: 480,
    audioUrl: 'https://cdn.example.com/medit/ansiedade-1.mp3',
  },
  {
    title: 'Foco quântico de 10 minutos',
    description: 'Voltar para o aqui antes de qualquer tarefa importante.',
    category: 'foco',
    durationSec: 600,
    audioUrl: 'https://cdn.example.com/medit/foco-1.mp3',
  },
  {
    title: 'Manhã solar — abrir o dia',
    description: 'Acordar o corpo e a presença com gratidão.',
    category: 'manhã',
    durationSec: 420,
    audioUrl: 'https://cdn.example.com/medit/manha-1.mp3',
  },
  {
    title: 'Cura energética — limpando os campos',
    description: 'Visualização de luz para limpeza vibracional.',
    category: 'cura',
    durationSec: 720,
    audioUrl: 'https://cdn.example.com/medit/cura-1.mp3',
  },
  {
    title: 'Energização de 5 minutos',
    description: 'Quando você sente que precisa de impulso rápido.',
    category: 'energia',
    durationSec: 300,
    audioUrl: 'https://cdn.example.com/medit/energia-1.mp3',
  },
  {
    title: 'Gratidão antes de dormir',
    description: 'Encerrando o dia em frequência alta.',
    category: 'gratidao',
    durationSec: 360,
    audioUrl: 'https://cdn.example.com/medit/gratidao-1.mp3',
  },
];

const library = [
  {
    title: 'Guia: 21 dias de presença',
    description: 'E-book introdutório para começar sua jornada.',
    kind: 'ebook' as const,
    url: 'https://cdn.example.com/lib/21-dias.pdf',
    tags: ['inicio', 'pratica'],
  },
  {
    title: 'Áudio: voz do silêncio',
    description: 'Faixa guiada de 12 minutos.',
    kind: 'audio' as const,
    url: 'https://cdn.example.com/lib/voz-silencio.mp3',
    tags: ['intermediario'],
  },
  {
    title: 'Vídeo: Vida Quântica — pilares',
    description: 'Aula introdutória com a visão geral do método.',
    kind: 'video' as const,
    url: 'https://cdn.example.com/lib/pilares.mp4',
    tags: ['fundamentos'],
  },
  {
    title: 'Artigo: O que é coerência cardíaca',
    description: 'Texto curto para aprofundar a prática.',
    kind: 'artigo' as const,
    url: 'https://cdn.example.com/lib/coerencia.html',
    tags: ['respiracao'],
  },
];

async function main() {
  console.log('▶ Seed: badges...');
  for (const b of badgeDefs) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, emoji: b.emoji },
      create: b,
    });
  }

  console.log('▶ Seed: mantras...');
  for (const m of mantras) {
    const existing = await prisma.mantra.findFirst({ where: { text: m.text } });
    if (!existing) await prisma.mantra.create({ data: m });
  }

  console.log('▶ Seed: prompts de diário...');
  for (const p of prompts) {
    const existing = await prisma.diaryPrompt.findFirst({ where: { text: p } });
    if (!existing) await prisma.diaryPrompt.create({ data: { text: p } });
  }

  console.log('▶ Seed: meditações...');
  for (const m of meditations) {
    const existing = await prisma.meditation.findFirst({ where: { title: m.title } });
    if (!existing) await prisma.meditation.create({ data: m });
  }

  console.log('▶ Seed: biblioteca...');
  for (const i of library) {
    const existing = await prisma.libraryItem.findFirst({ where: { title: i.title } });
    if (!existing) await prisma.libraryItem.create({ data: i });
  }

  console.log('▶ Seed: lives...');
  const liveExists = await prisma.live.findFirst();
  if (!liveExists) {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    await prisma.live.create({
      data: {
        title: 'Encontro mensal — alinhamento quântico',
        description: 'Live ao vivo com Q&A no final.',
        scheduledAt: future,
        liveUrl: 'https://meet.example.com/quantica',
      },
    });
  }

  console.log('▶ Seed: aluno demo...');
  const demoEmail = 'aluno@vidaquantica.com';
  let demo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    demo = await prisma.user.create({
      data: { email: demoEmail, name: 'Aluno Demo', passwordHash },
    });
  }
  await prisma.access.upsert({
    where: { userId: demo.id },
    update: { status: 'ACTIVE' },
    create: { userId: demo.id, status: 'ACTIVE', productName: 'Vida Quântica (Demo)' },
  });

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.log('▶ Seed: admin a partir de .env...');
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', passwordHash },
      create: { email, name: 'Admin', passwordHash, role: 'ADMIN' },
    });
  }

  console.log('✔ Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
