'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { listTopics, type TopicRow } from '@/lib/topics';
import { listLessonsByTopic, type Lesson } from '@/lib/lessons';

export default function TopicLessonsPage() {
  const params = useParams<{ topicSlug: string }>();
  const topicSlug = decodeURIComponent(params.topicSlug);
  const [topic, setTopic] = useState<TopicRow | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTopicLessons() {
      try {
        const topics = (await listTopics()).find((candidate) => candidate.slug === topicSlug);

        if (!topics || topics.is_published !== true) {
          setTopic(null);
          return;
        }

        const topicLessons = await listLessonsByTopic(topics.$id);
        setTopic(topics);
        setLessons(topicLessons.filter((lesson) => lesson.topic_id === topics.$id && lesson.is_published === true).sort((first, second) => first.order_index - second.order_index));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this topic. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTopicLessons();
  }, [topicSlug]);

  if (isLoading) {
    return <main className="section-shell py-10 sm:py-14"><p className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading lessons...</p></main>;
  }

  if (error) {
    return <main className="section-shell py-10 sm:py-14"><p className="rounded-2xl bg-red-50 p-6 text-sm text-red-700" role="alert">{error}</p></main>;
  }

  if (!topic) {
    return <main className="section-shell py-10 sm:py-14"><section className="glass-card max-w-2xl p-6 sm:p-8"><h1 className="text-3xl font-black text-slate-950">Topic not found</h1><p className="mt-3 text-slate-600">This topic is unavailable or is not published.</p><Link href="/learn" className="btn-primary mt-6">Back to Learn</Link></section></main>;
  }

  return (
    <main className="section-shell py-10 sm:py-14">
      <Link href="/learn" className="text-sm font-semibold text-brand-700 hover:text-brand-800">&lt;- Back to Learn</Link>
      <section className="mt-5 rounded-3xl bg-brand-900 p-7 text-white shadow-soft sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Learning topic</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{topic.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">{topic.description}</p>
      </section>

      <section className="mt-8" aria-labelledby="lessons-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Published lessons</p>
        <h2 id="lessons-heading" className="mt-1 text-2xl font-bold text-slate-900">Explore this topic</h2>
        {lessons.length === 0 ? <p className="glass-card mt-5 p-6 text-sm text-slate-600">No published lessons are available for this topic yet.</p> : (
          <div className="mt-5 grid gap-4">
            {lessons.map((lesson) => (
              <Link key={lesson.$id} href={`/learn/${encodeURIComponent(topic.slug)}/${encodeURIComponent(lesson.$id)}`} className="glass-card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Lesson {lesson.order_index}</p><h3 className="mt-1 text-xl font-bold text-slate-900">{lesson.title}</h3></div><span className="text-sm font-semibold text-slate-500">{lesson.estimated_minutes} min</span></div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{lesson.content}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}