'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createQuizJWT } from '@/lib/auth';

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
};

type ApiQuestion = {
  $id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  difficulty: string;
};

type QuizSubmissionResult = {
  success: true;
  attemptId: string;
};

type QuizTopic = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type QuizRunnerProps = {
  topic: QuizTopic;
};

function isApiQuestion(value: unknown): value is ApiQuestion {
  if (typeof value !== 'object' || value === null) return false;

  const question = value as Record<string, unknown>;
  return (
    typeof question.$id === 'string' &&
    typeof question.topic_id === 'string' &&
    typeof question.question_text === 'string' &&
    Array.isArray(question.options) &&
    question.options.every((option) => typeof option === 'string') &&
    typeof question.difficulty === 'string'
  );
}

function isQuizSubmissionResult(value: unknown): value is QuizSubmissionResult {
  if (typeof value !== 'object' || value === null) return false;

  const result = value as Record<string, unknown>;
  return (
    result.success === true &&
    typeof result.attemptId === 'string'
  );
}

export default function QuizRunner({ topic }: QuizRunnerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadQuestions() {
      setIsLoading(true);
      setError(null);
      setQuestions([]);
      setAnswers({});
      setCurrentIndex(0);

      try {
        const jwt = await createQuizJWT();
        const response = await fetch(`/api/quiz/questions?topicId=${encodeURIComponent(topic.id)}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (!response.ok) throw new Error('Question request failed.');

        const payload: unknown = await response.json();
        if (
          typeof payload !== 'object' ||
          payload === null ||
          !('questions' in payload) ||
          !Array.isArray(payload.questions) ||
          !payload.questions.every((question) => isApiQuestion(question) && question.topic_id === topic.id)
        ) {
          throw new Error('Question response was invalid.');
        }

        if (isActive) {
          setQuestions(payload.questions.map((question) => ({
            id: question.$id,
            question: question.question_text,
            options: question.options,
            difficulty: question.difficulty,
          })));
        }
      } catch {
        if (isActive) setError('We could not load this quiz. Please try again.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadQuestions();
    return () => {
      isActive = false;
    };
  }, [topic.id, retryCount]);

  async function submitAnswers() {
    if (submissionLock.current || isSubmitting) return;
    if (questions.length === 0) {
      setSubmissionError('There are no questions to submit.');
      return;
    }

    const submittedAnswers = questions.map((question) => ({
      questionId: question.id,
      selectedAnswer: answers[question.id] ?? '',
    }));

    if (submittedAnswers.some((answer) => !answer.selectedAnswer)) {
      setSubmissionError('Please choose an answer for every question before finishing.');
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      let jwt: string;
      try {
        jwt = await createQuizJWT();
      } catch {
        setSubmissionError('Your session could not be verified. Please sign in again.');
        return;
      }

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId: topic.id, answers: submittedAnswers }),
      });

      if (!response.ok) {
        const message = response.status === 401
          ? 'Your session has expired. Please sign in again.'
          : response.status === 403
            ? 'You do not have permission to submit this quiz.'
            : response.status === 400
              ? 'These answers could not be submitted. Please review them and try again.'
              : response.status === 404
                ? 'This quiz is no longer available. Please choose another topic.'
                : 'We could not submit your quiz. Please try again.';
        setSubmissionError(message);
        return;
      }

      const result: unknown = await response.json();
      if (!isQuizSubmissionResult(result)) {
        setSubmissionError('We could not confirm your quiz result. Please try again.');
        return;
      }

      const parameters = new URLSearchParams({ attemptId: result.attemptId });
      window.location.assign(`/games/results?${parameters.toString()}`);
    } catch {
      setSubmissionError('We could not reach the quiz service. Check your connection and try again.');
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="glass-card p-6 text-slate-600" role="status">Loading quiz...</p>;
  }

  if (error) {
    return (
      <section className="glass-card p-6" role="alert">
        <p className="text-slate-700">{error}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="btn-primary mt-5">
          Try again
        </button>
      </section>
    );
  }

  if (questions.length === 0) {
    return <p className="glass-card p-6 text-slate-600">No published questions are available for this topic yet.</p>;
  }

  const question = questions[currentIndex];
  const selectedOption = answers[question.id] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <section className="glass-card p-5 sm:p-8" aria-labelledby="question-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.title} quiz</p>
          <p className="mt-2 text-sm font-medium text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{question.difficulty}</span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Quiz progress" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
        <h2 id="question-heading" className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">{question.question}</h2>
        <div className="mt-6 grid gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const optionClass = isSelected
              ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50';

            return (
              <button
                key={option}
                type="button"
                onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: option }))}
                disabled={isSubmitting}
                aria-pressed={isSelected}
                className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-wait ${optionClass}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {submissionError && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{submissionError}</p>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/games" className="btn-secondary">Exit quiz</Link>
        <button
          type="button"
          onClick={() => isLastQuestion ? void submitAnswers() : setCurrentIndex((index) => index + 1)}
          disabled={isSubmitting || (!isLastQuestion && !selectedOption)}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Finish quiz' : 'Next question'}
          {!isLastQuestion && <span className="ml-2" aria-hidden="true">-&gt;</span>}
        </button>
      </div>
    </section>
  );
}
