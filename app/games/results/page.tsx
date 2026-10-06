'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createQuizJWT } from '@/lib/auth';
import { listTopics, type TopicRow } from '@/lib/topics';

type QuizResult = {
  success: true;
  attemptId: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  percentage: number;
};

type QuizMistake = {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  level?: number;
};

type LevelResult = {
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
  mistakes: QuizMistake[];
};

type OverallResult = {
  overall: true;
  topicId: string;
  topicTitle: string;
  completedLevels: number;
  totalLevels: number;
  score: number;
  totalQuestions: number;
  wrong: number;
  percentage: number;
  levelResults: Array<{ level: number; score: number; totalQuestions: number; percentage: number; mistakes: QuizMistake[] }>;
  weakestLevel: number;
  mistakes: QuizMistake[];
};

type ResultData = QuizResult | LevelResult | OverallResult;

function isQuizResult(value: unknown): value is QuizResult {
  if (typeof value !== 'object' || value === null) return false;

  const result = value as Record<string, unknown>;
  return (
    result.success === true &&
    typeof result.attemptId === 'string' &&
    typeof result.topicId === 'string' &&
    typeof result.score === 'number' &&
    typeof result.totalQuestions === 'number' &&
    typeof result.completedAt === 'string' &&
    typeof result.percentage === 'number'
  );
}

function isMistakeList(value: unknown): value is QuizMistake[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null &&
    'questionId' in item && typeof item.questionId === 'string' &&
    'question' in item && typeof item.question === 'string' &&
    'selectedAnswer' in item && typeof item.selectedAnswer === 'string' &&
    'correctAnswer' in item && typeof item.correctAnswer === 'string' &&
    'explanation' in item && typeof item.explanation === 'string');
}

function isLevelResult(value: unknown): value is LevelResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Record<string, unknown>;
  return typeof result.attemptId === 'string' && typeof result.topicId === 'string' &&
    typeof result.level === 'number' && typeof result.score === 'number' &&
    typeof result.totalQuestions === 'number' && typeof result.wrong === 'number' &&
    typeof result.percentage === 'number' && typeof result.passed === 'boolean' &&
    typeof result.completedAt === 'string' && typeof result.passPercentage === 'number' &&
    isMistakeList(result.mistakes);
}

function isOverallResult(value: unknown): value is OverallResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Record<string, unknown>;
  return result.overall === true && typeof result.topicId === 'string' &&
    typeof result.topicTitle === 'string' && typeof result.completedLevels === 'number' &&
    typeof result.totalLevels === 'number' && typeof result.score === 'number' &&
    typeof result.totalQuestions === 'number' && typeof result.wrong === 'number' &&
    typeof result.percentage === 'number' && typeof result.weakestLevel === 'number' &&
    isOverallResultLevels(result.levelResults) && isMistakeList(result.mistakes);
}

function isOverallResultLevels(value: unknown): value is OverallResult['levelResults'] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null &&
    'level' in item && typeof item.level === 'number' &&
    'score' in item && typeof item.score === 'number' &&
    'totalQuestions' in item && typeof item.totalQuestions === 'number' &&
    'percentage' in item && typeof item.percentage === 'number' &&
    'mistakes' in item && isMistakeList(item.mistakes));
}

function getResultFeedbackMessage(percentage: number) {
  if (percentage === 100) return 'Perfect score. Your IP knowledge is sparkling!';
  if (percentage >= 40) return 'Good start. Review the lesson and try another round.';
  return 'Every question is a clue. Keep learning and try again.';
}

function MistakeReview({ mistakes }: { mistakes: QuizMistake[] }) {
  return (
    <section className="mt-8 text-left" aria-labelledby="mistake-review-heading">
      <h2 id="mistake-review-heading" className="text-xl font-bold text-slate-900">Review mistakes</h2>
      {mistakes.length === 0 ? <p className="mt-3 text-sm text-slate-600">No mistakes in this result.</p> : (
        <div className="mt-4 grid gap-4">
          {mistakes.map((mistake) => (
            <article key={`${mistake.level ?? 'level'}-${mistake.questionId}`} className="glass-card p-5">
              {mistake.level && <p className="text-xs font-semibold uppercase text-brand-600">Level {mistake.level}</p>}
              <h3 className="mt-1 font-bold text-slate-900">{mistake.question}</h3>
              <p className="mt-3 text-sm text-rose-800"><span className="font-semibold">Your answer:</span> {mistake.selectedAnswer}</p>
              <p className="mt-1 text-sm text-emerald-800"><span className="font-semibold">Correct answer:</span> {mistake.correctAnswer}</p>
              {mistake.explanation && <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-800">Explanation:</span> {mistake.explanation}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<main className="section-shell py-10 sm:py-14"><p className="text-slate-600">Loading results...</p></main>}><ResultsContent /></Suspense>;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId')?.trim() ?? '';
  const mode = searchParams.get('mode') ?? 'legacy';
  const topicId = searchParams.get('topicId')?.trim() ?? '';
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    listTopics()
      .then((rows) => {
        if (isActive) setTopics(rows);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadResult() {
      setResult(null);
      setError(null);

      if (mode === 'overall' ? !topicId : !attemptId) {
        setError(mode === 'overall' ? 'A quiz topic is required to view the overall result.' : 'A quiz attempt ID is required to view this result.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let jwt: string;
        try {
          jwt = await createQuizJWT();
        } catch {
          if (isActive) setError('Your session could not be verified. Please sign in again.');
          return;
        }

        const parameters = new URLSearchParams();
        if (mode === 'overall') {
          parameters.set('mode', 'overall');
          parameters.set('topicId', topicId);
        } else {
          if (mode === 'level') parameters.set('mode', 'level');
          parameters.set('attemptId', attemptId);
        }
        const response = await fetch(`/api/quiz/results?${parameters.toString()}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!isActive) return;

        if (!response.ok) {
          const message = response.status === 401
            ? 'Your session has expired. Please sign in again.'
            : response.status === 403
              ? 'This quiz result is not available for your account.'
              : response.status === 404
                ? 'Quiz result not found.'
                : 'We could not load this quiz result. Please try again.';
          setError(message);
          return;
        }

        const payload: unknown = await response.json();
        if (mode === 'overall') {
          if (!isOverallResult(payload) || payload.topicId !== topicId) {
            setError('We could not verify this quiz result. Please try again.');
            return;
          }
          if (isActive) setResult(payload);
        } else if (mode === 'level') {
          if (!isLevelResult(payload) || payload.attemptId !== attemptId) {
            setError('We could not verify this quiz result. Please try again.');
            return;
          }
          if (isActive) setResult(payload);
        } else {
          if (!isQuizResult(payload) || payload.attemptId !== attemptId) {
            setError('We could not verify this quiz result. Please try again.');
            return;
          }
          if (isActive) setResult(payload);
        }
      } catch {
        if (isActive) setError('We could not load this quiz result. Check your connection and try again.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadResult();
    return () => {
      isActive = false;
    };
  }, [attemptId, mode, topicId]);

  if (isLoading || (result !== null && !('overall' in result) && result.attemptId !== attemptId)) {
    return <main className="section-shell py-10 sm:py-14"><p className="glass-card mx-auto max-w-2xl p-6 text-slate-600" role="status">Loading results...</p></main>;
  }

  if (error || !result) {
    return (
      <main className="section-shell py-10 sm:py-14">
        <section className="glass-card mx-auto max-w-2xl p-6 sm:p-8 text-center" role="alert">
          <h1 className="text-2xl font-bold text-slate-900">Result unavailable</h1>
          <p className="mt-3 text-slate-600">{error ?? 'We could not load this quiz result.'}</p>
          <Link href="/games" className="btn-secondary mt-6">Return to games</Link>
        </section>
      </main>
    );
  }

  if ('overall' in result) {
    return (
      <main className="section-shell py-10 sm:py-14">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Topic complete</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{result.topicTitle} Quiz Complete</h1>
          <p className="mt-3 text-slate-600">Levels completed: {result.completedLevels} / {result.totalLevels}</p>
          <div className="glass-card mt-7 p-6 sm:p-8">
            <p className="text-5xl font-bold text-brand-600">{result.percentage}%</p>
            <p className="mt-2 font-semibold text-slate-600">Overall percentage</p>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
              <div><p className="text-xl font-bold text-slate-900">{result.totalQuestions}</p><p className="text-xs text-slate-500">Attempted</p></div>
              <div><p className="text-xl font-bold text-emerald-700">{result.score}</p><p className="text-xs text-slate-500">Correct</p></div>
              <div><p className="text-xl font-bold text-rose-700">{result.wrong}</p><p className="text-xs text-slate-500">Wrong</p></div>
            </div>
          </div>
          <section className="glass-card mt-5 p-5 text-left" aria-labelledby="topic-performance-heading">
            <h2 id="topic-performance-heading" className="font-bold text-slate-900">Level performance</h2>
            <ul className="mt-3 space-y-2">
              {result.levelResults.map((level) => <li key={level.level} className="flex justify-between gap-4 text-sm"><span>Level {level.level}</span><span className="font-semibold">{level.score}/{level.totalQuestions} ({level.percentage}%)</span></li>)}
            </ul>
            <p className="mt-4 text-sm leading-6 text-slate-600">Weakest area: Level {result.weakestLevel}. Review the missed questions from that level before trying another topic.</p>
          </section>
          <MistakeReview mistakes={result.mistakes} />
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/games/quiz?topic=${encodeURIComponent(result.topicId)}`} className="btn-primary">Return to levels</Link>
            <Link href="/games" className="btn-secondary">Return to games</Link>
            <Link href="/learn" className="btn-secondary">Return to learning</Link>
          </div>
        </section>
      </main>
    );
  }

  if ('level' in result) {
    const topic = topics.find((item) => item.$id === result.topicId);
    const retryHref = `/games/quiz?topic=${encodeURIComponent(result.topicId)}&level=${result.level}`;
    const nextLevelHref = `/games/quiz?topic=${encodeURIComponent(result.topicId)}&level=${result.level + 1}`;
    return (
      <main className="section-shell py-10 sm:py-14">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Level {result.level} complete</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{topic?.title ?? 'Quiz'} - Level {result.level}</h1>
          <div className="glass-card mt-7 p-6 sm:p-8">
            <p className={`text-3xl font-bold ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}>{result.passed ? 'PASS ✓' : 'Try Again'}</p>
            <p className="mt-2 text-sm text-slate-600">Passing score: {result.passPercentage}%</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
              <div><p className="text-xl font-bold text-slate-900">{result.totalQuestions}</p><p className="text-xs text-slate-500">Total questions</p></div>
              <div><p className="text-xl font-bold text-emerald-700">{result.score}</p><p className="text-xs text-slate-500">Correct</p></div>
              <div><p className="text-xl font-bold text-rose-700">{result.wrong}</p><p className="text-xs text-slate-500">Wrong</p></div>
              <div><p className="text-xl font-bold text-brand-700">{result.percentage}%</p><p className="text-xs text-slate-500">Percentage</p></div>
            </div>
          </div>
          <MistakeReview mistakes={result.mistakes} />
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={retryHref} className="btn-primary">Retry Level {result.level}</Link>
            {result.passed && result.level < 3 && <Link href={nextLevelHref} className="btn-secondary">Continue to Level {result.level + 1}</Link>}
            <Link href={`/games/quiz?topic=${encodeURIComponent(result.topicId)}`} className="btn-secondary">Return to levels</Link>
          </div>
        </section>
      </main>
    );
  }

  const topic = topics.find((item) => item.$id === result.topicId);

  return (
    <main className="section-shell py-10 sm:py-14">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Quiz complete</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Nice work{topic ? ` on ${topic.title}` : ''}!
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{getResultFeedbackMessage(result.percentage)}</p>
        <div className="glass-card mt-8 p-6 sm:p-8">
          <div className="text-6xl font-bold text-brand-600">{result.percentage}%</div>
          <p className="mt-2 text-sm font-semibold text-slate-500">Final score</p>
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{result.score}/{result.totalQuestions}</p>
              <p className="mt-1 text-xs text-slate-500">Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{result.percentage}%</p>
              <p className="mt-1 text-xs text-slate-500">Percentage</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Coming soon</p>
              <p className="mt-1 text-xs text-slate-500">XP</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/games/quiz${topic ? `?topic=${encodeURIComponent(result.topicId)}` : ''}`} className="btn-primary">Retry quiz</Link>
          <Link href="/games" className="btn-secondary">Return to games</Link>
          <Link href="/learn" className="btn-secondary">Return to learning</Link>
        </div>
      </section>
    </main>
  );
}
