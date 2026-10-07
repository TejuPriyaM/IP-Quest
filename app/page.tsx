'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StudentTopicCard from '@/components/StudentTopicCard';
import SectionHeader from '@/components/SectionHeader';
import { listTopics, type TopicRow } from '@/lib/topics';

const questHighlights = [
  { label: 'Levels', value: '6', detail: 'From Explorer to Master' },
  { label: 'Regions', value: '5', detail: 'Each with its own challenge' },
  { label: 'Badges', value: '12', detail: 'Earned through gameplay' },
];

export default function HomePage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  useEffect(() => {
    listTopics()
      .then((rows) => setTopics(rows.filter((topic) => topic.is_published === true)))
      .catch(() => setTopics([]))
      .finally(() => setIsLoadingTopics(false));
  }, []);

  return (
    <main>
      <section className="section-shell grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Learn. Create. Protect.
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Become an IP Guardian and protect ideas across the world of IP Quest.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Explore the five regions of IP Quest, complete missions, and learn how patents, copyrights, trademarks, trade secrets, and plagiarism rules apply in real life.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/games" className="btn-primary">
              Start the quest
            </Link>
            <Link href="/learn" className="btn-secondary">
              Explore lessons
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {questHighlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{item.label}</dt>
                <dd className="mt-2 text-2xl font-bold text-slate-900">{item.value}</dd>
                <dd className="mt-1 text-[11px] text-slate-500">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="glass-card overflow-hidden p-6 sm:p-8">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Current mission</p>
            <h2 className="mt-4 text-3xl font-bold">Protect the invention before the thieves arrive.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-50">
              Students investigate what qualifies for patent protection, compare similar ideas, and decide how to protect their creations.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: 'Patent Lab', detail: 'Invent and compare new devices', accent: 'bg-blue-50 text-blue-700' },
              { title: 'Creator Studio', detail: 'Protect art, music, and stories', accent: 'bg-pink-50 text-pink-700' },
              { title: 'Brand City', detail: 'Recognise logos and brands', accent: 'bg-violet-50 text-violet-700' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.accent}`}>
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <SectionHeader title="Featured learning paths" description="Build confidence in creating, respecting, and protecting original ideas in everyday life." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <StudentTopicCard key={topic.$id} topic={topic} />
          ))}
        </div>
      </section>
    </main>
  );
}
