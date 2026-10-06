'use client';

import { useEffect, useState } from 'react';
import { dashboardCards, recentActivities, recommendedTopic } from '@/data/dashboardData';
import DashboardCard from '@/components/DashboardCard';
import ProgressCard from '@/components/ProgressCard';
import SectionHeader from '@/components/SectionHeader';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentProfile } from '@/lib/auth';

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    let isMounted = true;

    getCurrentProfile()
      .then((currentProfile) => {
        const profileName = currentProfile?.profile.display_name;
        if (isMounted && typeof profileName === 'string' && profileName.trim()) {
          setDisplayName(profileName);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard allowedRoles={['student']}>
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title="Student dashboard"
        description="Track learning progress, celebrate milestones, and discover the next best topic to explore."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Hi, {displayName || 'there'}! Ready for today’s challenge?</h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Keep building your understanding of intellectual property with short lessons, quick quizzes, and creative examples.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProgressCard label="Current mastery" value="68%" detail="Up by 12% this week" />
            <ProgressCard label="Next milestone" value="3 lessons" detail="To unlock the Innovation badge" />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended topic</p>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">{recommendedTopic.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{recommendedTopic.summary}</p>
          </div>

          <div className="glass-card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent activity</p>
            <ul className="mt-4 space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{activity.label}</p>
                    <span className="text-xs text-slate-400">{activity.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Achievement</p>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 p-4">
              <p className="text-lg font-bold text-slate-900">Creative Explorer</p>
              <p className="mt-2 text-sm text-slate-600">Badge earned for finishing the first three learning activities.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
    </AuthGuard>
  );
}
