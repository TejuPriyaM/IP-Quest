'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StudentTopicCard from '@/components/StudentTopicCard';
import SectionHeader from '@/components/SectionHeader';
import { listTopics, type TopicRow } from '@/lib/topics';

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
            Explore the world of Intellectual Property with IP Quest.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Discover how copyright, patents, and trademarks protect ideas, stories, and inventions in everyday life. Learn through bite-sized lessons, quizzes, and fun progress challenges.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/learn" className="btn-primary">
              Start Learning
            </Link>
            <Link href="/games" className="btn-secondary">
              Play a Quiz
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Topics</dt>
              <dd className="mt-2 text-2xl font-bold text-slate-900">{isLoadingTopics ? '...' : topics.length}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Quizzes</dt>
              <dd className="mt-2 text-2xl font-bold text-slate-900">12</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-wide text-slate-500">XP</dt>
              <dd className="mt-2 text-2xl font-bold text-slate-900">420</dd>
            </div>
          </dl>
        </div>

        <div className="glass-card overflow-hidden p-6 sm:p-8">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">What is IP?</p>
            <h2 className="mt-4 text-3xl font-bold">Ideas deserve protection.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-50">
              Intellectual Property is the way people recognize and protect original ideas, creative work, and inventions in school and in everyday life.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {topics.slice(0, 5).map((topic) => (
              <div key={topic.$id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{topic.title}</p>
                  <p className="text-xs text-slate-500">{topic.difficulty}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Published
                </span>
              </div>
            ))}
            {!isLoadingTopics && topics.length === 0 && <p className="text-sm text-slate-600">No published topics are available yet.</p>}
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
