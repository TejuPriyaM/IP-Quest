'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import SectionHeader from '@/components/SectionHeader';
import { createQuizJWT } from '@/lib/auth';

type LevelQuizAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  level: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
};

type LessonAssessmentAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
};

type TeacherQuizAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
};

type PerformanceHistory = {
  levelAttempts: LevelQuizAttempt[];
  teacherQuizAttempts: TeacherQuizAttempt[];
  lessonAssessments: LessonAssessmentAttempt[];
};

const chartColors = ['#2563eb', '#059669', '#d97706'];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function AccuracyChart({ title, correct, total, color }: { title: string; correct: number; total: number; color: string }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const missing = total - correct;
  return (
    <article className="glass-card flex min-w-0 items-center gap-5 p-5" aria-label={`${title}: ${accuracy}% accuracy`}>
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={`${accuracy}% correct, ${total > 0 ? Math.round((missing / total) * 100) : 0}% incorrect`}>
        <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {total > 0 && (
          <circle cx="60" cy="60" r="44" fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${accuracy} ${100 - accuracy}`} pathLength="100" strokeDashoffset="25" transform="rotate(-90 60 60)" />
        )}
        <text x="60" y="57" textAnchor="middle" fill="#0f172a" fontSize="21" fontWeight="700">{total > 0 ? `${accuracy}%` : '--'}</text>
        <text x="60" y="74" textAnchor="middle" fill="#64748b" fontSize="10">accuracy</text>
      </svg>
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{correct} correct · {missing} incorrect</p>
        <p className="mt-1 text-xs text-slate-500">{total} answers across completed attempts</p>
      </div>
    </article>
  );
}

function ScoreTrendChart<T extends { attemptId: string; percentage: number; completedAt: string }>(
  { title, attempts, getColor, showLevelLegend = true, selectedAttemptId, onSelect }: {
    title: string;
    attempts: T[];
    getColor: (attempt: T) => string;
    showLevelLegend?: boolean;
    selectedAttemptId: string;
    onSelect: (attempt: T) => void;
  },
) {
  if (attempts.length === 0) {
    return <section className="glass-card p-5"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-3 text-sm text-slate-600">Your score trend will appear after your first completed attempt.</p></section>;
  }

  const width = 760;
  const height = 240;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = attempts.map((attempt, index) => ({
    ...attempt,
    x: left + (attempts.length === 1 ? plotWidth / 2 : (index / (attempts.length - 1)) * plotWidth),
    y: top + ((100 - attempt.percentage) / 100) * plotHeight,
  }));

  return (
    <section className="glass-card min-w-0 p-5 sm:p-6" aria-labelledby={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-heading`}>
      <h3 id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-heading`} className="font-bold text-slate-900">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${title} from oldest to newest attempt`}>
          {[0, 50, 100].map((percentage) => {
            const y = top + ((100 - percentage) / 100) * plotHeight;
            return <g key={percentage}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" /><text x={left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="12">{percentage}%</text></g>;
          })}
          {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="2" />}
          {points.map((point) => {
            const isSelected = point.attemptId === selectedAttemptId;
            return (
              <circle
                key={point.attemptId}
                cx={point.x}
                cy={point.y}
                r={isSelected ? 7 : 5}
                fill={getColor(point)}
                stroke={isSelected ? '#0f172a' : 'white'}
                strokeWidth={isSelected ? 2.5 : 2}
                role="button"
                tabIndex={0}
                aria-label={`${point.percentage}% on ${formatDate(point.completedAt)}. Select attempt result.`}
                aria-pressed={isSelected}
                className="cursor-pointer"
                onClick={() => onSelect(point)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(point);
                  }
                }}
              >
                <title>{`${point.percentage}% · ${formatDate(point.completedAt)} · click to view result`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="flex justify-between px-9 text-xs text-slate-500"><span>{formatDate(attempts[0].completedAt)}</span><span>{formatDate(attempts[attempts.length - 1].completedAt)}</span></div>
      </div>
      {showLevelLegend && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        {[1, 2, 3].map((level) => <span key={level} className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[level - 1] }} />Level {level}</span>)}
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" />Teacher Quiz</span>
      </div>}
    </section>
  );
}

export default function ProgressPage() {
  const [history, setHistory] = useState<PerformanceHistory | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState('');
  const [attemptPage, setAttemptPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      setIsLoading(true);
      setError('');
      try {
        const jwt = await createQuizJWT();
        const response = await fetch('/api/progress', { headers: { Authorization: `Bearer ${jwt}` } });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load your performance history.';
          throw new Error(message);
        }
        if (isActive) {
          const nextHistory = payload as PerformanceHistory;
          setHistory(nextHistory);
          const latestAttempt = [...nextHistory.levelAttempts, ...nextHistory.teacherQuizAttempts, ...nextHistory.lessonAssessments]
            .sort((first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime())[0];
          setSelectedAttemptId(latestAttempt?.attemptId ?? '');
        }
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'Unable to load your performance history.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadHistory();
    return () => { isActive = false; };
  }, []);

  const levelAttempts = history?.levelAttempts ?? [];
  const teacherQuizAttempts = history?.teacherQuizAttempts ?? [];
  const assessmentAttempts = history?.lessonAssessments ?? [];
  const quizAttempts = [...levelAttempts, ...teacherQuizAttempts].sort((first, second) => new Date(first.completedAt).getTime() - new Date(second.completedAt).getTime());
  const quizCorrect = quizAttempts.reduce((total, attempt) => total + attempt.score, 0);
  const quizQuestions = quizAttempts.reduce((total, attempt) => total + attempt.totalQuestions, 0);
  const assessmentCorrect = assessmentAttempts.reduce((total, attempt) => total + attempt.score, 0);
  const assessmentQuestions = assessmentAttempts.reduce((total, attempt) => total + attempt.totalQuestions, 0);
  const topicIds = Array.from(new Set(quizAttempts.map((attempt) => attempt.topicId)));
  const levelTopicIds = Array.from(new Set(levelAttempts.map((attempt) => attempt.topicId)));
  const lessonIds = Array.from(new Set(assessmentAttempts.map((attempt) => attempt.lessonId)));
  const selectedLevelAttempt = levelAttempts.find((attempt) => attempt.attemptId === selectedAttemptId);
  const selectedTeacherAttempt = teacherQuizAttempts.find((attempt) => attempt.attemptId === selectedAttemptId);
  const selectedAssessmentAttempt = assessmentAttempts.find((attempt) => attempt.attemptId === selectedAttemptId);
  const allAttempts = [
    ...levelAttempts.map((attempt) => ({ ...attempt, attemptType: 'Level Quiz', label: `${attempt.topicTitle} · Level ${attempt.level}` })),
    ...teacherQuizAttempts.map((attempt) => ({ ...attempt, attemptType: 'Teacher Quiz', label: `${attempt.topicTitle} · Teacher Quiz` })),
    ...assessmentAttempts.map((attempt) => ({ ...attempt, attemptType: 'Lesson Assessment', label: `${attempt.topicTitle} · ${attempt.lessonTitle}` })),
  ].sort((first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime());
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(allAttempts.length / pageSize));
  const currentAttemptPage = Math.min(attemptPage, pageCount);
  const pagedAttempts = allAttempts.slice((currentAttemptPage - 1) * pageSize, currentAttemptPage * pageSize);

  return (
    <AuthGuard allowedRoles={['student']}>
      <main className="section-shell py-10 sm:py-14">
        <SectionHeader title="Learning Progress" description="Review your quiz scores and lesson assessment results over time." />
        {error && <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        {isLoading ? <p className="glass-card mt-8 p-6 text-sm text-slate-600" role="status">Loading your results...</p> : !history ? <p className="glass-card mt-8 p-6 text-sm text-slate-600">Performance history is unavailable.</p> : (
          <div className="mt-8 space-y-6">
            <section aria-labelledby="quiz-history-heading">
              <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Quizzes</p><h2 id="quiz-history-heading" className="mt-1 text-2xl font-bold text-slate-900">Quiz performance</h2></div>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Completed attempts</p><p className="mt-2 text-3xl font-bold text-slate-900">{quizAttempts.length}</p></article>
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Topics attempted</p><p className="mt-2 text-3xl font-bold text-slate-900">{topicIds.length}</p></article>
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Overall accuracy</p><p className="mt-2 text-3xl font-bold text-brand-700">{quizQuestions > 0 ? `${Math.round((quizCorrect / quizQuestions) * 100)}%` : '--'}</p></article>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AccuracyChart title="Correct answers" correct={quizCorrect} total={quizQuestions} color="#2563eb" />
                <ScoreTrendChart title="Quiz scores over time" attempts={quizAttempts} getColor={(attempt) => 'level' in attempt && typeof attempt.level === 'number' ? chartColors[attempt.level - 1] ?? '#64748b' : '#64748b'} selectedAttemptId={selectedAttemptId} onSelect={(attempt) => setSelectedAttemptId(attempt.attemptId)} />
              </div>
              <section className="glass-card mt-4 p-5 sm:p-6" aria-live="polite" aria-labelledby="selected-attempt-heading">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Selected result</p>
                <h3 id="selected-attempt-heading" className="mt-1 text-lg font-bold text-slate-900">{selectedLevelAttempt ? `${selectedLevelAttempt.topicTitle} · Level ${selectedLevelAttempt.level}` : selectedTeacherAttempt ? `${selectedTeacherAttempt.topicTitle} · Teacher Quiz` : selectedAssessmentAttempt ? `${selectedAssessmentAttempt.topicTitle} · ${selectedAssessmentAttempt.lessonTitle}` : 'No completed attempts yet'}</h3>
                {(selectedLevelAttempt || selectedTeacherAttempt || selectedAssessmentAttempt) && <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div><p className="text-2xl font-bold text-brand-700">{(selectedLevelAttempt ?? selectedTeacherAttempt ?? selectedAssessmentAttempt)?.percentage}%</p><p className="text-xs text-slate-500">Score</p></div>
                  <div><p className="text-lg font-bold text-slate-900">{(selectedLevelAttempt ?? selectedTeacherAttempt ?? selectedAssessmentAttempt)?.score}/{(selectedLevelAttempt ?? selectedTeacherAttempt ?? selectedAssessmentAttempt)?.totalQuestions}</p><p className="text-xs text-slate-500">Correct answers</p></div>
                  <div><p className="text-sm font-semibold text-slate-900">{formatDate((selectedLevelAttempt ?? selectedTeacherAttempt ?? selectedAssessmentAttempt)!.completedAt)}</p><p className="text-xs text-slate-500">Completed</p></div>
                  <div><p className={`text-sm font-bold ${(selectedLevelAttempt ?? selectedTeacherAttempt)?.passed === false ? 'text-rose-700' : 'text-emerald-700'}`}>{(selectedLevelAttempt ?? selectedTeacherAttempt) ? (selectedLevelAttempt ?? selectedTeacherAttempt)?.passed ? 'Passed' : 'Not passed' : 'Completed'}</p><p className="text-xs text-slate-500">Result</p></div>
                </div>}
              </section>
              <div className="glass-card mt-4 overflow-hidden p-5 sm:p-6">
                <h3 className="font-bold text-slate-900">Best score by topic and level</h3>
                {levelTopicIds.length === 0 ? <p className="mt-3 text-sm text-slate-600">Your completed Level Quiz results will appear here.</p> : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-3 pr-4 font-semibold">Topic</th>
                          {[1, 2, 3].map((level) => <th key={level} className="px-3 pb-3 font-semibold">Level {level}</th>)}
                          <th className="px-3 pb-3 font-semibold">Overall best</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levelTopicIds.map((topicId) => {
                          const topicAttempts = levelAttempts.filter((attempt) => attempt.topicId === topicId);
                          const bestAttempts = [1, 2, 3].map((level) => topicAttempts
                            .filter((attempt) => attempt.level === level)
                            .sort((first, second) => second.percentage - first.percentage)[0]);
                          const hasAllLevels = bestAttempts.every((attempt) => attempt !== undefined);
                          const bestScore = bestAttempts.reduce((total, attempt) => total + (attempt?.score ?? 0), 0);
                          const bestTotal = bestAttempts.reduce((total, attempt) => total + (attempt?.totalQuestions ?? 0), 0);

                          return (
                            <tr key={topicId} className="border-b border-slate-100 last:border-0">
                              <th className="py-3 pr-4 font-semibold text-slate-900">{topicAttempts[0]?.topicTitle ?? 'Topic'}</th>
                              {bestAttempts.map((best, index) => (
                                <td key={index} className="px-3 py-3 text-slate-700">
                                  {best ? <>{best.score}/{best.totalQuestions} <span className="text-slate-500">({best.percentage}%)</span></> : 'Not attempted'}
                                </td>
                              ))}
                              <td className="px-3 py-3 font-semibold text-brand-700">
                                {hasAllLevels ? `${Math.round((bestScore / bestTotal) * 100)}% (${bestScore}/${bestTotal})` : 'Complete all levels'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="assessment-history-heading">
              <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Learn Assessments</p><h2 id="assessment-history-heading" className="mt-1 text-2xl font-bold text-slate-900">Lesson assessment performance</h2></div>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Completed assessments</p><p className="mt-2 text-3xl font-bold text-slate-900">{assessmentAttempts.length}</p></article>
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Lessons assessed</p><p className="mt-2 text-3xl font-bold text-slate-900">{lessonIds.length}</p></article>
                <article className="glass-card p-5"><p className="text-sm text-slate-500">Overall accuracy</p><p className="mt-2 text-3xl font-bold text-emerald-700">{assessmentQuestions > 0 ? `${Math.round((assessmentCorrect / assessmentQuestions) * 100)}%` : '--'}</p></article>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AccuracyChart title="Assessment answers" correct={assessmentCorrect} total={assessmentQuestions} color="#059669" />
                <ScoreTrendChart title="Assessment scores over time" attempts={assessmentAttempts} getColor={() => '#059669'} showLevelLegend={false} selectedAttemptId={selectedAttemptId} onSelect={(attempt) => setSelectedAttemptId(attempt.attemptId)} />
              </div>
              <div className="glass-card mt-4 p-5 sm:p-6">
                <h3 className="font-bold text-slate-900">Recent lesson assessments</h3>
                {assessmentAttempts.length === 0 ? <p className="mt-3 text-sm text-slate-600">Completed teacher lesson assessments will appear here.</p> : (
                  <ul className="mt-4 divide-y divide-slate-100">{[...assessmentAttempts].reverse().slice(0, 10).map((attempt) => <li key={attempt.attemptId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0"><div><p className="font-semibold text-slate-900">{attempt.lessonTitle}</p><p className="mt-1 text-xs text-slate-500">{attempt.topicTitle} · {formatDate(attempt.completedAt)}</p></div><p className="font-bold text-emerald-700">{attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)</p></li>)}</ul>
                )}
              </div>
            </section>
            <section className="glass-card overflow-hidden p-5 sm:p-6" aria-labelledby="attempt-history-heading">
              <h2 id="attempt-history-heading" className="text-xl font-bold text-slate-900">All attempts</h2>
              {allAttempts.length === 0 ? <p className="mt-3 text-sm text-slate-600">Completed quiz and assessment attempts will appear here.</p> : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4 font-semibold">Date</th><th className="pb-3 pr-4 font-semibold">Type</th><th className="pb-3 pr-4 font-semibold">Topic / lesson</th><th className="pb-3 pr-4 font-semibold">Score</th><th className="pb-3 font-semibold">Result</th></tr></thead>
                    <tbody>{pagedAttempts.map((attempt) => (
                      <Fragment key={attempt.attemptId}>
                        <tr className={`border-b border-slate-100 ${selectedAttemptId === attempt.attemptId ? 'bg-brand-50/60' : ''}`}>
                          <td className="py-3 pr-4 text-slate-600">{formatDate(attempt.completedAt)}</td>
                          <td className="py-3 pr-4 text-slate-600">{attempt.attemptType}</td>
                          <td className="py-3 pr-4 font-medium text-slate-900">{attempt.label}</td>
                          <td className="py-3 pr-4 font-semibold text-slate-900">{attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)</td>
                          <td className="py-3"><button type="button" aria-expanded={selectedAttemptId === attempt.attemptId} onClick={() => setSelectedAttemptId((current) => current === attempt.attemptId ? '' : attempt.attemptId)} className="font-semibold text-brand-700 underline-offset-2 hover:underline">{('passed' in attempt && (attempt.attemptType === 'Level Quiz' || attempt.attemptType === 'Teacher Quiz')) ? attempt.passed ? 'Passed · View' : 'Not passed · View' : 'View result'}</button></td>
                        </tr>
                        {selectedAttemptId === attempt.attemptId && (
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td colSpan={5} className="px-4 py-4">
                              <div className="grid gap-3 sm:grid-cols-4">
                                <div><p className="text-xs font-semibold uppercase text-slate-500">Attempt</p><p className="mt-1 font-semibold text-slate-900">{attempt.label}</p></div>
                                <div><p className="text-xs font-semibold uppercase text-slate-500">Score</p><p className="mt-1 font-semibold text-slate-900">{attempt.score} of {attempt.totalQuestions} ({attempt.percentage}%)</p></div>
                                <div><p className="text-xs font-semibold uppercase text-slate-500">Completed</p><p className="mt-1 font-semibold text-slate-900">{formatDate(attempt.completedAt)}</p></div>
                                <div><p className="text-xs font-semibold uppercase text-slate-500">Result</p><p className={`mt-1 font-semibold ${('passed' in attempt && (attempt.attemptType === 'Level Quiz' || attempt.attemptType === 'Teacher Quiz')) ? attempt.passed ? 'text-emerald-700' : 'text-rose-700' : 'text-emerald-700'}`}>{('passed' in attempt && (attempt.attemptType === 'Level Quiz' || attempt.attemptType === 'Teacher Quiz')) ? attempt.passed ? 'Passed' : 'Not passed' : 'Completed'}</p></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {allAttempts.length > pageSize && <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">Showing {(currentAttemptPage - 1) * pageSize + 1}-{Math.min(currentAttemptPage * pageSize, allAttempts.length)} of {allAttempts.length} attempts</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setAttemptPage((page) => Math.max(1, page - 1))} disabled={currentAttemptPage === 1} className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                  <span className="text-sm font-semibold text-slate-700">{currentAttemptPage} / {pageCount}</span>
                  <button type="button" onClick={() => setAttemptPage((page) => Math.min(pageCount, page + 1))} disabled={currentAttemptPage === pageCount} className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>}
            </section>
            <div className="flex flex-wrap gap-3"><Link href="/learn" className="btn-primary">Continue learning</Link><Link href="/games" className="btn-secondary">Games</Link></div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
