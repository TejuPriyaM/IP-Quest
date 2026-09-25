'use client';

import { useEffect, useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import StudentTopicCard from '@/components/StudentTopicCard';
import { listTopics, type TopicRow } from '@/lib/topics';

export default function LearnPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listTopics()
      .then((rows) => setTopics(rows.filter((topic) => topic.is_published === true)))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load topics. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="section-shell pt-10 sm:pt-12">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-soft sm:p-8 lg:p-10">
        <SectionHeader
          title="Learn the core ideas of Intellectual Property"
          description="Explore how creativity, invention, and brand identity are protected in daily life, school projects, and digital communities."
          headingLevel="h1"
        />
      </section>

      {isLoading ? (
        <p className="glass-card mt-10 p-6 text-sm text-slate-500" aria-busy="true">Loading topics...</p>
      ) : error ? (
        <p className="mt-10 rounded-2xl bg-red-50 p-6 text-sm text-red-700" role="alert">{error}</p>
      ) : topics.length === 0 ? (
        <p className="glass-card mt-10 p-6 text-sm text-slate-600">No published topics are available yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => <StudentTopicCard key={topic.$id} topic={topic} />)}
        </div>
      )}
    </main>
  );
}
