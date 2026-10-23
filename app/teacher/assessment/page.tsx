'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { listLessons, type Lesson } from '@/lib/lessons';
import { createQuestion, deleteQuestion, listQuestions, type Question, type QuestionInput, updateQuestion } from '@/lib/questions';
import { listTopics, type TopicRow } from '@/lib/topics';

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

const createForm = (topicId = '', lessonId = ''): QuestionInput => ({
  topic_id: topicId,
  lesson_id: lessonId,
  options: ['', '', '', ''],
  correct_option: '',
  explanation: '',
  difficulty: 'Beginner',
  is_published: true,
  question_text: '',
  level: null,
  hint: '',
});

function shuffleQuestions(items: Question[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function questionToForm(question: Question): QuestionInput {
  return {
    topic_id: question.topic_id,
    lesson_id: question.lesson_id ?? '',
    options: [...question.options],
    correct_option: question.correct_option,
    explanation: question.explanation,
    difficulty: question.difficulty,
    is_published: question.is_published,
    question_text: question.question_text,
    level: null,
    hint: question.hint ?? '',
  };
}

export default function TeacherAssessmentPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
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
      const [topicRows, lessonRows, questionRows] = await Promise.all([listTopics(), listLessons(), listQuestions()]);
      setTopics(topicRows);
      setLessons(lessonRows);
      setQuestions(shuffleQuestions(questionRows));

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

    if (!selectedTopicId) {
      setSelectedLessonId('');
      return;
    }

    const topicLessons = lessons.filter((lesson) => lesson.topic_id === selectedTopicId);
    if (!topicLessons.some((lesson) => lesson.$id === selectedLessonId)) {
      setSelectedLessonId(topicLessons[0]?.$id ?? '');
    }
  }, [selectedTopicId, selectedLessonId, lessons, topics]);

  useEffect(() => {
    if (!selectedTopicId) {
      setForm(createForm());
      return;
    }

    const nextLessonId = selectedLessonId || lessons.find((lesson) => lesson.topic_id === selectedTopicId)?.$id || '';
    setForm((current) => ({
      ...createForm(selectedTopicId, nextLessonId),
      ...current,
      topic_id: selectedTopicId,
      lesson_id: nextLessonId,
      is_published: true,
    }));
  }, [selectedTopicId, selectedLessonId, lessons]);

  const topicLessons = useMemo(() => lessons.filter((lesson) => lesson.topic_id === selectedTopicId), [lessons, selectedTopicId]);

  function handleTopicFilterChange(topicId: string) {
    const nextLessonId = lessons.find((lesson) => lesson.topic_id === topicId)?.$id ?? '';
    setSelectedTopicId(topicId);
    setSelectedLessonId(nextLessonId);
    setSearchTerm('');
    setEditingQuestion(null);
    setForm(createForm(topicId, nextLessonId));
  }

  function handleLessonFilterChange(lessonId: string) {
    setSelectedLessonId(lessonId);
    setEditingQuestion(null);
    setForm(createForm(selectedTopicId, lessonId || topicLessons[0]?.$id || ''));
  }

  const visibleQuestions = useMemo(() => {
    if (!selectedTopicId) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    return questions
      .filter((question) => question.topic_id === selectedTopicId)
      .filter((question) => Boolean(question.lesson_id))
      .filter((question) => question.is_published)
      .filter((question) => lessons.some((lesson) => lesson.$id === question.lesson_id && lesson.topic_id === selectedTopicId))
      .filter((question) => (selectedLessonId ? question.lesson_id === selectedLessonId : true))
      .filter((question) => {
        if (!normalizedSearch) return true;
        return question.question_text.toLowerCase().includes(normalizedSearch)
          || question.difficulty.toLowerCase().includes(normalizedSearch)
          || question.options.some((option) => option.toLowerCase().includes(normalizedSearch));
      });
  }, [lessons, questions, searchTerm, selectedLessonId, selectedTopicId]);

  function getTopicTitle(topicId: string) {
    return topics.find((topic) => topic.$id === topicId)?.title ?? 'Unknown topic';
  }

  function getLessonTitle(lessonId: string) {
    return lessons.find((lesson) => lesson.$id === lessonId)?.title ?? 'Unknown lesson';
  }

  function openCreateForm() {
    const defaultLessonId = selectedLessonId || topicLessons[0]?.$id || '';
    setEditingQuestion(null);
    setForm(createForm(selectedTopicId, defaultLessonId));
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
    const defaultLessonId = selectedLessonId || topicLessons[0]?.$id || '';
    setEditingQuestion(null);
    setForm(createForm(selectedTopicId, defaultLessonId));
  }

  function updateFormField<K extends keyof QuestionInput>(field: K, value: QuestionInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOption(index: number, value: string) {
    setForm((current) => {
      const nextOptions = [...current.options];
      const previousValue = nextOptions[index];
      nextOptions[index] = value;

      return {
        ...current,
        options: nextOptions,
        correct_option: current.correct_option === previousValue ? value : current.correct_option,
      };
    });
  }

  function validateForm(): QuestionInput {
    if (!form.topic_id) {
      throw new Error('Please select a topic for this assessment question.');
    }
    if (!form.lesson_id) {
      throw new Error('Please select the lesson that owns this assessment question.');
    }

    const selectedLesson = lessons.find((lesson) => lesson.$id === form.lesson_id);
    if (!selectedLesson) {
      throw new Error('The selected lesson could not be found.');
    }
    if (selectedLesson.topic_id !== form.topic_id) {
      throw new Error('The lesson must belong to the selected topic.');
    }
    if (!form.question_text.trim()) {
      throw new Error('Question text is required.');
    }
    if (form.options.length !== 4 || form.options.some((option) => !option.trim())) {
      throw new Error('Each assessment question must have four non-empty answer options.');
    }
    if (new Set(form.options.map((option) => option.trim().toLocaleLowerCase())).size !== 4) {
      throw new Error('Answer options must be distinct.');
    }
    if (!form.correct_option.trim() || !form.options.some((option) => option.trim() === form.correct_option.trim())) {
      throw new Error('Select a correct answer from the list of options.');
    }
    if (!form.difficulty.trim()) {
      throw new Error('Please choose a difficulty level.');
    }
    if (typeof form.explanation !== 'string' || !form.explanation.trim()) {
      throw new Error('Please add an explanation for the answer key.');
    }
    if (form.hint && form.hint.length > 500) {
      throw new Error('Hints must be 500 characters or fewer.');
    }

    return {
      topic_id: form.topic_id,
      lesson_id: form.lesson_id,
      options: form.options.map((option) => option.trim()),
      correct_option: form.correct_option.trim(),
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
      is_published: form.is_published,
      question_text: form.question_text.trim(),
      level: null,
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
        await updateQuestion(editingQuestion.$id, payload);
        setSuccessMessage('Assessment question updated successfully.');
      } else {
        await createQuestion(payload);
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
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage the existing assessment questions for each topic and lesson without duplicating records.</p>
          </div>
          <button type="button" onClick={openCreateForm} disabled={!selectedTopicId || !selectedLessonId} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">Add New Assessment Question</button>
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
                  onChange={(event) => handleTopicFilterChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.$id} value={topic.$id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="assessment-lesson-filter" className="mb-2 block text-sm font-semibold text-slate-700">Lesson</label>
                <select
                  id="assessment-lesson-filter"
                  value={selectedLessonId}
                  onChange={(event) => handleLessonFilterChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  disabled={!selectedTopicId}
                >
                  <option value="">All lessons</option>
                  {topicLessons.map((lesson) => (
                    <option key={lesson.$id} value={lesson.$id}>{lesson.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="assessment-search" className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
                <input
                  id="assessment-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search assessment questions..."
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
                    No assessment questions found for {getTopicTitle(selectedTopicId)}{selectedLessonId ? ` in ${getLessonTitle(selectedLessonId)}` : ''} yet.
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
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Assessment</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${question.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{question.is_published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm font-semibold text-slate-900">{question.question_text}</p>
                        <p className="mt-2 text-xs text-slate-500">{question.difficulty} · {getLessonTitle(question.lesson_id ?? '')}</p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Choose a topic to view its assessment questions.</div>
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
                    disabled={Boolean(editingQuestion)}
                    onChange={(event) => {
                      const topicId = event.target.value;
                      const nextLessonId = lessons.find((lesson) => lesson.topic_id === topicId)?.$id ?? '';
                      setForm((current) => ({ ...current, topic_id: topicId, lesson_id: nextLessonId }));
                      setSelectedTopicId(topicId);
                      setSelectedLessonId(nextLessonId);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => <option key={topic.$id} value={topic.$id}>{topic.title}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="assessment-lesson" className="mb-2 block text-sm font-semibold text-slate-700">Lesson</label>
                  <select
                    id="assessment-lesson"
                    value={form.lesson_id ?? ''}
                    disabled={!form.topic_id || Boolean(editingQuestion)}
                    onChange={(event) => {
                      updateFormField('lesson_id', event.target.value);
                      setSelectedLessonId(event.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Select a lesson</option>
                    {lessons.filter((lesson) => lesson.topic_id === form.topic_id).map((lesson) => (
                      <option key={lesson.$id} value={lesson.$id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assessment-question-text" className="mb-2 block text-sm font-semibold text-slate-700">Question text</label>
                  <textarea id="assessment-question-text" rows={4} value={form.question_text} onChange={(event) => updateFormField('question_text', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <fieldset>
                  <legend className="mb-2 block text-sm font-semibold text-slate-700">Answer options</legend>
                  <div className="space-y-3">
                    {form.options.map((option, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          aria-label={`Answer option ${index + 1}`}
                          value={option}
                          onChange={(event) => updateOption(index, event.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="assessment-correct-option" className="mb-2 block text-sm font-semibold text-slate-700">Correct option</label>
                  <select id="assessment-correct-option" value={form.correct_option} onChange={(event) => updateFormField('correct_option', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    <option value="">Select the correct option</option>
                    {form.options.filter((option) => option.trim()).map((option, index) => (
                      <option key={`${option}-${index}`} value={option}>{option}</option>
                    ))}
                  </select>
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
                  <label htmlFor="assessment-explanation" className="mb-2 block text-sm font-semibold text-slate-700">Explanation</label>
                  <textarea id="assessment-explanation" rows={3} value={form.explanation} onChange={(event) => updateFormField('explanation', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <div>
                  <label htmlFor="assessment-hint" className="mb-2 block text-sm font-semibold text-slate-700">Hint</label>
                  <input id="assessment-hint" value={form.hint ?? ''} onChange={(event) => updateFormField('hint', event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  Published
                </label>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeForm} className="btn-secondary">Clear</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Saving...' : editingQuestion ? 'Update question' : 'Create question'}
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
