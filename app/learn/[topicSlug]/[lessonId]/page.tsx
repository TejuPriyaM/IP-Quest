'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLesson, type Lesson } from '@/lib/lessons';
import { listTopics, type TopicRow } from '@/lib/topics';

export default function LessonDetailPage() {
  const params = useParams<{ topicSlug: string; lessonId: string }>();
  const topicSlug = decodeURIComponent(params.topicSlug);
  const lessonId = decodeURIComponent(params.lessonId);
  const [topic, setTopic] = useState<TopicRow | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listTopics(), getLesson(lessonId)])
      .then(([topicResult, lessonResult]) => {
        const topic = topicResult.find((candidate) => candidate.slug === topicSlug);

        if (!topic || topic.is_published !== true || lessonResult.topic_id !== topic.$id || lessonResult.is_published !== true) {
          return;
        }

        setTopic(topic);
        setLesson(lessonResult);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load this lesson. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [lessonId, topicSlug]);

  if (isLoading) {
    return <main className="section-shell py-10 sm:py-14"><p className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading lesson...</p></main>;
  }

  if (error) {
    return <main className="section-shell py-10 sm:py-14"><p className="rounded-2xl bg-red-50 p-6 text-sm text-red-700" role="alert">{error}</p></main>;
  }

  if (!topic || !lesson) {
    return <main className="section-shell py-10 sm:py-14"><section className="glass-card max-w-2xl p-6 sm:p-8"><h1 className="text-3xl font-black text-slate-950">Lesson not found</h1><p className="mt-3 text-slate-600">This lesson is unavailable, unpublished, or does not belong to this topic.</p><Link href={`/learn/${encodeURIComponent(topicSlug)}`} className="btn-primary mt-6">Back to lessons</Link></section></main>;
  }

  return (
    <main className="section-shell py-10 sm:py-14">
      <Link href={`/learn/${encodeURIComponent(topic.slug)}`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">&lt;- Back to {topic.title} lessons</Link>
      <article className="glass-card mt-5 max-w-4xl p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{topic.title} · Lesson {lesson.order_index}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{lesson.title}</h1>
        <p className="mt-4 text-sm font-semibold text-slate-500">{lesson.estimated_minutes} minutes</p>
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{lesson.content}</div>
      </article>
    </main>
  );
}