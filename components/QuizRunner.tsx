'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { QuizQuestion, QuizTopic } from '@/data/quizData';
import { isAnswerCorrect } from '@/data/quizScoring';

type QuizRunnerProps = {
  topic: QuizTopic;
  questions: QuizQuestion[];
};

export default function QuizRunner({ topic, questions }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const question = questions[currentIndex];
  const progress = ((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100;

  if (!question) {
    return <p className="text-slate-600">This quiz has no questions yet.</p>;
  }

  function chooseAnswer(option: string) {
    if (showFeedback) return;
    setSelectedOption(option);
  }

  function moveToNextQuestion() {
    if (!selectedOption) return;

    const updatedAnswers = { ...answers, [question.id]: selectedOption };
    setAnswers(updatedAnswers);
    setShowFeedback(true);
  }

  function finishOrContinue() {
    const completedAnswers = { ...answers, [question.id]: selectedOption };
    const finalScore = questions.reduce((total, item) => total + (isAnswerCorrect(item, completedAnswers[item.id] ?? '') ? 1 : 0), 0);
    const params = new URLSearchParams({ topic: topic.id, score: String(finalScore), total: String(questions.length), xp: String(topic.xpReward) });
    window.location.href = `/games/results?${params.toString()}`;
  }

  const answerIsCorrect = selectedOption ? isAnswerCorrect(question, selectedOption) : false;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <section className="glass-card p-5 sm:p-8" aria-labelledby="question-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.name} quiz</p>
          <p className="mt-2 text-sm font-medium text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{topic.difficulty}</span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Quiz progress" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
        <h2 id="question-heading" className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">{question.question}</h2>
        <div className="mt-6 grid gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const optionClass = showFeedback && isSelected
              ? answerIsCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900'
              : isSelected ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-100' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50';

            return <button key={option} type="button" onClick={() => chooseAnswer(option)} disabled={showFeedback} aria-pressed={isSelected} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-default ${optionClass}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">{String.fromCharCode(65 + index)}</span>{option}</button>;
          })}
        </div>
      </div>

      {showFeedback && <div className={`mt-5 rounded-xl p-4 text-sm leading-6 ${answerIsCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`} role="status"><strong>{answerIsCorrect ? 'Correct! ' : 'Not quite. '}</strong>{question.explanation}</div>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/games" className="btn-secondary">Exit quiz</Link>
        {!showFeedback ? <button type="button" onClick={moveToNextQuestion} disabled={!selectedOption} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">Check answer</button> : isLastQuestion ? <button type="button" onClick={finishOrContinue} className="btn-primary">See results <span className="ml-2" aria-hidden="true">-&gt;</span></button> : <button type="button" onClick={() => { setCurrentIndex((index) => index + 1); setSelectedOption(null); setShowFeedback(false); }} className="btn-primary">Next question <span className="ml-2" aria-hidden="true">-&gt;</span></button>}
      </div>
    </section>
  );
}
