'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const regions = [
  {
    title: 'Patent Lab',
    icon: '🔬',
    route: '/games/invention-lab',
    difficulty: 'Beginner',
    accent: 'from-sky-500 via-blue-500 to-blue-700',
    description: 'Invent, test, and protect new ideas that solve real problems.',
    mission: 'Build a new invention and decide what protection it may need.',
  },
  {
    title: 'Creator Studio',
    icon: '🎨',
    route: '/games/creator-studio',
    difficulty: 'Intermediate',
    accent: 'from-pink-500 via-rose-500 to-orange-500',
    description: 'Create original stories, music, art, and videos that deserve credit.',
    mission: 'Sort original works from copied ones and check attribution.',
  },
  {
    title: 'Brand City',
    icon: '🏙️',
    route: '/games/brand-city',
    difficulty: 'Intermediate',
    accent: 'from-violet-500 via-purple-500 to-indigo-600',
    description: 'Spot logos, slogans, and memorable brands that help us identify products.',
    mission: 'Recognise strong marks and compare them with common words.',
  },
  {
    title: 'Secret Vault',
    icon: '🔐',
    route: '/games/secret-vault',
    difficulty: 'Advanced',
    accent: 'from-emerald-500 via-teal-500 to-cyan-700',
    description: 'Protect confidential business know-how and hidden information.',
    mission: 'Decide when a secret should stay protected and when it should be shared.',
  },
  {
    title: 'Originality Academy',
    icon: '📚',
    route: '/games/originality-academy',
    difficulty: 'Advanced',
    accent: 'from-amber-400 via-yellow-500 to-orange-600',
    description: 'Learn to give credit, cite sources, and stay honest in school work.',
    mission: 'Compare examples of original work and copied work before submitting.',
  },
];

export default function IPQuestWorld() {
  const [progress, setProgress] = useState<Record<string, { complete?: boolean; xp?: number; session?: { xp?: number } }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ip-quest-game-progress');
      if (saved) setProgress(JSON.parse(saved) as Record<string, { complete?: boolean; xp?: number; session?: { xp?: number } }>);
    } catch (error) {
      console.error('Unable to load game progress.', error);
    }
  }, []);

  const completedCount = regions.filter((region) => progress[region.title.toUpperCase()]?.complete).length;
  const xpEarned = Object.values(progress).reduce((total, game) => total + (game.complete ? game.xp ?? 0 : game.session?.xp ?? game.xp ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => (
          <Link
            key={region.title}
            href={region.route}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${region.accent}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                {region.icon}
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                {progress[region.title.toUpperCase()]?.complete ? 'Completed' : region.difficulty}
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">{region.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{region.description}</p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Mission</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{region.mission}</p>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm font-semibold text-brand-700">
              <span>{progress[region.title.toUpperCase()]?.complete
                ? `${progress[region.title.toUpperCase()]?.xp ?? 0} XP earned`
                : `${progress[region.title.toUpperCase()]?.session?.xp ?? 0} XP this run`}</span>
              <span aria-hidden="true" className="transition group-hover:translate-x-1">{progress[region.title.toUpperCase()]?.complete ? '✓ View badge' : '▶ Play'} →</span>
            </div>
          </Link>
        ))}
      </div>

      {completedCount === regions.length && (
        <Link href="/games/great-ip-mystery" className="group block overflow-hidden rounded-3xl border border-indigo-300 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-200">All regions complete · bonus adventure unlocked</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-black sm:text-3xl">The Great IP Mystery</h3>
              <p className="mt-2 max-w-2xl text-sm text-indigo-100">Explore one startup and investigate its invention, creative work, brand, confidential information, and research.</p>
            </div>
            <span className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-800">Play final adventure →</span>
          </div>
        </Link>
      )}

      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Quest progress</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Your IP Guardian journey</h3>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 font-medium text-brand-700">{completedCount}/5 regions complete</span>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-700">{xpEarned} XP earned</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">{completedCount} badges</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'XP earned', value: String(xpEarned), detail: 'Earn XP by completing game actions' },
            { label: 'Regions cleared', value: `${completedCount}/5`, detail: 'Finish a region to earn its badge' },
            { label: 'Mission completion', value: `${Math.round((completedCount / regions.length) * 100)}%`, detail: 'Complete every region to become an IP Guardian' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
