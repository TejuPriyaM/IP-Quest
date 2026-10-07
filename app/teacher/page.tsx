'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentProfile, getCurrentUser } from '@/lib/auth';

const dashboardCards = [
  { title: 'Topics', description: 'Manage learning topics.', href: '/teacher/topics', icon: 'T', tone: 'blue' },
  { title: 'Lessons', description: 'Create and manage lesson content.', href: '/teacher/lessons', icon: 'L', tone: 'green' },
  { title: 'Topic Assessment', description: 'Complete topic assessment data before creating or updating a topic.', href: '/teacher/assessment', icon: 'A', tone: 'amber' },
  { title: 'Questions / Quizzes', description: 'Manage quiz questions and assessments.', href: '/teacher/questions', icon: 'Q', tone: 'amber' },
  { title: 'Student Progress', description: 'View student learning progress.', href: '/teacher/progress', icon: 'P', tone: 'violet' },
] as const;

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
};

export default function TeacherPage() {
  const [displayName, setDisplayName] = useState('Teacher');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentProfile(), getCurrentUser()])
      .then(([currentProfile, user]) => {
        const profileName = currentProfile?.profile.display_name;

        if (typeof profileName === 'string' && profileName.trim()) {
          setDisplayName(profileName);
        }

        if (user) setEmail(user.email);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthGuard allowedRoles={['teacher']}>
      <main className="section-shell py-10 sm:py-14">
        <section className="rounded-3xl bg-brand-900 p-8 text-white shadow-soft sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Teacher workspace</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Teacher Dashboard</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Manage learning content and monitor your students.</p>
          <p className="mt-6 text-xl font-bold">Welcome, {isLoading ? '...' : displayName}</p>
        </section>

        <section className="mt-8" aria-labelledby="teacher-tools-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Teacher tools</p>
            <h2 id="teacher-tools-heading" className="mt-1 text-2xl font-bold text-slate-900">Manage your learning space</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {dashboardCards.map((card) => (
              <Link key={card.href} href={card.href} className="glass-card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  </div>
                  <span className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold ring-1 ${toneClasses[card.tone]}`} aria-hidden="true">{card.icon}</span>
                </div>
                <span className="mt-6 inline-flex text-sm font-bold text-brand-700">Open workspace <span className="ml-2" aria-hidden="true">-&gt;</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass-card mt-8 max-w-xl p-6 sm:p-8" aria-labelledby="teacher-profile-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Your profile</p>
          <h2 id="teacher-profile-heading" className="mt-1 text-2xl font-bold text-slate-900">Teacher profile</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">Display name</dt><dd className="font-semibold text-slate-900">{isLoading ? '...' : displayName}</dd></div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">Email</dt><dd className="font-semibold text-slate-900">{isLoading ? '...' : email}</dd></div>
            <div className="flex flex-wrap justify-between gap-2"><dt className="font-semibold text-slate-500">Role</dt><dd className="font-semibold capitalize text-slate-900">Teacher</dd></div>
          </dl>
          <Link href="/profile" className="btn-secondary mt-6">View full profile</Link>
        </section>
      </main>
    </AuthGuard>
  );
}