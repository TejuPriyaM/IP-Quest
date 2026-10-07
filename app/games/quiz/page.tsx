'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import LevelQuiz from '@/components/LevelQuiz';
import QuizRunner from '@/components/QuizRunner';
import SectionHeader from '@/components/SectionHeader';
import { getLearnModuleBySlug } from '@/lib/learn';
import { listTopics, type TopicRow } from '@/lib/topics';

export default function QuizPage() {
  return <Suspense fallback={<main className="section-shell py-10 sm:py-14"><p className="text-slate-600">Loading quiz...</p></main>}><QuizPageContent /></Suspense>;
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get('topic');
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [teacherQuizActive, setTeacherQuizActive] = useState(false);

  const requestedTopicKey = requestedTopic?.trim() ?? '';
  const selectedTopic = topics.find((topic) => {
    if (!requestedTopicKey) return false;
    if (topic.$id === requestedTopicKey || topic.slug === requestedTopicKey) return true;

    const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return normalize(topic.title) === normalize(requestedTopicKey) || normalize(topic.slug) === normalize(requestedTopicKey);
  });
  const selectedModule = selectedTopic
    ? getLearnModuleBySlug(selectedTopic.slug) ?? getLearnModuleBySlug(selectedTopic.title)
    : undefined;

  useEffect(() => {
    listTopics()
      .then((rows) => setTopics(rows.filter((topic) => topic.is_published === true)))
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Unable to load quiz topics. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setTeacherQuizActive(false);
  }, [selectedTopic?.$id]);

  const requestedLevel = Number(searchParams.get('level'));
  const initialLevel = Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 3 ? requestedLevel : null;

  return (
    <AuthGuard allowedRoles={['student']}>
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title={selectedTopic ? `${selectedTopic.title} Quiz` : 'IP Quiz Challenge'}
        description={selectedTopic
          ? 'Choose an answer for each question and move through the quiz at your own pace.'
          : 'Choose a topic to start a quiz.'}
      />

      {loadError && <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{loadError}</p>}
      {isLoading && <p className="glass-card mt-8 p-6 text-sm text-slate-500" aria-busy="true">Loading topics...</p>}
      {requestedTopic && !isLoading && !selectedTopic && !loadError && (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          That quiz topic is not available. Choose a topic below.
        </p>
      )}

      {selectedTopic ? (
        <div className="mt-8">
          {teacherQuizActive ? (
            <QuizRunner
              key={`${selectedTopic.$id}-teacher`}
              topic={{ id: selectedTopic.$id, title: selectedTopic.title, description: selectedTopic.description, difficulty: selectedTopic.difficulty }}
              mode="teacher"
              onExit={() => setTeacherQuizActive(false)}
            />
          ) : selectedModule ? (
            <LevelQuiz
              key={selectedTopic.$id}
              topic={{ id: selectedTopic.$id, title: selectedTopic.title, description: selectedTopic.description, difficulty: selectedTopic.difficulty }}
              initialLevel={initialLevel}
              onTeacherQuiz={() => setTeacherQuizActive(true)}
            />
          ) : (
            <QuizRunner key={selectedTopic.$id} topic={{ id: selectedTopic.$id, title: selectedTopic.title, description: selectedTopic.description, difficulty: selectedTopic.difficulty }} />
          )}
        </div>
      ) : !isLoading && !loadError ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <Link
                key={topic.$id}
                href={`/games/quiz?topic=${encodeURIComponent(topic.$id)}`}
                className="glass-card flex min-h-48 flex-col p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-brand-50 px-2 text-xs font-bold text-brand-700" aria-hidden="true">
                    {topic.title.slice(0, 3)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{topic.difficulty}</span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">{topic.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
                <span className="mt-auto pt-5 text-sm font-semibold text-brand-700">Start quiz <span aria-hidden="true">-&gt;</span></span>
              </Link>
            ))}
          </div>
          <Link href="/games" className="btn-secondary mt-8 inline-flex">Back to games</Link>
        </>
      ) : null}
    </main>
    </AuthGuard>
  );
}
