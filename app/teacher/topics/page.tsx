'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { deleteTopic, listTopics, type Topic, type TopicRow } from '@/lib/topics';

const topicAssessmentDraftKey = 'ip-quest-teacher-assessment-draft';

const emptyTopic: Topic = {
  title: '',
  slug: '',
  description: '',
  icon: '',
  difficulty: '',
  is_published: false,
};

function getTopicFromRow(row: TopicRow): Topic {
  return {
    title: row.title,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    difficulty: row.difficulty,
    is_published: row.is_published,
  };
}

export default function TeacherTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicRow | null>(null);
  const [form, setForm] = useState<Topic>(emptyTopic);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadTopics() {
    setIsLoading(true);
    setLoadError('');

    try {
      setTopics(await listTopics());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load topics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  function openCreateForm() {
    setEditingTopic(null);
    setForm(emptyTopic);
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function openEditForm(topic: TopicRow) {
    setEditingTopic(topic);
    setForm(getTopicFromRow(topic));
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingTopic(null);
    setForm(emptyTopic);
  }

  function updateFormField<K extends keyof Topic>(field: K, value: Topic[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError('');
    setSuccessMessage('');

    if (!form.title.trim() || !form.slug.trim() || !form.difficulty.trim()) {
      setActionError('Title, slug, and difficulty are required.');
      return;
    }

    const topic: Topic = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      difficulty: form.difficulty.trim(),
      is_published: form.is_published,
    };

    sessionStorage.setItem(topicAssessmentDraftKey, JSON.stringify({ topicId: editingTopic?.$id ?? null, topic }));
    router.push('/teacher/assessment?draft=1');
  }

  async function handleDelete(topic: TopicRow) {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    setActionError('');
    setSuccessMessage('');
    setDeletingId(topic.$id);

    try {
      await deleteTopic(topic.$id);
      setSuccessMessage('Topic deleted successfully.');
      await loadTopics();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete topic. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGuard allowedRoles={['teacher']}>
      <main className="section-shell py-10 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Teacher workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Topics</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage the learning topics available to IP Quest students.</p>
          </div>
          <button type="button" onClick={openCreateForm} className="btn-primary">Create Topic</button>
        </div>

        {actionError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {successMessage && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

        {isFormOpen && (
          <section className="glass-card mt-8 max-w-3xl p-6 sm:p-8" aria-labelledby="topic-form-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Topic details</p>
                <h2 id="topic-form-heading" className="mt-1 text-2xl font-bold text-slate-900">{editingTopic ? 'Edit topic' : 'Create topic'}</h2>
              </div>
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
            </div>

            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="topic-title" className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                <input id="topic-title" required value={form.title} onChange={(event) => updateFormField('title', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="topic-slug" className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
                <input id="topic-slug" required value={form.slug} onChange={(event) => updateFormField('slug', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="topic-description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea id="topic-description" rows={3} value={form.description} onChange={(event) => updateFormField('description', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="topic-icon" className="mb-2 block text-sm font-semibold text-slate-700">Icon</label>
                <input id="topic-icon" value={form.icon} onChange={(event) => updateFormField('icon', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="topic-difficulty" className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</label>
                <input id="topic-difficulty" required value={form.difficulty} onChange={(event) => updateFormField('difficulty', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Published
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary">Continue to Assessment</button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8" aria-labelledby="topic-list-heading">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Content library</p>
            <h2 id="topic-list-heading" className="mt-1 text-2xl font-bold text-slate-900">All topics</h2>
          </div>

          {isLoading ? <p className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading topics...</p> : loadError ? <div className="glass-card p-6"><p className="text-sm text-red-700">{loadError}</p><button type="button" onClick={loadTopics} className="btn-secondary mt-4">Try again</button></div> : topics.length === 0 ? <div className="glass-card p-6"><p className="font-semibold text-slate-900">No topics yet</p><p className="mt-2 text-sm text-slate-600">Create your first topic to start building the learning library.</p></div> : (
            <div className="grid gap-4">
              {topics.map((topic) => (
                <article key={topic.$id} className="glass-card p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{topic.difficulty}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${topic.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{topic.is_published ? 'Published' : 'Draft'}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">/{topic.slug}</p>
                      {topic.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{topic.description}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-3">
                      <button type="button" onClick={() => router.push(`/teacher/assessment?topicId=${encodeURIComponent(topic.$id)}`)} className="btn-primary">Assessment</button>
                      <button type="button" onClick={() => openEditForm(topic)} className="btn-secondary">Edit</button>
                      <button type="button" onClick={() => handleDelete(topic)} disabled={deletingId === topic.$id} className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === topic.$id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}