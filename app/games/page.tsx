import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';

const upcomingGames = [
  { title: 'Match the Logo', description: 'Identify trademarks by visual clues and brand stories.' },
  { title: 'Inventor Sprint', description: 'Race through patent puzzles and defend an invention idea.' },
  { title: 'Copyright Detective', description: 'Spot original work and fair use scenarios.' },
];

export default function GamesPage() {
  return (
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title="Games and challenges"
        description="Turn learning into a fun challenge with short quizzes and interactive mock game modes for future growth."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="glass-card flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Featured game</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">IP Quiz Challenge</h3>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Test your knowledge about copyright, patents, and trademarks. Each answer helps build a stronger understanding of how protection works.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/games/quiz" className="btn-primary">
              Start Quiz
            </Link>
            <Link href="/learn" className="btn-secondary">
              Review Lessons
            </Link>
          </div>
        </article>

        <aside className="space-y-5">
          {upcomingGames.map((game) => (
            <div key={game.title} className="glass-card p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Coming soon</p>
              <h4 className="mt-2 text-xl font-bold text-slate-900">{game.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{game.description}</p>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
