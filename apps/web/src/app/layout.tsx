import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vida Quântica — Plataforma do Aluno',
  description: 'Sua jornada quântica começa aqui.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
