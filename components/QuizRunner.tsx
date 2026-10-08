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

type TeacherQuizResult = {
  score: number;
  totalQuestions: number;
  percentage: number;
};

type TeacherAnswerFeedback = {
  questionId: string;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation: string;
};

type QuizTopic = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type QuizRunnerProps = {
  topic: QuizTopic;
  mode?: 'standard' | 'teacher';
  onExit?: () => void;
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

function isTeacherQuizResult(value: unknown): value is TeacherQuizResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Record<string, unknown>;
  return Number.isInteger(result.score) && Number.isInteger(result.totalQuestions) && Number.isInteger(result.percentage);
}

function isTeacherAnswerFeedback(value: unknown): value is TeacherAnswerFeedback {
  if (typeof value !== 'object' || value === null) return false;
  const feedback = value as Record<string, unknown>;
  return typeof feedback.questionId === 'string' &&
    typeof feedback.isCorrect === 'boolean' &&
    typeof feedback.explanation === 'string' &&
    (feedback.correctAnswer === undefined || typeof feedback.correctAnswer === 'string');
}

export default function QuizRunner({ topic, mode = 'standard', onExit }: QuizRunnerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [teacherFeedback, setTeacherFeedback] = useState<Record<string, TeacherAnswerFeedback>>({});
  const [teacherResult, setTeacherResult] = useState<TeacherQuizResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const answerCheckLock = useRef(false);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadQuestions() {
      setIsLoading(true);
      setError(null);
      setQuestions([]);
      setAnswers({});
      setTeacherFeedback({});
      setCurrentIndex(0);
      setTeacherResult(null);
      answerCheckLock.current = false;

      try {
        const jwt = await createQuizJWT();
        const endpoint = mode === 'teacher' ? '/api/quiz/teacher' : '/api/quiz/questions';
        const response = await fetch(`${endpoint}?topicId=${encodeURIComponent(topic.id)}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'We could not load this quiz. Please try again.';
          throw new Error(message);
        }

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
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'We could not load this quiz. Please try again.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadQuestions();
    return () => {
      isActive = false;
    };
  }, [mode, topic.id, retryCount]);

  async function selectAnswer(question: QuizQuestion, selectedAnswer: string) {
    if (mode !== 'teacher') {
      setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: selectedAnswer }));
      return;
    }
    if (answerCheckLock.current || teacherFeedback[question.id] || answers[question.id]) return;

    answerCheckLock.current = true;
    setIsCheckingAnswer(true);
    setSubmissionError(null);
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: selectedAnswer }));
    try {
      const jwt = await createQuizJWT();
      const response = await fetch('/api/quiz/teacher', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'answer', topicId: topic.id, questionId: question.id, selectedAnswer }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'We could not check this answer. Please try again.';
        throw new Error(message);
      }
      if (!isTeacherAnswerFeedback(payload) || payload.questionId !== question.id) {
        throw new Error('We could not confirm this answer. Please try again.');
      }
      setTeacherFeedback((currentFeedback) => ({ ...currentFeedback, [question.id]: payload }));
    } catch (answerError) {
      setAnswers((currentAnswers) => {
        const nextAnswers = { ...currentAnswers };
        delete nextAnswers[question.id];
        return nextAnswers;
      });
      setSubmissionError(answerError instanceof Error ? answerError.message : 'We could not check this answer. Please try again.');
    } finally {
      answerCheckLock.current = false;
      setIsCheckingAnswer(false);
    }
  }

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
    if (mode === 'teacher' && questions.some((question) => !teacherFeedback[question.id])) {
      setSubmissionError('Check every answer before finishing the Teacher Quiz.');
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

      if (mode === 'teacher') {
        const response = await fetch('/api/quiz/teacher', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topicId: topic.id, answers: submittedAnswers }),
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'We could not submit this Teacher Quiz. Please try again.';
          setSubmissionError(message);
          return;
        }
        if (!isTeacherQuizResult(payload)) {
          setSubmissionError('We could not confirm your Teacher Quiz result. Please try again.');
          return;
        }
        setTeacherResult(payload);
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

  if (teacherResult) {
    return (
      <section className="glass-card p-5 sm:p-8" aria-labelledby="teacher-quiz-result-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.title} · Teacher Quiz</p>
        <h2 id="teacher-quiz-result-heading" className="mt-2 text-2xl font-bold text-slate-900">Quiz result</h2>
        <p className="mt-5 text-4xl font-bold text-brand-700">{teacherResult.percentage}%</p>
        <p className="mt-1 text-sm text-slate-600">{teacherResult.score} of {teacherResult.totalQuestions} correct</p>
        {onExit && <button type="button" onClick={onExit} className="btn-secondary mt-6">Back to quiz levels</button>}
      </section>
    );
  }

  if (questions.length === 0) {
    return <p className="glass-card p-6 text-slate-600">{mode === 'teacher' ? 'No teacher-created questions are available for this module yet.' : 'No published questions are available for this topic yet.'}</p>;
  }

  const question = questions[currentIndex];
  const selectedOption = answers[question.id] ?? null;
  const currentTeacherFeedback = teacherFeedback[question.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <section className="glass-card p-5 sm:p-8" aria-labelledby="question-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.title}{mode === 'teacher' ? ' · Teacher Quiz' : ' quiz'}</p>
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
            const isCorrectOption = currentTeacherFeedback?.correctAnswer === option || (currentTeacherFeedback?.isCorrect && isSelected);
            const optionClass = mode === 'teacher' && currentTeacherFeedback
              ? isSelected && !currentTeacherFeedback.isCorrect
                ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-100'
                : isCorrectOption
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                  : 'border-slate-200 bg-white text-slate-500'
              : isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50';

            return (
              <button
                key={option}
                type="button"
                onClick={() => void selectAnswer(question, option)}
                disabled={isSubmitting || (mode === 'teacher' && (isCheckingAnswer || Boolean(currentTeacherFeedback)))}
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

      {mode === 'teacher' && isCheckingAnswer && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" role="status">Checking your answer...</p>}
      {mode === 'teacher' && currentTeacherFeedback && (
        <div className={`mt-5 rounded-xl border p-4 ${currentTeacherFeedback.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} role="status">
          <p className="font-bold">{currentTeacherFeedback.isCorrect ? '✓ Correct!' : '✗ Wrong'}</p>
          {!currentTeacherFeedback.isCorrect && currentTeacherFeedback.correctAnswer && (
            <p className="mt-2 text-sm">Correct answer: <strong>{String.fromCharCode(65 + question.options.indexOf(currentTeacherFeedback.correctAnswer))}. {currentTeacherFeedback.correctAnswer}</strong></p>
          )}
          {currentTeacherFeedback.explanation && <p className="mt-2 text-sm leading-6">{currentTeacherFeedback.explanation}</p>}
        </div>
      )}

      {submissionError && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{submissionError}</p>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {mode === 'teacher' && onExit
          ? <button type="button" onClick={onExit} className="btn-secondary">Back to quiz levels</button>
          : <Link href="/games" className="btn-secondary">Exit quiz</Link>}
        <button
          type="button"
          onClick={() => isLastQuestion ? void submitAnswers() : setCurrentIndex((index) => index + 1)}
          disabled={isSubmitting || (mode === 'teacher' ? !currentTeacherFeedback : !isLastQuestion && !selectedOption)}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Finish quiz' : 'Next question'}
          {!isLastQuestion && <span className="ml-2" aria-hidden="true">-&gt;</span>}
        </button>
      </div>
    </section>
  );
}
