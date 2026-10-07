'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type RegionChallenge = {
  id: string;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
};

type RegionQuestGameProps = {
  title: string;
  region: string;
  mission: string;
  description: string;
  reward: string;
  accent: string;
  cards: RegionChallenge[];
};

export default function RegionQuestGame({
  title,
  region,
  mission,
  description,
  reward,
  accent,
  cards,
}: RegionQuestGameProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const score = useMemo(
    () => cards.reduce((total, card) => total + (answers[card.id] === card.correct ? 1 : 0), 0),
    [answers, cards],
  );

  const handleAnswer = (cardId: string, choice: string) => {
    setAnswers((current) => ({ ...current, [cardId]: choice }));
  };

  return (
    <main className="section-shell py-14 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/games" className="btn-secondary inline-flex">
          ← Back to world map
        </Link>
        <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
          {region}
        </span>
      </div>

      <section className="glass-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Mission briefing</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{title}</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600">{description}</p>
          </div>

          <div className={`rounded-3xl bg-gradient-to-br ${accent} p-6 text-white shadow-soft`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Quest reward</p>
            <p className="mt-4 text-3xl font-black">{score}/{cards.length}</p>
            <p className="mt-2 text-sm text-white/90">{reward}</p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-4">
          {cards.map((card) => {
            const answer = answers[card.id];
            const isCorrect = answer === card.correct;

            return (
              <div key={card.id} className="glass-card p-5 sm:p-6">
                <p className="text-base font-semibold text-slate-800">{card.prompt}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(card.id, option)}
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                        answer === option
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {answer && (
                  <p className={`mt-4 text-sm ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? 'Correct!' : 'Almost there.'} {card.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <aside className="glass-card h-fit p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mission</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">{mission}</h2>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Progress</p>
            <div className="mt-3 h-2.5 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                style={{ width: `${cards.length > 0 ? (score / cards.length) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">{score} of {cards.length} correct so far</p>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>• Look for the problem the idea solves.</li>
            <li>• Separate the idea from the protected expression.</li>
            <li>• Ask: is it a product, work, brand, or secret?</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
