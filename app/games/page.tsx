import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { quizTopics } from '@/data/quizData';

const futureGames = [
  { title: 'Match the Logo', description: 'Identify trademarks by visual clues and brand stories.', icon: 'TM', difficulty: 'Beginner', time: '5 min' },
  { title: 'Inventor Sprint', description: 'Race through patent puzzles and defend an invention idea.', icon: 'IDEA', difficulty: 'Intermediate', time: '8 min' },
  { title: 'Copyright Detective', description: 'Spot original work and fair use scenarios.', icon: 'COPY', difficulty: 'Intermediate', time: '6 min' },
];

export default function GamesPage() {
  return (
    <main className="section-shell py-10 sm:py-14">
      <SectionHeader title="Games and challenges" description="Turn IP learning into a quick, rewarding challenge. Choose a topic, test your thinking, and earn mock XP as you go." headingLevel="h1" />

      <section className="mt-10 overflow-hidden rounded-3xl bg-brand-900 p-6 text-white shadow-soft sm:p-8 lg:p-10" aria-labelledby="featured-quiz-heading">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Featured quiz</p><h2 id="featured-quiz-heading" className="mt-3 text-3xl font-bold sm:text-4xl">IP Quest: The Big Idea Mix</h2><p className="mt-3 text-base leading-7 text-blue-100">A friendly tour through copyright, patents, trademarks, originality, and innovation. Pick a topic below to begin.</p><div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-blue-100"><span>5 topics</span><span>10 mock questions</span><span>+30-60 XP</span></div></div>
          <Link href="/games/quiz" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900">Start quiz <span className="ml-2" aria-hidden="true">-&gt;</span></Link>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="quiz-topics-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Choose your route</p><h2 id="quiz-topics-heading" className="mt-1 text-2xl font-bold text-slate-900">Quiz topics</h2></div><span className="text-sm text-slate-500">Mock practice only</span></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizTopics.map((topic) => <article key={topic.id} className="glass-card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-brand-50 px-2 text-xs font-bold text-brand-700" aria-hidden="true">{topic.icon}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{topic.difficulty}</span></div><h3 className="mt-5 text-xl font-bold text-slate-900">{topic.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{topic.description}</p><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500"><span>{topic.questions} questions</span><span>~5 min</span><span>+{topic.xpReward} XP</span></div><Link href={`/games/quiz?topic=${topic.id}`} className="btn-secondary mt-5">Start {topic.name} quiz <span className="ml-2" aria-hidden="true">-&gt;</span></Link></article>)}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="daily-heading">
        <article className="rounded-2xl bg-amber-500 p-6 text-amber-950 shadow-soft sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Daily challenge</p><h2 id="daily-heading" className="mt-2 text-2xl font-bold">Originality detective</h2><p className="mt-3 text-sm leading-6 text-amber-900">Can you spot the difference between inspiration and copying?</p><div className="mt-5 flex gap-5 text-sm font-semibold"><span>~5 min</span><span>+30 XP</span></div><Link href="/games/quiz?topic=plagiarism" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-950 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-500">Start challenge</Link></article>
        <div><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Coming soon</p><h2 className="mt-1 text-2xl font-bold text-slate-900">More ways to play</h2></div><div className="grid gap-4 sm:grid-cols-3">{futureGames.map((game) => <article key={game.title} className="glass-card p-5"><span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100 px-2 text-xs font-bold text-slate-600" aria-hidden="true">{game.icon}</span><h3 className="mt-4 font-bold text-slate-900">{game.title}</h3><p className="mt-2 text-sm leading-5 text-slate-600">{game.description}</p><div className="mt-4 text-xs font-semibold text-slate-500">{game.difficulty} · {game.time}</div></article>)}</div></div>
      </section>
    </main>
  );
}
