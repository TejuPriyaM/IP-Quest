'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import DashboardCard from '@/components/DashboardCard';
import ProgressCard from '@/components/ProgressCard';
import SectionHeader from '@/components/SectionHeader';
import { createCurrentUserJWT } from '@/lib/auth';
import { DASHBOARD_DATA_CHANGED_EVENT } from '@/lib/dashboard-events';

type DashboardAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
} & (
  | { kind: 'quiz' }
  | { kind: 'level'; level: number; passed: boolean }
  | { kind: 'teacher'; passed: boolean }
  | { kind: 'assessment'; lessonId: string; lessonTitle: string }
);

type DashboardData = {
  profile: { displayName: string | null; totalPoints: number | null };
  progress: Array<{ topicId: string; topicTitle: string; completionPercentage: number; bestScore: number | null; lastAccessedAt: string | null }>;
  averageCompletion: number | null;
  completedTopics: number;
  quizAttempts: DashboardAttempt[];
  levelAttempts: DashboardAttempt[];
  teacherQuizAttempts: DashboardAttempt[];
  lessonAssessments: DashboardAttempt[];
  recentAttempts: DashboardAttempt[];
  currentQuizStreakDays: number;
  recommendedTopic: { id: string; title: string } | null;
  achievementGoals: Array<{ id: string; name: string; description: string; icon: string; xpReward: number | null; requirementType: string; requirementValue: number | null }>;
  earnedAchievements: null;
  lessonReadingCompletion: null;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function getAttemptLabel(attempt: DashboardAttempt) {
  if (attempt.kind === 'quiz') return `${attempt.topicTitle} quiz`;
  if (attempt.kind === 'level') return `${attempt.topicTitle} · Level ${attempt.level}`;
  if (attempt.kind === 'teacher') return `${attempt.topicTitle} · Teacher Quiz`;
  return `${attempt.topicTitle} · ${attempt.lessonTitle}`;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function loadDashboard() {
      const currentRequestId = ++requestId;
      setDashboard(null);
      setIsLoading(true);
      setError('');

      try {
        const jwt = await createCurrentUserJWT();
        const response = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: 'no-store',
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load current dashboard data.';
          throw new Error(message);
        }
        if (active && currentRequestId === requestId) setDashboard(payload as DashboardData);
      } catch (loadError) {
        if (active && currentRequestId === requestId) {
          setDashboard(null);
          setError(loadError instanceof Error ? loadError.message : 'Unable to load current dashboard data.');
        }
      } finally {
        if (active && currentRequestId === requestId) setIsLoading(false);
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadDashboard();
    };
    const refreshOnDataChange = () => void loadDashboard();

    void loadDashboard();
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener(DASHBOARD_DATA_CHANGED_EVENT, refreshOnDataChange);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener(DASHBOARD_DATA_CHANGED_EVENT, refreshOnDataChange);
    };
  }, []);

  const averageCompletion = dashboard?.averageCompletion;
  const trackedTopicDetail = dashboard
    ? dashboard.progress.length > 0 ? `${dashboard.progress.length} topics tracked` : 'No topic progress records yet'
    : '';

  return (
    <AuthGuard allowedRoles={['student']}>
      <main className="section-shell py-14 sm:py-16">
        <SectionHeader title="Student dashboard" description="Your saved learning progress, assessment results, and next topic." />

        {error && <section className="glass-card mt-8 p-6" role="alert"><p className="text-sm text-rose-800">{error}</p><button type="button" onClick={() => window.dispatchEvent(new Event(DASHBOARD_DATA_CHANGED_EVENT))} className="btn-secondary mt-4">Try again</button></section>}
        {isLoading && !dashboard && <p className="glass-card mt-8 p-6 text-sm text-slate-600" role="status">Loading your saved dashboard...</p>}

        {dashboard && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]" aria-busy={isLoading}>
            <section className="space-y-6">
              <div className="glass-card p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Hi, {dashboard.profile.displayName || 'there'}! Ready for today’s challenge?</h2>
                <p className="mt-3 max-w-2xl text-base text-slate-600">Your dashboard reflects records saved to your student account.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DashboardCard
                  title="Learning progress"
                  value={averageCompletion === null ? 'No data' : `${averageCompletion}%`}
                  change={trackedTopicDetail}
                  tone="blue"
                />
                <DashboardCard
                  title="Points earned"
                  value={dashboard.profile.totalPoints === null ? 'Not recorded' : `${dashboard.profile.totalPoints} XP`}
                  change="Saved profile total"
                  tone="green"
                />
                <DashboardCard
                  title="Quiz streak"
                  value={`${dashboard.currentQuizStreakDays} ${dashboard.currentQuizStreakDays === 1 ? 'day' : 'days'}`}
                  change="From completed quiz and assessment dates"
                  tone="amber"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ProgressCard
                  label="Topics completed"
                  value={`${dashboard.completedTopics}`}
                  detail={dashboard.progress.length > 0 ? `of ${dashboard.progress.length} topics with saved progress` : 'No topic progress records yet'}
                />
                <ProgressCard
                  label="Lesson assessments"
                  value={`${dashboard.lessonAssessments.length}`}
                  detail="Completed scored lesson assessments; lesson reading is not tracked in the current schema"
                />
              </div>
            </section>

            <aside className="space-y-6">
              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended topic</p>
                {dashboard.recommendedTopic ? (
                  <>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900">{dashboard.recommendedTopic.title}</h3>
                    <a href={`/learn/${encodeURIComponent(dashboard.recommendedTopic.id)}`} className="btn-secondary mt-4 inline-flex">Open topic</a>
                  </>
                ) : <p className="mt-4 text-sm text-slate-600">No published topics are available.</p>}
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent activity</p>
                {dashboard.recentAttempts.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No saved quiz or assessment results yet.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {dashboard.recentAttempts.map((attempt) => (
                      <li key={attempt.attemptId} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-800">{getAttemptLabel(attempt)}</p>
                          <span className="text-xs text-slate-400">{formatDate(attempt.completedAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{attempt.score}/{attempt.totalQuestions} correct ({attempt.percentage}%)</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Achievement goals</p>
                {dashboard.achievementGoals.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No active achievement goals are published.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {dashboard.achievementGoals.map((goal) => (
                      <li key={goal.id} className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                        <p className="font-semibold text-slate-900">{goal.name}</p>
                        {goal.description && <p className="mt-1 text-sm text-slate-600">{goal.description}</p>}
                        {goal.xpReward !== null && <p className="mt-2 text-xs font-semibold text-amber-800">{goal.xpReward} XP reward</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-slate-500">Earned awards are not stored per student in the current schema.</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
