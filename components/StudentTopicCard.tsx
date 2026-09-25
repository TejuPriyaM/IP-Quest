import Link from 'next/link';
import type { TopicRow } from '@/lib/topics';

type StudentTopicCardProps = {
  topic: TopicRow;
};

export default function StudentTopicCard({ topic }: StudentTopicCardProps) {
  return (
    <article className="glass-card flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-brand-50 px-3 text-sm font-bold uppercase text-brand-700 ring-1 ring-brand-100">
          {topic.icon || 'IP'}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
          {topic.difficulty}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{topic.title}</h2>
      <p className="mt-3 flex-1 text-base leading-7 text-slate-600">{topic.description}</p>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{topic.slug}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href={`/learn/${encodeURIComponent(topic.slug)}`} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          Explore lessons
        </Link>
        <Link href={`/games/quiz?topic=${encodeURIComponent(topic.slug)}`} className="btn-secondary">
          Practice quiz
        </Link>
      </div>
    </article>
  );
}
