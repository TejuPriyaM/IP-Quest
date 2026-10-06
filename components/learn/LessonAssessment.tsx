'use client';

import { useEffect, useState } from 'react';
import { createQuizJWT } from '@/lib/auth';

type AssessmentSummary = {
  lessonId: string;
  lessonTitle: string;
  questionCount: number;
};

type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
};

type ActiveAssessment = {
  topicId: string;
  topicTitle: string;
  lessonId: string;
  lessonTitle: string;
  questions: AssessmentQuestion[];
};

type AssessmentResult = {
  topicId: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  review: Array<{
    questionId: string;
    question: string;
    selectedOption: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }>;
};

async function assessmentRequest<T>(url: string, body?: Record<string, unknown>): Promise<T> {
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
      : 'Unable to load this lesson assessment.';
    throw new Error(message);
  }
  return payload as T;
}

export default function LessonAssessment({ topic }: { topic: { id: string; title: string } }) {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<ActiveAssessment | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadAssessments() {
      setIsLoading(true);
      setError('');
      try {
        const payload = await assessmentRequest<{ assessments: AssessmentSummary[] }>(`/api/lesson-assessments?topicId=${encodeURIComponent(topic.id)}`);
        if (isActive) setAssessments(payload.assessments);
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'Unable to load lesson assessments.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadAssessments();
    return () => {
      isActive = false;
    };
  }, [topic.id]);

  async function startAssessment(lessonId: string) {
    setIsStarting(true);
    setError('');
    setResult(null);
    try {
      const payload = await assessmentRequest<ActiveAssessment>(`/api/lesson-assessments?topicId=${encodeURIComponent(topic.id)}&lessonId=${encodeURIComponent(lessonId)}`);
      setActiveAssessment(payload);
      setAnswers({});
      setCurrentIndex(0);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start this assessment.');
    } finally {
      setIsStarting(false);
    }
  }

  async function submitAssessment() {
    if (!activeAssessment || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const submittedAnswers = activeAssessment.questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id] ?? '',
      }));
      const nextResult = await assessmentRequest<AssessmentResult>('/api/lesson-assessments', {
        topicId: activeAssessment.topicId,
        lessonId: activeAssessment.lessonId,
        answers: submittedAnswers,
      });
      setResult(nextResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit this assessment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="glass-card p-6 text-sm text-slate-600" role="status">Loading lesson assessments...</p>;
  }

  if (result) {
    return (
      <section className="space-y-5" aria-labelledby="lesson-assessment-result-heading">
        <div className="glass-card p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{topic.title} · Lesson assessment</p>
          <h2 id="lesson-assessment-result-heading" className="mt-2 text-2xl font-bold text-slate-900">{result.lessonTitle} result</h2>
          <p className="mt-5 text-4xl font-bold text-brand-700">{result.percentage}%</p>
          <p className="mt-1 text-sm text-slate-600">{result.score} of {result.totalQuestions} correct</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => void startAssessment(result.lessonId)} disabled={isStarting} className="btn-primary">{isStarting ? 'Starting...' : 'Retry assessment'}</button>
            <button type="button" onClick={() => { setResult(null); setActiveAssessment(null); setAnswers({}); setError(''); }} className="btn-secondary">All assessments</button>
          </div>
        </div>
        <div className="grid gap-4">
          {result.review.map((item, index) => (
            <article key={item.questionId} className={`rounded-xl border p-4 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
              <p className="text-xs font-semibold uppercase text-slate-500">Question {index + 1} · {item.isCorrect ? 'Correct' : 'Incorrect'}</p>
              <h3 className="mt-2 font-bold text-slate-900">{item.question}</h3>
              <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">Your answer:</span> {item.selectedOption}</p>
              {!item.isCorrect && <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">Correct answer:</span> {item.correctAnswer}</p>}
              {item.explanation && <p className="mt-2 text-sm leading-6 text-slate-700">{item.explanation}</p>}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (activeAssessment) {
    const question = activeAssessment.questions[currentIndex];
    const selectedOption = answers[question.id] ?? '';
    const isLastQuestion = currentIndex === activeAssessment.questions.length - 1;
    return (
      <section className="glass-card min-w-0 p-5 sm:p-8" aria-labelledby="lesson-assessment-question-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-600">{activeAssessment.topicTitle} · Lesson assessment</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{activeAssessment.lessonTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">Question {currentIndex + 1} of {activeAssessment.questions.length}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{question.difficulty}</span>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <h3 id="lesson-assessment-question-heading" className="break-words text-xl font-bold leading-8 text-slate-900">{question.question}</h3>
          <div className="mt-5 grid gap-3">
            {question.options.map((option, index) => (
              <button key={`${question.id}-${option}`} type="button" onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} aria-pressed={selectedOption === option} className={`flex min-h-12 min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold ${selectedOption === option ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">{String.fromCharCode(65 + index)}</span>
                <span className="break-words">{option}</span>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => { setActiveAssessment(null); setAnswers({}); setError(''); }} className="btn-secondary">All assessments</button>
          {isLastQuestion ? (
            <button type="button" onClick={() => void submitAssessment()} disabled={!selectedOption || isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Finish assessment'}</button>
          ) : (
            <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} disabled={!selectedOption} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">Next question <span className="ml-2" aria-hidden="true">-&gt;</span></button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card min-w-0 p-5 sm:p-7" aria-labelledby="lesson-assessment-list-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{topic.title}</p>
      <h2 id="lesson-assessment-list-heading" className="mt-2 text-2xl font-bold text-slate-900">Lesson assessments</h2>
      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
      {assessments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No published lesson assessments are available for this topic yet.</p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {assessments.map((assessment) => (
            <article key={assessment.lessonId} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="break-words font-bold text-slate-900">{assessment.lessonTitle}</h3>
              <p className="mt-1 text-sm text-slate-600">Teacher lesson assessment</p>
              <p className="mt-3 text-sm text-slate-500">{assessment.questionCount} question{assessment.questionCount === 1 ? '' : 's'}</p>
              <button type="button" onClick={() => void startAssessment(assessment.lessonId)} disabled={isStarting} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">{isStarting ? 'Starting...' : 'Start assessment'}</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
