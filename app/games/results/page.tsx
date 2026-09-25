'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getFeedbackMessage } from '@/data/quizScoring';
import { quizTopics } from '@/data/quizData';

export default function ResultsPage() {
  return <Suspense fallback={<main className="section-shell py-10 sm:py-14"><p className="text-slate-600">Loading results...</p></main>}><ResultsContent /></Suspense>;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get('score')) || 0;
  const total = Number(searchParams.get('total')) || 0;
  const xp = Number(searchParams.get('xp')) || 0;
  const topic = quizTopics.find((item) => item.id === searchParams.get('topic'));
  const percentage = total ? Math.round((score / total) * 100) : 0;

  return <main className="section-shell py-10 sm:py-14"><section className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Quiz complete</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Nice work{topic ? ` on ${topic.name}` : ''}!</h1><p className="mt-3 text-base leading-7 text-slate-600">{getFeedbackMessage(percentage)} This is a mock result for the Phase 1 prototype.</p><div className="glass-card mt-8 p-6 sm:p-8"><div className="text-6xl font-bold text-brand-600">{percentage}%</div><p className="mt-2 text-sm font-semibold text-slate-500">Final score</p><div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6"><div><p className="text-2xl font-bold text-slate-900">{score}/{total}</p><p className="mt-1 text-xs text-slate-500">Correct answers</p></div><div><p className="text-2xl font-bold text-slate-900">{total}</p><p className="mt-1 text-xs text-slate-500">Questions</p></div><div><p className="text-2xl font-bold text-slate-900">+{xp}</p><p className="mt-1 text-xs text-slate-500">Mock XP</p></div></div></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/games/quiz${topic ? `?topic=${topic.id}` : ''}`} className="btn-primary">Retry quiz</Link><Link href="/games" className="btn-secondary">Return to games</Link><Link href="/learn" className="btn-secondary">Return to learning</Link></div><p className="mt-6 text-xs text-slate-500">Prototype note: results are calculated in the browser and are not securely validated or saved.</p></section></main>;
}
