'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import QuizRunner from '@/components/QuizRunner';
import { getQuestionsForTopic, quizTopics, type QuizTopicId } from '@/data/quizData';

export default function QuizPage() {
  return <Suspense fallback={<main className="section-shell py-10 sm:py-14"><p className="text-slate-600">Loading quiz...</p></main>}><QuizContent /></Suspense>;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get('topic') as QuizTopicId | null;
  const [selectedTopicId, setSelectedTopicId] = useState<QuizTopicId | null>(requestedTopic);
  const selectedTopic = quizTopics.find((topic) => topic.id === selectedTopicId);

  if (selectedTopic) {
    return <main className="section-shell py-10 sm:py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Interactive quiz</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Test your {selectedTopic.name} knowledge</h1><p className="mt-2 text-slate-600">Choose one answer, check your thinking, and learn from the explanation.</p></div><button type="button" onClick={() => setSelectedTopicId(null)} className="btn-secondary">Change topic</button></div><QuizRunner topic={selectedTopic} questions={getQuestionsForTopic(selectedTopic.id)} /></main>;
  }

  return (
    <main className="section-shell py-10 sm:py-14"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Interactive quiz</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">What would you like to explore?</h1><p className="mt-3 text-base leading-7 text-slate-600">Pick a topic for a short mock quiz. Your answers stay in this browser session and are not saved.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{quizTopics.map((topic) => <button key={topic.id} type="button" onClick={() => setSelectedTopicId(topic.id)} className="glass-card flex min-h-52 flex-col items-start p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><div className="flex w-full items-start justify-between gap-3"><span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-brand-50 px-2 text-xs font-bold text-brand-700" aria-hidden="true">{topic.icon}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{topic.difficulty}</span></div><h2 className="mt-5 text-xl font-bold text-slate-900">{topic.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p><div className="mt-auto flex gap-4 pt-5 text-xs font-semibold text-slate-500"><span>{topic.questions} questions</span><span>+{topic.xpReward} XP</span></div><span className="mt-3 text-sm font-semibold text-brand-700">Start quiz <span aria-hidden="true">-&gt;</span></span></button>)}</div><Link href="/games" className="btn-secondary mt-8">Back to games</Link></main>
  );
}
