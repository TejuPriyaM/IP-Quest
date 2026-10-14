'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const regions = [
  {
    title: 'Patent Lab',
    icon: '🔬',
    route: '/games/invention-lab',
    difficulty: 'Build and test',
    accent: 'from-sky-500 via-blue-500 to-blue-700',
    description: 'Help make a water-saving garden machine and see how it works.',
    mission: 'Find parts, build the machine, and test it.',
  },
  {
    title: 'Creator Studio',
    icon: '🎨',
    route: '/games/creator-studio',
    difficulty: 'Make something',
    accent: 'from-pink-500 via-rose-500 to-orange-500',
    description: 'Draw your own picture, compare examples, and give creators credit.',
    mission: 'Create, compare, and credit artwork.',
  },
  {
    title: 'Brand City',
    icon: '🏙️',
    route: '/games/brand-city',
    difficulty: 'Design a shop',
    accent: 'from-violet-500 via-purple-500 to-indigo-600',
    description: 'Design a shop sign that helps customers recognise the shop.',
    mission: 'Create a name and symbol that stand out.',
  },
  {
    title: 'Secret Vault',
    icon: '🔐',
    route: '/games/secret-vault',
    difficulty: 'Keep it safe',
    accent: 'from-emerald-500 via-teal-500 to-cyan-700',
    description: 'Choose what should stay private and who needs permission to see it.',
    mission: 'Keep useful information private and secure.',
  },
  {
    title: 'Originality Academy',
    icon: '📚',
    route: '/games/originality-academy',
    difficulty: 'School skills',
    accent: 'from-amber-400 via-yellow-500 to-orange-600',
    description: 'Check an assignment against its sources and add credit where it is needed.',
    mission: 'Compare sources before you decide what to change.',
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
                ? `${progress[region.title.toUpperCase()]?.xp ?? 0} points earned`
                : `${progress[region.title.toUpperCase()]?.session?.xp ?? 0} points so far`}</span>
              <span aria-hidden="true" className="transition group-hover:translate-x-1">{progress[region.title.toUpperCase()]?.complete ? '✓ See badge' : '▶ Start game'} →</span>
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
              <p className="mt-2 max-w-2xl text-sm text-indigo-100">Explore a small business and learn how it uses an invention, artwork, a brand, private information, and research.</p>
            </div>
            <span className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-800">Play final adventure →</span>
          </div>
        </Link>
      )}

      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Quest progress</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Your game progress</h3>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 font-medium text-brand-700">{completedCount}/5 games complete</span>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-700">{xpEarned} points earned</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">{completedCount} badges</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Points earned', value: String(xpEarned), detail: 'Earn points by completing game tasks' },
            { label: 'Games completed', value: `${completedCount}/5`, detail: 'Finish a game to earn its badge' },
            { label: 'Overall progress', value: `${Math.round((completedCount / regions.length) * 100)}%`, detail: 'Complete all five games to unlock the bonus adventure' },
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
