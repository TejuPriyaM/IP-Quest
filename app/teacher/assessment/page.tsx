'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { createQuestion, deleteQuestion, listQuestions, type Question, type QuestionInput, updateQuestion } from '@/lib/questions';
import { listTopics, type TopicRow } from '@/lib/topics';

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

const createForm = (topicId = '', level = 1): QuestionInput => ({
  topic_id: topicId,
  lesson_id: '',
  options: [],
  correct_option: '',
  explanation: '',
  difficulty: 'Beginner',
  is_published: true,
  question_text: '',
  level,
  hint: '',
});

function questionToForm(question: Question): QuestionInput {
  return {
    topic_id: question.topic_id,
    lesson_id: question.lesson_id ?? '',
    options: [...question.options],
    correct_option: question.correct_option ?? '',
    explanation: question.explanation ?? '',
    difficulty: question.difficulty,
    is_published: question.is_published,
    question_text: question.question_text,
    level: question.level ?? 1,
    hint: question.hint ?? '',
  };
}

export default function TeacherAssessmentPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionInput>(createForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [topicRows, questionRows] = await Promise.all([listTopics(), listQuestions()]);
      setTopics(topicRows);
      setQuestions(questionRows.filter((question) => question.level !== null && question.level !== undefined && !question.lesson_id && question.options.length === 0));

      if (!selectedTopicId && topicRows[0]) {
        setSelectedTopicId(topicRows[0].$id);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load assessment questions.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      const requestedTopicId = new URLSearchParams(window.location.search).get('topicId');
      setSelectedTopicId(topics.some((topic) => topic.$id === requestedTopicId) ? requestedTopicId ?? '' : topics[0].$id);
      return;
    }

    if (!selectedTopicId) return;
    setForm((current) => ({ ...createForm(selectedTopicId, selectedLevel), ...current, topic_id: selectedTopicId, level: selectedLevel, is_published: true }));
  }, [selectedLevel, selectedTopicId, topics]);

  const visibleQuestions = useMemo(() => {
    if (!selectedTopicId) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    return questions
      .filter((question) => question.topic_id === selectedTopicId)
      .filter((question) => question.level === selectedLevel)
      .filter((question) => question.is_published)
      .filter((question) => {
        if (!normalizedSearch) return true;
        return question.question_text.toLowerCase().includes(normalizedSearch)
          || question.difficulty.toLowerCase().includes(normalizedSearch)
          || (question.hint ?? '').toLowerCase().includes(normalizedSearch);
      });
  }, [questions, searchTerm, selectedLevel, selectedTopicId]);

  function getTopicTitle(topicId: string) {
    return topics.find((topic) => topic.$id === topicId)?.title ?? 'Unknown topic';
  }

  function openCreateForm() {
    setEditingQuestion(null);
    setForm(createForm(selectedTopicId, selectedLevel));
    setActionError('');
    setSuccessMessage('');
  }

  function openEditForm(question: Question) {
    setEditingQuestion(question);
    setForm(questionToForm(question));
    setActionError('');
    setSuccessMessage('');
  }

  function closeForm() {
    setEditingQuestion(null);
    setForm(createForm(selectedTopicId, selectedLevel));
  }

  function updateFormField<K extends keyof QuestionInput>(field: K, value: QuestionInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm(): QuestionInput {
    if (!form.topic_id) {
      throw new Error('Please select a topic for this assessment question.');
    }
    if (!Number.isInteger(form.level) || (form.level as number) < 1 || (form.level as number) > 3) {
      throw new Error('Please select Level 1, 2, or 3.');
    }
    if (!form.question_text.trim()) {
      throw new Error('Question text is required.');
    }
    if (!form.difficulty.trim()) {
      throw new Error('Please choose a difficulty level.');
    }
    if (form.hint && form.hint.length > 500) {
      throw new Error('Hints must be 500 characters or fewer.');
    }

    return {
      topic_id: form.topic_id,
      lesson_id: '',
      options: [],
      correct_option: '',
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
      is_published: form.is_published,
      question_text: form.question_text.trim(),
      level: Number(form.level),
      hint: (form.hint ?? '').trim(),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError('');
    setSuccessMessage('');

    try {
      const payload = validateForm();
      setIsSubmitting(true);

      if (editingQuestion) {
        await updateQuestion(editingQuestion.$id, payload, 'teacher-assessment');
        setSuccessMessage('Assessment question updated successfully.');
      } else {
        await createQuestion(payload, 'teacher-assessment');
        setSuccessMessage('Assessment question created successfully.');
      }

      closeForm();
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save the assessment question.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(question: Question) {
    if (!window.confirm('Delete this assessment question? This cannot be undone.')) return;

    setActionError('');
    setSuccessMessage('');
    setDeletingId(question.$id);

    try {
      await deleteQuestion(question.$id);
      setSuccessMessage('Assessment question deleted successfully.');
      if (editingQuestion?.$id === question.$id) {
        closeForm();
      }
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete the assessment question.');
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
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Assessment Questions</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Create written topic-and-level assignments for students without using the MCQ flow.</p>
          </div>
          <button type="button" onClick={openCreateForm} disabled={!selectedTopicId} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">Add New Assessment Question</button>
        </div>

        {actionError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {successMessage && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

        {isLoading ? (
          <p className="glass-card mt-8 p-6 text-sm text-slate-500" aria-busy="true">Loading assessment topics and questions...</p>
        ) : loadError ? (
          <div className="glass-card mt-8 p-6">
            <p className="text-sm text-red-700">{loadError}</p>
            <button type="button" onClick={() => void loadData()} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="glass-card p-4 sm:p-5">
              <div className="mb-4">
                <label htmlFor="assessment-topic-filter" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                <select
                  id="assessment-topic-filter"
                  value={selectedTopicId}
                  onChange={(event) => {
                    setSelectedTopicId(event.target.value);
                    setSearchTerm('');
                    setEditingQuestion(null);
                    setForm(createForm(event.target.value, selectedLevel));
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.$id} value={topic.$id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="assessment-level-filter" className="mb-2 block text-sm font-semibold text-slate-700">Level</label>
                <select
                  id="assessment-level-filter"
                  value={selectedLevel}
                  onChange={(event) => {
                    const nextLevel = Number(event.target.value) || 1;
                    setSelectedLevel(nextLevel);
                    setEditingQuestion(null);
                    setForm(createForm(selectedTopicId, nextLevel));
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  disabled={!selectedTopicId}
                >
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="assessment-search" className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
                <input
                  id="assessment-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search written questions..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Question list</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{visibleQuestions.length}</span>
              </div>

              {selectedTopicId ? (
                visibleQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    No written assessment questions found for {getTopicTitle(selectedTopicId)} · Level {selectedLevel} yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleQuestions.map((question) => (
                      <button
                        key={question.$id}
                        type="button"
                        onClick={() => openEditForm(question)}
                        className={`w-full rounded-xl border p-3 text-left transition ${editingQuestion?.$id === question.$id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/40'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Written</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${question.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{question.is_published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm font-semibold text-slate-900">{question.question_text}</p>
                        <p className="mt-2 text-xs text-slate-500">{question.difficulty} · Level {question.level}</p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Choose a topic to view its written assessment questions.</div>
              )}
            </aside>

            <section className="glass-card p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Assessment editor</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{editingQuestion ? 'Edit selected question' : 'Create New Assessment Question'}</h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={openCreateForm} className="btn-secondary">Add New Assessment Question</button>
                  {editingQuestion && (
                    <button type="button" onClick={() => void handleDelete(editingQuestion)} disabled={deletingId === editingQuestion.$id} className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                      {deletingId === editingQuestion.$id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>

              <form className="mt-6 grid gap-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="assessment-topic" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                  <select
                    id="assessment-topic"
                    value={form.topic_id}
                    onChange={(event) => {
                      const nextTopicId = event.target.value;
                      setSelectedTopicId(nextTopicId);
                      setForm((current) => ({ ...current, topic_id: nextTopicId, level: selectedLevel }));
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => <option key={topic.$id} value={topic.$id}>{topic.title}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="assessment-level" className="mb-2 block text-sm font-semibold text-slate-700">Level</label>
                  <select
                    id="assessment-level"
                    value={form.level ?? 1}
                    onChange={(event) => {
                      const nextLevel = Number(event.target.value) || 1;
                      setSelectedLevel(nextLevel);
                      updateFormField('level', nextLevel);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="assessment-question-text" className="mb-2 block text-sm font-semibold text-slate-700">Question</label>
                  <textarea id="assessment-question-text" rows={5} value={form.question_text} onChange={(event) => updateFormField('question_text', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Explain why trademarks are important for protecting a brand." />
                </div>

                <div>
                  <label htmlFor="assessment-difficulty" className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</label>
                  <select id="assessment-difficulty" value={form.difficulty} onChange={(event) => updateFormField('difficulty', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assessment-hint" className="mb-2 block text-sm font-semibold text-slate-700">Optional hint</label>
                  <textarea id="assessment-hint" rows={2} maxLength={500} value={form.hint ?? ''} onChange={(event) => updateFormField('hint', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Published
                </label>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeForm} className="btn-secondary">Clear</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Saving...' : editingQuestion ? 'Update question' : 'Save question'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
