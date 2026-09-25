'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { achievements, dashboardCards, overallProgress, recentActivities, recommendedTopic } from '@/data/dashboardData';
import DashboardCard from '@/components/DashboardCard';
import { getCurrentUser } from '@/lib/auth';
import { getProfile } from '@/lib/profile';
import AuthGuard from '@/components/AuthGuard';

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const user = await getCurrentUser();

        if (!user) return;

        const profile = await getProfile(user.$id);
        const profileDisplayName = profile.display_name;

        if (isMounted && typeof profileDisplayName === 'string' && profileDisplayName.trim()) {
          setDisplayName(profileDisplayName);
        }
      } catch {
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard allowedRoles={['student']}>
    <main className="section-shell py-10 sm:py-14">
      <section className="overflow-hidden rounded-3xl bg-brand-900 p-6 text-white shadow-soft sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Mock student dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{displayName ? `Hi, ${displayName}. Ready for your next discovery?` : 'Welcome back. Ready for your next discovery?'}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-blue-100">You are on a 6-day learning streak. Keep exploring ideas, inventions, and the creative work that makes them unique.</p>
          </div>
          <Link href="/learn" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900">
            Continue learning <span className="ml-2" aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="stats-heading" className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Your snapshot</p>
          <h2 id="stats-heading" className="mt-1 text-xl font-bold text-slate-900">Small steps, real progress</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => <DashboardCard key={card.title} {...card} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-card p-6 sm:p-8" aria-labelledby="progress-heading">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Overall progress</p>
              <h2 id="progress-heading" className="mt-2 text-2xl font-bold text-slate-900">You are building momentum</h2>
            </div>
            <span className="text-3xl font-bold text-brand-600">{overallProgress.percentage}%</span>
          </div>
          <div className="mt-7 h-4 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Overall learning progress" aria-valuenow={overallProgress.percentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${overallProgress.percentage}%` }} />
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-slate-600">
            <span><strong className="text-slate-900">{overallProgress.completedLessons}</strong> completed lessons</span>
            <span><strong className="text-slate-900">{overallProgress.totalLessons}</strong> total lessons</span>
          </div>
          <p className="mt-6 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">Every lesson adds another tool to your creator toolkit. You are doing great.</p>
        </section>

        <section className="glass-card overflow-hidden" aria-labelledby="continue-heading">
          <div className="bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Continue learning</p>
                <h2 id="continue-heading" className="mt-2 text-2xl font-bold text-slate-900">{recommendedTopic.title}</h2>
              </div>
              <span className="text-4xl" aria-hidden="true">{recommendedTopic.icon}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{recommendedTopic.summary}</p>
            <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-700"><span>{recommendedTopic.lessons}</span><span>{recommendedTopic.progress}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-amber-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${recommendedTopic.progress}%` }} /></div>
            <Link href="/learn" className="btn-primary mt-6">Continue topic <span className="ml-2" aria-hidden="true">-&gt;</span></Link>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-2xl bg-amber-500 p-6 text-amber-950 shadow-soft sm:p-8" aria-labelledby="challenge-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Daily challenge</p>
          <h2 id="challenge-heading" className="mt-2 text-2xl font-bold">Originality detective</h2>
          <p className="mt-3 text-sm leading-6 text-amber-900">Spot the difference between inspiration and copying in three quick scenarios.</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"><span>~5 min</span><span>+30 XP</span></div>
          <Link href="/games/quiz" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-950 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-500">Start challenge <span className="ml-2" aria-hidden="true">-&gt;</span></Link>
        </section>

        <section className="glass-card p-6 sm:p-8" aria-labelledby="activity-heading">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Your journey</p><h2 id="activity-heading" className="mt-1 text-2xl font-bold text-slate-900">Recent activity</h2></div><span className="text-sm text-slate-500">Mock feed</span></div>
          <ul className="mt-6 divide-y divide-slate-100">
            {recentActivities.map((activity) => <li key={activity.id} className="flex gap-3 py-4 first:pt-0 last:pb-0"><span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${toneClasses[activity.tone]}`} aria-hidden="true">{activity.icon}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-x-3 gap-y-1"><p className="font-semibold text-slate-800">{activity.label}</p><span className="text-xs text-slate-400">{activity.time}</span></div><p className="mt-1 text-sm text-slate-600">{activity.detail}</p></div></li>)}
          </ul>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="achievements-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Milestones</p><h2 id="achievements-heading" className="mt-1 text-2xl font-bold text-slate-900">Achievements</h2></div><span className="text-sm text-slate-500">2 of 4 unlocked</span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {achievements.map((achievement) => <div key={achievement.title} className={`rounded-2xl border p-5 ${achievement.unlocked ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center justify-between gap-3"><span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${achievement.unlocked ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'}`} aria-hidden="true">{achievement.unlocked ? achievement.icon : '·'}</span><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{achievement.unlocked ? 'Unlocked' : 'Locked'}</span></div><h3 className="mt-4 font-bold text-slate-900">{achievement.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{achievement.description}</p></div>)}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8" aria-labelledby="actions-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Keep exploring</p><h2 id="actions-heading" className="mt-1 text-2xl font-bold text-slate-900">Choose your next move</h2></div><div className="grid gap-3 sm:grid-cols-3"><Link href="/learn" className="btn-secondary">Explore topics</Link><Link href="/games/quiz" className="btn-secondary">Play a quiz</Link><Link href="/progress" className="btn-secondary">View progress</Link></div></div>
      </section>
    </main>
    </AuthGuard>
  );
}
