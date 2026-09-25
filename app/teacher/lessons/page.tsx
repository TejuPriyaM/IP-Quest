'use client';

import { FormEvent, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { listTopics, type TopicRow } from '@/lib/topics';
import { createLesson, deleteLesson, listLessons, type Lesson, type LessonInput, updateLesson } from '@/lib/lessons';

const emptyLesson: LessonInput = {
  topic_id: '',
  title: '',
  content: '',
  estimated_minutes: 0,
  order_index: 0,
  is_published: false,
};

function getLessonInput(lesson: Lesson): LessonInput {
  return {
    topic_id: lesson.topic_id,
    title: lesson.title,
    content: lesson.content,
    estimated_minutes: lesson.estimated_minutes,
    order_index: lesson.order_index,
    is_published: lesson.is_published,
  };
}

export default function TeacherLessonsPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonInput>(emptyLesson);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadContent() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [topicRows, lessonRows] = await Promise.all([listTopics(), listLessons()]);
      setTopics(topicRows);
      setLessons(lessonRows);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load lessons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  function getTopicTitle(topicId: string) {
    return topics.find((topic) => topic.$id === topicId)?.title ?? 'Unknown topic';
  }

  function openCreateForm() {
    setEditingLesson(null);
    setForm({ ...emptyLesson, topic_id: topics[0]?.$id ?? '' });
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function openEditForm(lesson: Lesson) {
    setEditingLesson(lesson);
    setForm(getLessonInput(lesson));
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingLesson(null);
    setForm(emptyLesson);
  }

  function updateFormField<K extends keyof LessonInput>(field: K, value: LessonInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError('');
    setSuccessMessage('');

    if (!form.topic_id || !form.title.trim() || !form.content.trim()) {
      setActionError('Topic, title, and content are required.');
      return;
    }

    if (!Number.isInteger(form.estimated_minutes) || form.estimated_minutes < 0 || !Number.isInteger(form.order_index) || form.order_index < 0) {
      setActionError('Estimated minutes and order must be whole numbers of zero or greater.');
      return;
    }

    const lesson: LessonInput = {
      topic_id: form.topic_id,
      title: form.title.trim(),
      content: form.content.trim(),
      estimated_minutes: form.estimated_minutes,
      order_index: form.order_index,
      is_published: form.is_published,
    };

    setIsSubmitting(true);

    try {
      if (editingLesson) {
        await updateLesson(editingLesson.$id, lesson);
        setSuccessMessage('Lesson updated successfully.');
      } else {
        await createLesson(lesson);
        setSuccessMessage('Lesson created successfully.');
      }

      closeForm();
      await loadContent();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save lesson. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    setActionError('');
    setSuccessMessage('');
    setDeletingId(lesson.$id);

    try {
      await deleteLesson(lesson.$id);
      setSuccessMessage('Lesson deleted successfully.');
      await loadContent();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete lesson. Please try again.');
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
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Lessons</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Create and manage lesson content for your learning topics.</p>
          </div>
          <button type="button" onClick={openCreateForm} disabled={topics.length === 0} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">Create Lesson</button>
        </div>

        {actionError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {successMessage && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

        {isFormOpen && (
          <section className="glass-card mt-8 max-w-3xl p-6 sm:p-8" aria-labelledby="lesson-form-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Lesson details</p>
                <h2 id="lesson-form-heading" className="mt-1 text-2xl font-bold text-slate-900">{editingLesson ? 'Edit lesson' : 'Create lesson'}</h2>
              </div>
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
            </div>

            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
              <div className="sm:col-span-2">
                <label htmlFor="lesson-topic" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                <select id="lesson-topic" required value={form.topic_id} onChange={(event) => updateFormField('topic_id', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                  <option value="">Select a topic</option>
                  {topics.map((topic) => <option key={topic.$id} value={topic.$id}>{topic.title}{topic.is_published ? '' : ' (Draft)'}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lesson-title" className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                <input id="lesson-title" required value={form.title} onChange={(event) => updateFormField('title', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lesson-content" className="mb-2 block text-sm font-semibold text-slate-700">Content</label>
                <textarea id="lesson-content" required rows={7} value={form.content} onChange={(event) => updateFormField('content', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="lesson-minutes" className="mb-2 block text-sm font-semibold text-slate-700">Estimated minutes</label>
                <input id="lesson-minutes" required min={0} step={1} type="number" value={form.estimated_minutes} onChange={(event) => updateFormField('estimated_minutes', Number(event.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="lesson-order" className="mb-2 block text-sm font-semibold text-slate-700">Order</label>
                <input id="lesson-order" required min={0} step={1} type="number" value={form.order_index} onChange={(event) => updateFormField('order_index', Number(event.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Published
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}</button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8" aria-labelledby="lesson-list-heading">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Content library</p>
            <h2 id="lesson-list-heading" className="mt-1 text-2xl font-bold text-slate-900">All lessons</h2>
          </div>

          {isLoading ? <p className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading topics and lessons...</p> : loadError ? <div className="glass-card p-6"><p className="text-sm text-red-700">{loadError}</p><button type="button" onClick={loadContent} className="btn-secondary mt-4">Try again</button></div> : lessons.length === 0 ? <div className="glass-card p-6"><p className="font-semibold text-slate-900">No lessons yet</p><p className="mt-2 text-sm text-slate-600">Create your first lesson to start building your learning content.</p></div> : (
            <div className="grid gap-4">
              {lessons.map((lesson) => (
                <article key={lesson.$id} className="glass-card p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{lesson.title}</h3>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{getTopicTitle(lesson.topic_id)}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lesson.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{lesson.is_published ? 'Published' : 'Draft'}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{lesson.content}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500"><span>{lesson.estimated_minutes} min</span><span>Order {lesson.order_index}</span></div>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button type="button" onClick={() => openEditForm(lesson)} className="btn-secondary">Edit</button>
                      <button type="button" onClick={() => handleDelete(lesson)} disabled={deletingId === lesson.$id} className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === lesson.$id ? 'Deleting...' : 'Delete'}</button>
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
