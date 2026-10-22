'use client';

import { FormEvent, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SectionHeader from '@/components/SectionHeader';
import { createCurrentUserJWT } from '@/lib/auth';

type ProgressAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
} & (
  | { kind: 'level'; level: number; passed: boolean }
  | { kind: 'teacher'; passed: boolean }
  | { kind: 'assessment'; lessonId: string; lessonTitle: string }
);

type StudentProgress = {
  student: { displayName: string };
  levelAttempts: ProgressAttempt[];
  teacherQuizAttempts: ProgressAttempt[];
  lessonAssessments: ProgressAttempt[];
};

type StudentAction = 'view' | 'request';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function AttemptList({ title, attempts }: { title: string; attempts: ProgressAttempt[] }) {
  return (
    <section className="border-t border-slate-200 pt-5" aria-label={title}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      {attempts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No completed results.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-semibold">Module</th>
                <th className="px-3 py-2 font-semibold">Assessment</th>
                <th className="px-3 py-2 font-semibold">Score</th>
                <th className="px-3 py-2 font-semibold">Completed</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.attemptId} className="border-b border-slate-100 last:border-0">
                  <th className="py-3 pr-4 font-medium text-slate-900">{attempt.topicTitle}</th>
                  <td className="px-3 py-3 text-slate-700">
                    {attempt.kind === 'level'
                      ? `Level ${attempt.level}`
                      : attempt.kind === 'teacher'
                        ? 'Teacher Quiz'
                        : attempt.lessonTitle}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(attempt.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function TeacherProgressPage() {
  const [email, setEmail] = useState('');
  const [action, setAction] = useState<StudentAction>('view');
  const [report, setReport] = useState<StudentProgress | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function searchStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReport(null);
    setError('');
    setNotice('');
    setIsLoading(true);

    try {
      const jwt = await createCurrentUserJWT();
      const response = await fetch(action === 'request' ? '/api/teacher/assignments' : '/api/teacher/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'Unable to load the student progress report.';
        if (action === 'view' && response.status === 404) {
          setNotice('No approved access is available for this email. If this is a student account, choose Request access to ask an administrator.');
          return;
        }
        if (action === 'request' && response.status === 409 && typeof payload === 'object' && payload !== null && 'assignmentStatus' in payload) {
          const status = payload.assignmentStatus;
          if (status === 'pending') {
            setNotice('This request is pending administrator approval.');
            return;
          }
          if (status === 'approved') {
            setNotice('Access is already approved. Choose View progress to see the authorized results.');
            return;
          }
        }
        throw new Error(message);
      }
      if (action === 'request') {
        setNotice('Access request sent. It will remain pending until an administrator reviews it.');
      } else {
        setReport(payload as StudentProgress);
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Unable to load the student progress report.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard allowedRoles={['teacher']}>
      <main className="section-shell py-10 sm:py-14">
        <SectionHeader title="Student Progress" description="Review authorized quiz and lesson assessment results." />
        <form onSubmit={searchStudent} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex shrink-0 gap-2" role="group" aria-label="Student action">
            <button
              type="button"
              aria-pressed={action === 'view'}
              onClick={() => { setAction('view'); setReport(null); setNotice(''); setError(''); }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${action === 'view' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
            >
              View progress
            </button>
            <button
              type="button"
              aria-pressed={action === 'request'}
              onClick={() => { setAction('request'); setReport(null); setNotice(''); setError(''); }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${action === 'request' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
            >
              Request access
            </button>
          </div>
          <div className="w-full max-w-md">
            <label htmlFor="student-email" className="mb-2 block text-sm font-semibold text-slate-700">Student registered email</label>
            <input
              id="student-email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? 'Working...' : action === 'request' ? 'Send request' : 'Search student'}
          </button>
        </form>

        {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
        {isLoading && <p role="status" className="mt-5 text-sm text-slate-600">Loading student results...</p>}
        {report && (
          <section className="mt-8" aria-labelledby="student-report-heading">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Authorized student report</p>
              <h2 id="student-report-heading" className="mt-1 text-2xl font-bold text-slate-900">{report.student.displayName}</h2>
            </div>
            <div className="mt-5 space-y-6">
              <AttemptList title="Module quizzes" attempts={report.levelAttempts} />
              <AttemptList title="Teacher quizzes" attempts={report.teacherQuizAttempts} />
              <AttemptList title="Lesson assessments" attempts={report.lessonAssessments} />
            </div>
            <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
              Game scores and lesson completion are not available from the current Appwrite records.
            </p>
          </section>
        )}
      </main>
    </AuthGuard>
  );
}