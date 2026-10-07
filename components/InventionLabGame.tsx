'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Category = 'Patent' | 'Copyright' | 'Trademark' | 'Trade Secret' | 'Not IP';

type ChallengeItem = {
  id: string;
  title: string;
  correct: Category;
  explanation: string;
};

const challengeItems: ChallengeItem[] = [
  {
    id: 'water-device',
    title: 'A new water-saving device that turns sunlight into a smart irrigation system.',
    correct: 'Patent',
    explanation: 'This is a technical invention with a practical problem to solve. Patent protection may be relevant if it meets the legal requirements for patentability.',
  },
  {
    id: 'school-song',
    title: 'A song written by a student with original lyrics and melody.',
    correct: 'Copyright',
    explanation: 'The music and lyrics are creative expression. Copyright protects the original expression of ideas, not the general idea of a song itself.',
  },
  {
    id: 'logo',
    title: 'A rainbow mascot logo for a school snack brand.',
    correct: 'Trademark',
    explanation: 'A logo or brand mark helps customers recognise a product or company. That is often a trademark issue rather than a patent issue.',
  },
  {
    id: 'recipe',
    title: 'A secret recipe for a special sauce used only in the bakery.',
    correct: 'Trade Secret',
    explanation: 'The recipe can be protected as a trade secret when it is confidential and kept secret, instead of being publicly disclosed.',
  },
  {
    id: 'idea',
    title: 'A clever idea for a game where students trade cards.',
    correct: 'Not IP',
    explanation: 'An idea by itself is usually not protected. Protection generally depends on whether a specific invention, work, brand, or confidential method qualifies under the relevant legal rules.',
  },
];

const inventionParts = ['wheels', 'motor', 'sensor', 'solar panel', 'battery', 'controller'];
const categoryStyles: Record<Category, string> = {
  Patent: 'border-blue-200 bg-blue-50 text-blue-700',
  Copyright: 'border-rose-200 bg-rose-50 text-rose-700',
  Trademark: 'border-violet-200 bg-violet-50 text-violet-700',
  'Trade Secret': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Not IP': 'border-slate-200 bg-slate-100 text-slate-700',
};

export default function InventionLabGame() {
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Category>>({});

  const score = useMemo(
    () => challengeItems.reduce((count, item) => count + (answers[item.id] === item.correct ? 1 : 0), 0),
    [answers],
  );

  const togglePart = (part: string) => {
    setSelectedParts((current) =>
      current.includes(part) ? current.filter((item) => item !== part) : [...current, part].slice(-4),
    );
  };

  const handleAnswer = (itemId: string, category: Category) => {
    setAnswers((current) => ({ ...current, [itemId]: category }));
  };

  return (
    <main className="section-shell py-14 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/games" className="btn-secondary inline-flex">
          ← Back to world map
        </Link>
        <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
          Mission: Protect the inventions before the IP thieves arrive
        </span>
      </div>

      <section className="glass-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Region 1</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Invention Lab</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              Students inspect inventions, compare their purpose, and decide which kind of protection may be relevant.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-sky-400 p-6 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Mission score</p>
            <p className="mt-4 text-4xl font-black">{score}/{challengeItems.length}</p>
            <p className="mt-2 text-sm text-blue-50">Correct protection choices earned so far.</p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Build the invention</h2>
          <p className="mt-2 text-sm text-slate-600">Choose parts to create a new device. A useful invention may qualify for patent protection if it meets the legal requirements.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {inventionParts.map((part) => {
              const chosen = selectedParts.includes(part);
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => togglePart(part)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                    chosen
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700'
                  }`}
                >
                  {part}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Prototype</p>
            <p className="mt-3 text-lg font-bold text-slate-900">
              {selectedParts.length > 0 ? selectedParts.join(' + ') : 'No prototype yet — pick parts to begin.'}
            </p>
          </div>

          {selectedParts.length >= 4 && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Your prototype is a smart irrigation helper with a battery-powered sensor and a solar panel. It is an invention because it solves a real problem with a technical design.
            </div>
          )}
        </section>

        <section className="glass-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Patent or not?</h2>
          <div className="mt-5 space-y-4">
            {challengeItems.map((item) => {
              const userChoice = answers[item.id];
              const isCorrect = userChoice === item.correct;

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(categoryStyles) as Category[]).map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleAnswer(item.id, category)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          userChoice === category ? categoryStyles[category] : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {userChoice && (
                    <p className={`mt-3 text-sm ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isCorrect ? 'Correct!' : 'Not quite.'} {item.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
