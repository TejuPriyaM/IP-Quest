'use client';

import { useCallback, useEffect, useState } from 'react';
import { createQuizJWT } from '@/lib/auth';

type QuizTopic = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type LevelState = {
  level: number;
  passed: boolean;
  unlocked: boolean;
  inProgressAttemptId: string | null;
};

type QuizAttemptHistory = {
  attemptId: string;
  level: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
};

type ProgressPayload = {
  topicId: string;
  topicTitle: string;
  passPercentage: number;
  questionsPerLevel: number;
  levels: LevelState[];
  attemptHistory: QuizAttemptHistory[];
};

type LevelCompletionResult = {
  attemptId: string;
  topicId: string;
  level: number;
  score: number;
  totalQuestions: number;
  wrong: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  passPercentage: number;
};

type LevelQuestion = {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  hint: string;
};

type AnswerFeedback = {
  questionId: string;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
};

type StartedAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  level: number;
  passPercentage: number;
  questions: LevelQuestion[];
  answers: Array<{ questionId: string; selectedOption: string }>;
  answerFeedback: AnswerFeedback[];
  answersById: Record<string, string>;
};

const historyChartColors = ['#2563eb', '#059669', '#d97706'];

function formatAttemptDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function QuizHistoryChart({ attempts }: { attempts: QuizAttemptHistory[] }) {
  if (attempts.length === 0) {
    return <p className="mt-4 text-sm text-slate-600">Complete a level to start building your quiz history.</p>;
  }

  const width = 720;
  const height = 240;
  const left = 42;
  const right = 16;
  const top = 16;
  const bottom = 30;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = attempts.map((attempt, index) => ({
    ...attempt,
    x: left + (attempts.length === 1 ? plotWidth / 2 : (index / (attempts.length - 1)) * plotWidth),
    y: top + ((100 - attempt.percentage) / 100) * plotHeight,
  }));

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Quiz score history from oldest to newest attempt">
          {[0, 50, 100].map((percentage) => {
            const y = top + ((100 - percentage) / 100) * plotHeight;
            return (
              <g key={percentage}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" />
                <text x={left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="12">{percentage}%</text>
              </g>
            );
          })}
          {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="2" />}
          {points.map((point) => (
            <circle key={point.attemptId} cx={point.x} cy={point.y} r="5" fill={historyChartColors[point.level - 1] ?? '#64748b'} stroke="white" strokeWidth="2">
              <title>{`Level ${point.level}: ${point.percentage}% on ${formatAttemptDate(point.completedAt)}`}</title>
            </circle>
          ))}
        </svg>
        <div className="flex justify-between px-9 text-xs text-slate-500">
          <span>{formatAttemptDate(attempts[0].completedAt)}</span>
          <span>{formatAttemptDate(attempts[attempts.length - 1].completedAt)}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600" aria-label="Chart legend">
        {[1, 2, 3].map((level) => (
          <span key={level} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: historyChartColors[level - 1] }} />
            Level {level}
          </span>
        ))}
      </div>
    </div>
  );
}

async function quizRequest<T>(url: string, body?: Record<string, unknown>): Promise<T> {
  const jwt = await createQuizJWT();
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${jwt}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Unable to load this quiz. Please try again.';
    throw new Error(message);
  }
  return payload as T;
}

export default function LevelQuiz({ topic, initialLevel }: { topic: QuizTopic; initialLevel?: number | null }) {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [completedResult, setCompletedResult] = useState<LevelCompletionResult | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<StartedAttempt | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, AnswerFeedback>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [error, setError] = useState('');

  const startLevel = useCallback(async (level: number) => {
    setError('');
    setIsLoading(true);
    try {
      const attempt = await quizRequest<StartedAttempt>('/api/quiz/levels', { action: 'start', topicId: topic.id, level });
      setActiveAttempt(attempt);
      setCompletedResult(null);
      setSelectedAnswers(attempt.answersById ?? {});
      setFeedback(Object.fromEntries((attempt.answerFeedback ?? []).map((item) => [item.questionId, item])));
      const firstUnanswered = attempt.questions.findIndex((question) => !attempt.answersById?.[question.id]);
      setCurrentIndex(firstUnanswered < 0 ? attempt.questions.length - 1 : firstUnanswered);
      setIsHintVisible(false);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start this level.');
    } finally {
      setIsLoading(false);
    }
  }, [topic.id]);

  useEffect(() => {
    let isActive = true;

    async function loadProgress() {
      try {
        const jwt = await createQuizJWT();
        const response = await fetch(`/api/quiz/levels?topicId=${encodeURIComponent(topic.id)}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load quiz progress.';
          throw new Error(message);
        }
        if (!isActive) return;
        const nextProgress = payload as ProgressPayload;
        setProgress(nextProgress);
        const inProgress = nextProgress.levels.find((level) => level.level === initialLevel && level.inProgressAttemptId)
          ?? (initialLevel ? undefined : nextProgress.levels.find((level) => level.inProgressAttemptId));
        const startLevelNumber = initialLevel ?? inProgress?.level;
        if (startLevelNumber) {
          await startLevel(startLevelNumber);
        }
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'Unable to load quiz progress.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadProgress();
    return () => {
      isActive = false;
    };
  }, [initialLevel, startLevel, topic.id]);

  async function submitAnswer(question: LevelQuestion, selectedOption: string) {
    if (!activeAttempt || selectedAnswers[question.id] || isAnswering) return;
    setIsAnswering(true);
    setError('');
    try {
      const result = await quizRequest<AnswerFeedback & { answeredCount: number }>('/api/quiz/levels', {
        action: 'answer',
        attemptId: activeAttempt.attemptId,
        questionId: question.id,
        selectedOption,
      });
      setSelectedAnswers((current) => ({ ...current, [question.id]: selectedOption }));
      setFeedback((current) => ({ ...current, [question.id]: result }));
    } catch (answerError) {
      setError(answerError instanceof Error ? answerError.message : 'Unable to save your answer.');
    } finally {
      setIsAnswering(false);
    }
  }

  async function completeAttempt() {
    if (!activeAttempt || isCompleting) return;
    setIsCompleting(true);
    setError('');
    try {
      const result = await quizRequest<LevelCompletionResult>('/api/quiz/levels', {
        action: 'complete',
        attemptId: activeAttempt.attemptId,
      });
      setCompletedResult(result);
      setActiveAttempt(null);
      setProgress((current) => current ? {
        ...current,
        levels: current.levels.map((level) => ({
          ...level,
          passed: level.level === result.level ? level.passed || result.passed : level.passed,
          unlocked: level.level === result.level + 1 ? level.unlocked || result.passed : level.unlocked,
        })),
        attemptHistory: [...current.attemptHistory.filter((attempt) => attempt.attemptId !== result.attemptId), {
          attemptId: result.attemptId,
          level: result.level,
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          passed: result.passed,
          completedAt: result.completedAt,
        }].sort((first, second) => new Date(first.completedAt).getTime() - new Date(second.completedAt).getTime()),
      } : current);
      void quizRequest<ProgressPayload>(`/api/quiz/levels?topicId=${encodeURIComponent(topic.id)}`)
        .then(setProgress)
        .catch(() => undefined);
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'Unable to finish this level.');
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading && !progress && !activeAttempt) {
    return <p className="glass-card p-6 text-sm text-slate-600" role="status">Loading quiz levels...</p>;
  }

  if (completedResult) {
    return (
      <section className="glass-card min-w-0 p-5 sm:p-8" aria-labelledby="level-result-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{topic.title} · Level {completedResult.level}</p>
        <h2 id="level-result-heading" className="mt-2 text-2xl font-bold text-slate-900">Level result</h2>
        <p className={`mt-4 text-lg font-bold ${completedResult.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
          {completedResult.passed ? 'Passed' : 'Not passed'} · {completedResult.passPercentage}% required
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
          <div><p className="text-3xl font-bold text-brand-700">{completedResult.percentage}%</p><p className="mt-1 text-sm text-slate-500">Final score</p></div>
          <div><p className="text-3xl font-bold text-slate-900">{completedResult.score}/{completedResult.totalQuestions}</p><p className="mt-1 text-sm text-slate-500">Correct answers</p></div>
          <div className="col-span-2 sm:col-span-1"><p className="text-lg font-semibold text-slate-900">{formatAttemptDate(completedResult.completedAt)}</p><p className="mt-1 text-sm text-slate-500">Completed</p></div>
        </div>
        {!completedResult.passed && completedResult.level < 3 && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            Score at least {completedResult.passPercentage}% to unlock Level {completedResult.level + 1}. Retry this level when you are ready.
          </p>
        )}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => void startLevel(completedResult.level)} disabled={isLoading} className="btn-primary disabled:opacity-50">Retry Quiz</button>
          {completedResult.passed && completedResult.level < 3 && (
            <button type="button" onClick={() => void startLevel(completedResult.level + 1)} disabled={isLoading} className="btn-secondary disabled:opacity-50">Continue to Level {completedResult.level + 1}</button>
          )}
          <button type="button" onClick={() => setCompletedResult(null)} className="btn-secondary">Back to levels</button>
        </div>
      </section>
    );
  }

  if (activeAttempt) {
    const question = activeAttempt.questions[currentIndex];
    const selectedOption = selectedAnswers[question.id] ?? '';
    const currentFeedback = feedback[question.id];
    const isLastQuestion = currentIndex === activeAttempt.questions.length - 1;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercent = ((currentIndex + 1) / activeAttempt.questions.length) * 100;

    return (
      <section className="glass-card min-w-0 p-5 sm:p-8" aria-labelledby="level-question-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-600">{activeAttempt.topicTitle} - Level {activeAttempt.level}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">Question {currentIndex + 1} of {activeAttempt.questions.length}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{question.difficulty}</span>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Quiz progress" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={activeAttempt.questions.length}>
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
          <h2 id="level-question-heading" className="break-words text-xl font-bold leading-8 text-slate-900 sm:text-2xl">{question.question}</h2>
          {question.hint && (
            <div className="mt-4">
              <button type="button" onClick={() => setIsHintVisible((visible) => !visible)} className="btn-secondary min-h-11 px-4 py-2">💡 {isHintVisible ? 'Hide hint' : 'Hint'}</button>
              {isHintVisible && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{question.hint}</p>}
            </div>
          )}
          <div className="mt-6 grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const optionTone = currentFeedback && isSelected
                ? currentFeedback.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-rose-400 bg-rose-50 text-rose-950'
                : isSelected ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50';
              return (
                <button key={`${question.id}-${option}`} type="button" onClick={() => void submitAnswer(question, option)} disabled={Boolean(selectedOption) || isAnswering} aria-pressed={isSelected} className={`flex min-h-14 min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed ${optionTone}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">{String.fromCharCode(65 + index)}</span>
                  <span className="break-words">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
        {currentFeedback && (
          <div className={`mt-5 rounded-xl border p-4 ${currentFeedback.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-950'}`} role="status">
            <p className="font-bold">{currentFeedback.isCorrect ? 'Correct!' : 'Not quite.'}</p>
            {!currentFeedback.isCorrect && currentFeedback.correctAnswer && <p className="mt-1 text-sm"><span className="font-semibold">Correct answer:</span> {currentFeedback.correctAnswer}</p>}
            {currentFeedback.explanation && <p className="mt-2 text-sm leading-6">{currentFeedback.explanation}</p>}
          </div>
        )}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => { setActiveAttempt(null); setError(''); }} className="btn-secondary">Level selection</button>
          {isLastQuestion ? (
            <button type="button" onClick={() => void completeAttempt()} disabled={answeredCount !== activeAttempt.questions.length || isCompleting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{isCompleting ? 'Finishing...' : 'Finish Quiz'}</button>
          ) : (
            <button type="button" onClick={() => { setCurrentIndex((index) => index + 1); setIsHintVisible(false); }} disabled={!selectedOption || !currentFeedback} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">Next Question <span className="ml-2" aria-hidden="true">-&gt;</span></button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="level-selection-heading">
      <div className="glass-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.title} quiz</p>
        <h2 id="level-selection-heading" className="mt-2 text-2xl font-bold text-slate-900">Choose a level</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{progress ? `Pass each level with ${progress.passPercentage}% or more to unlock the next one.` : 'Pass each level to unlock the next one.'}</p>
        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {progress?.levels.map((level) => (
            <div key={level.level} className={`rounded-2xl border p-4 ${level.unlocked ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="font-bold text-slate-900">Level {level.level}</p>
              <p className="mt-1 text-sm text-slate-600">{level.passed ? '✓ Completed' : level.unlocked ? level.inProgressAttemptId ? 'In progress' : '🔓 Available' : '🔒 Locked'}</p>
              <button type="button" onClick={() => void startLevel(level.level)} disabled={!level.unlocked || isLoading} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">
                {level.passed ? 'Play again' : level.inProgressAttemptId ? 'Resume' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <section id="level-quiz-overall" className="glass-card p-5 sm:p-7" aria-labelledby="level-quiz-overall-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Performance history</p>
        <h2 id="level-quiz-overall-heading" className="mt-2 text-2xl font-bold text-slate-900">Overall results</h2>
        {(() => {
          const bestByLevel = [1, 2, 3].map((level) => {
            const attempts = (progress?.attemptHistory ?? []).filter((attempt) => attempt.level === level);
            return attempts.sort((first, second) => second.percentage - first.percentage)[0];
          });
          const allLevelsAttempted = bestByLevel.every((attempt) => attempt !== undefined);
          const bestTotal = bestByLevel.reduce((total, attempt) => total + (attempt?.score ?? 0), 0);
          const questionTotal = bestByLevel.reduce((total, attempt) => total + (attempt?.totalQuestions ?? 0), 0);
          const overallPercentage = questionTotal > 0 ? Math.round((bestTotal / questionTotal) * 100) : 0;

          return (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {bestByLevel.map((attempt, index) => (
                  <article key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="font-bold text-slate-900">Level {index + 1}</h3>
                    {attempt ? (
                      <>
                        <p className="mt-2 text-xl font-bold text-brand-700">{attempt.percentage}%</p>
                        <p className="mt-1 text-sm text-slate-600">Best: {attempt.score}/{attempt.totalQuestions}</p>
                        <p className="mt-1 text-xs text-slate-500">{(progress?.attemptHistory ?? []).filter((item) => item.level === index + 1).length} attempt(s)</p>
                      </>
                    ) : <p className="mt-2 text-sm text-slate-500">No completed attempts</p>}
                  </article>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-600">Overall best across all three levels</p>
                <p className="mt-1 text-3xl font-bold text-brand-700">{allLevelsAttempted ? `${overallPercentage}%` : '--'}</p>
                <p className="mt-1 text-sm text-slate-500">{allLevelsAttempted ? `${bestTotal}/${questionTotal} correct` : 'Complete all three levels to see an overall score.'}</p>
              </div>
              <h3 className="mt-6 font-bold text-slate-900">Score over time</h3>
              <QuizHistoryChart attempts={progress?.attemptHistory ?? []} />
              {(progress?.attemptHistory.length ?? 0) > 0 && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <h3 className="font-bold text-slate-900">Recent attempts</h3>
                  <ul className="mt-3 space-y-2">
                    {[...(progress?.attemptHistory ?? [])].slice(-5).reverse().map((attempt) => (
                      <li key={attempt.attemptId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                        <span className="text-slate-600">{formatAttemptDate(attempt.completedAt)} · Level {attempt.level}</span>
                        <span className="font-semibold text-slate-900">{attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%) · {attempt.passed ? 'Passed' : 'Not passed'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          );
        })()}
      </section>
      <p className="text-sm text-slate-500">Each level has {progress?.questionsPerLevel ?? 10} questions. Your answers are saved as you go.</p>
    </section>
  );
}
