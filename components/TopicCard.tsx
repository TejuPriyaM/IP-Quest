import type { Topic } from '@/data/mockTopics';

type TopicCardProps = {
  topic: Topic;
};

const accentStyles = {
  blue: {
    shell: 'border-blue-100 bg-blue-50/70',
    badge: 'bg-blue-100 text-blue-700',
    progress: 'bg-blue-600',
    chip: 'text-blue-700',
  },
  orange: {
    shell: 'border-orange-100 bg-orange-50/70',
    badge: 'bg-orange-100 text-orange-700',
    progress: 'bg-orange-500',
    chip: 'text-orange-700',
  },
  green: {
    shell: 'border-emerald-100 bg-emerald-50/70',
    badge: 'bg-emerald-100 text-emerald-700',
    progress: 'bg-emerald-600',
    chip: 'text-emerald-700',
  },
  pink: {
    shell: 'border-pink-100 bg-pink-50/70',
    badge: 'bg-pink-100 text-pink-700',
    progress: 'bg-pink-500',
    chip: 'text-pink-700',
  },
  purple: {
    shell: 'border-violet-100 bg-violet-50/70',
    badge: 'bg-violet-100 text-violet-700',
    progress: 'bg-violet-600',
    chip: 'text-violet-700',
  },
};

const difficultyStyles = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const iconMap = {
  book: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 014 15.5v-9zm0 0V18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7.5h8M8 11h8M8 14.5h5" strokeLinecap="round" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 18h6M10 21h4M9.5 15.5c-2.3-1.1-3.5-3.4-3.5-5.8A5.5 5.5 0 0111.5 4a5.5 5.5 0 015.5 5.7c0 2.4-1.2 4.7-3.5 5.8l-.5.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5l7 3.2v5.4c0 4.2-2.6 8-7 10.4-4.4-2.4-7-6.2-7-10.4V6.7l7-3.2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12.2l1.5 1.5 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 7.5h9a2 2 0 012 2V17a2 2 0 01-2 2H9a2 2 0 01-2-2V9.5a2 2 0 012-2zm-5-2h8.5a2 2 0 012 2v9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11.5h3M5 15.5h3" strokeLinecap="round" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2.5l1.6 4.9L18.5 9l-4.9 1.6L12 15.5l-1.6-4.9L5.5 9l4.9-1.6L12 2.5zm7 13l.8 2.2L22 18.5l-2.2.8L19 21.5l-.8-2.2-2.2-.8 2.2-.8.8-2.2zm-14 0l.8 2.2L8 18.5l-2.2.8L5 21.5l-.8-2.2L2 18.5l2.2-.8.8-2.2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function TopicCard({ topic }: TopicCardProps) {
  const accent = accentStyles[topic.accentCategory];

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-[28px] border bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-brand-500 ${accent.shell}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-slate-900 ${accent.badge}`}>
          {iconMap[topic.icon]}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${difficultyStyles[topic.difficulty]}`}>
          {topic.difficulty}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{topic.accentCategory}</span>
        <span className={`text-sm font-semibold ${accent.chip}`}>{topic.progress}%</span>
      </div>

      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{topic.title}</h3>
      <p className="mt-3 text-base leading-7 text-slate-600">{topic.description}</p>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span className="font-medium">{topic.progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200">
          <div className={`h-2.5 rounded-full ${accent.progress}`} style={{ width: `${topic.progress}%` }} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
        <span>{topic.lessonCount} lessons</span>
        <span className="font-semibold text-slate-800">{topic.xpReward} XP</span>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">{topic.educationalSummary}</p>

      <button type="button" className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        Learn now
      </button>
    </article>
  );
}
