'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function HomePage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <main className="section-shell py-10 sm:py-14">
        <section className="overflow-hidden rounded-3xl bg-brand-900 p-8 text-white shadow-soft sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Welcome to IP Quest</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Discover the ideas behind the things you create.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">Explore intellectual property through short lessons, games, and practical challenges built for curious creators.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push('/learn')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-900 transition hover:bg-blue-50">Explore learning</button>
            <button type="button" onClick={() => router.push('/dashboard')} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-300 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Open dashboard</button>
          </div>
        </section>
        <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="IP Quest highlights">
          <div className="glass-card p-6"><p className="text-sm font-bold text-brand-700">Learn</p><h2 className="mt-2 text-xl font-bold text-slate-900">Build your creator toolkit</h2></div>
          <div className="glass-card p-6"><p className="text-sm font-bold text-emerald-700">Play</p><h2 className="mt-2 text-xl font-bold text-slate-900">Test your ideas in games</h2></div>
          <div className="glass-card p-6"><p className="text-sm font-bold text-amber-700">Grow</p><h2 className="mt-2 text-xl font-bold text-slate-900">Track your progress</h2></div>
        </section>
      </main>
    </AuthGuard>
  );
}
