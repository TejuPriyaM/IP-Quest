'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { listTopics, type TopicRow } from '@/lib/topics';
import { createQuestion, deleteQuestion, listQuestions, type Question, type QuestionInput, type QuestionKind, updateQuestion } from '@/lib/questions';
import { listLessons, type Lesson } from '@/lib/lessons';
import { getLearnTopicForModule, LEARN_MODULES } from '@/lib/learn';
import type { DifficultyLevel } from '@/data/mockTopics';

const difficultyOptions: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
 

const createForm = (): QuestionInput => ({
  topic_id: '',
  lesson_id: '',
  options: ['', '', '', ''],
  correct_option: '',
  explanation: '',
  difficulty: '',
  is_published: false,
  question_text: '',
  level: 1,
  hint: '',
});

function getQuestionInput(question: Question): QuestionInput {
  return {
    topic_id: question.topic_id,
    lesson_id: question.lesson_id ?? '',
    options: [...question.options],
    correct_option: question.correct_option,
    explanation: question.explanation,
    difficulty: question.difficulty,
    is_published: question.is_published,
    question_text: question.question_text,
    level: question.level ?? null,
    hint: question.hint ?? '',
  };
}

type QuestionValidationResult = { error: string } | { data: QuestionInput };

function shuffleQuestions(items: Question[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export default function TeacherQuestionsPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topicScope, setTopicScope] = useState<{ fromLearn: boolean; topicId: string }>({ fromLearn: false, topicId: '' });
  const [topicContextError, setTopicContextError] = useState('');
  const [selectedQuestionKind, setSelectedQuestionKind] = useState<QuestionKind>('learn-level');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionInput>(createForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const topicScopeInitialized = useRef(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [topicRows, lessonRows, questionRows] = await Promise.all([listTopics(), listLessons(), listQuestions()]);
      setTopics(topicRows);
      setLessons(lessonRows);
      setQuestions(shuffleQuestions(questionRows));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const learnTopics = useMemo(() => LEARN_MODULES.flatMap((module) => {
    const topic = getLearnTopicForModule(topics, module);
    return topic?.is_published === true ? [{ module, topic }] : [];
  }), [topics]);

  useEffect(() => {
    if (topicScopeInitialized.current) return;
    if (learnTopics.length === 0) {
      if (isLoading || loadError) return;
      topicScopeInitialized.current = true;
      const fromLearn = new URLSearchParams(window.location.search).get('from') === 'learn';
      setTopicScope({ fromLearn, topicId: '' });
      setTopicContextError(fromLearn ? 'Unable to load topics for this module. No Learn topics are available.' : '');
      return;
    }
    topicScopeInitialized.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const fromLearn = searchParams.get('from') === 'learn';
    const requestedTopicId = searchParams.get('topicId');
    const requestedTopic = learnTopics.find(({ topic }) => topic.$id === requestedTopicId);
    const topicId = requestedTopic?.topic.$id ?? (fromLearn ? '' : learnTopics[0]?.topic.$id ?? '');

    setTopicScope({ fromLearn, topicId: fromLearn ? topicId : '' });
    setTopicContextError(fromLearn && !topicId ? 'Unable to load topics for this module. Return to Learn and reopen its Quiz page.' : '');
    setSelectedTopicId(topicId);
    setForm((current) => ({ ...current, topic_id: topicId }));
  }, [isLoading, learnTopics, loadError]);

  const topicOptions = topicScope.fromLearn
    ? learnTopics.filter(({ topic }) => topic.$id === topicScope.topicId)
    : learnTopics;

  const visibleQuestions = useMemo(() => {
    if (!selectedTopicId) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return questions
      .filter((question) => question.topic_id === selectedTopicId)
      .filter((question) => question.is_published)
      .filter((question) => {
        if (selectedQuestionKind === 'lesson-assessment') return Boolean(question.lesson_id);
        if (question.lesson_id) return false;
        return selectedQuestionKind === 'teacher-quiz'
          ? question.level === null || question.level === undefined
          : question.level !== null && question.level !== undefined;
      })
      .filter((question) => {
        if (!normalizedSearch) return true;
        return question.question_text.toLowerCase().includes(normalizedSearch)
          || question.difficulty.toLowerCase().includes(normalizedSearch)
          || question.options.some((option) => option.toLowerCase().includes(normalizedSearch));
      });
  }, [questions, searchTerm, selectedQuestionKind, selectedTopicId]);

  function getTopicTitle(topicId: string) {
    return topics.find((topic) => topic.$id === topicId)?.title ?? 'Unknown topic';
  }

  function openCreateForm(kind: QuestionKind = selectedQuestionKind) {
    setEditingQuestion(null);
    setSelectedQuestionKind(kind);
    setForm({
      ...createForm(),
      topic_id: selectedTopicId,
      lesson_id: '',
      level: kind === 'learn-level' ? 1 : null,
      is_published: true,
    });
    setActionError('');
    setSuccessMessage('');
  }

  function openEditForm(question: Question) {
    const nextKind: QuestionKind = question.lesson_id
      ? 'lesson-assessment'
      : question.level === null || question.level === undefined
        ? 'teacher-quiz'
        : 'learn-level';
    setEditingQuestion(question);
    setSelectedQuestionKind(nextKind);
    setForm(getQuestionInput(question));
    setActionError('');
    setSuccessMessage('');
  }

  function closeForm() {
    setEditingQuestion(null);
    setForm({
      ...createForm(),
      topic_id: selectedTopicId,
      lesson_id: '',
      level: selectedQuestionKind === 'learn-level' ? 1 : null,
      is_published: true,
    });
  }

  function updateFormField<K extends keyof QuestionInput>(field: K, value: QuestionInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOption(index: number, value: string) {
    setForm((current) => {
      const options = [...current.options];
      const previousValue = options[index];
      options[index] = value;

      return {
        ...current,
        options,
        correct_option: current.correct_option === previousValue ? value : current.correct_option,
      };
    });
  }

  function removeOption(index: number) {
    setForm((current) => {
      const removedOption = current.options[index];
      const options = current.options.filter((_, optionIndex) => optionIndex !== index);

      return {
        ...current,
        options,
        correct_option: current.correct_option === removedOption ? '' : current.correct_option,
      };
    });
  }

  function validateForm(): QuestionValidationResult {
    const trimmedOptions = form.options.map((option) => option.trim());
    const selectedLesson = selectedQuestionKind === 'lesson-assessment'
      ? lessons.find((lesson) => lesson.$id === form.lesson_id)
      : undefined;

    if (!form.topic_id) return { error: 'Please select a topic.' } as const;
    if (selectedQuestionKind === 'lesson-assessment' && !selectedLesson) return { error: 'Please select a lesson for this assessment question.' } as const;
    if (selectedLesson && selectedLesson.topic_id !== form.topic_id) return { error: 'The selected lesson must belong to the selected topic.' } as const;
    if (!form.question_text.trim()) return { error: 'Question text is required.' } as const;
    if (trimmedOptions.length !== 4) return { error: 'Exactly four answer options are required.' } as const;
    if (trimmedOptions.some((option) => !option)) return { error: 'Answer options cannot be blank.' } as const;
    if (new Set(trimmedOptions.map((option) => option.toLocaleLowerCase())).size !== 4) return { error: 'Answer options must be distinct.' } as const;
    if (!form.correct_option || !trimmedOptions.includes(form.correct_option.trim())) return { error: 'Please select a correct option from the answer options.' } as const;
    if (typeof form.explanation !== 'string') return { error: 'Explanation must be text.' } as const;
    if (!form.difficulty) return { error: 'Please select a difficulty.' } as const;
    if (selectedQuestionKind === 'learn-level' && (!Number.isInteger(form.level) || (form.level as number) < 1 || (form.level as number) > 3)) return { error: 'Please select Level 1, 2, or 3.' } as const;
    if (typeof form.hint !== 'string' || form.hint.length > 500) return { error: 'Hint must be 500 characters or fewer.' } as const;

    return {
      data: {
        topic_id: form.topic_id,
        lesson_id: selectedLesson?.$id ?? '',
        options: trimmedOptions,
        correct_option: form.correct_option.trim(),
        explanation: form.explanation.trim(),
        difficulty: form.difficulty,
        is_published: form.is_published,
        question_text: form.question_text.trim(),
        level: selectedLesson || selectedQuestionKind === 'teacher-quiz' ? null : form.level,
        hint: form.hint.trim(),
      } satisfies QuestionInput,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError('');
    setSuccessMessage('');

    const validation = validateForm();
    if ('error' in validation) {
      setActionError(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.$id, validation.data, selectedQuestionKind);
        setSuccessMessage('Question updated successfully.');
      } else {
        await createQuestion(validation.data, selectedQuestionKind);
        setSuccessMessage('Question created successfully.');
      }

      closeForm();
      await loadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(question: Question) {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    setActionError('');
    setSuccessMessage('');
    setDeletingId(question.$id);

    try {
      await deleteQuestion(question.$id);
      setSuccessMessage('Question deleted successfully.');
      await loadData();
      if (editingQuestion?.$id === question.$id) {
        closeForm();
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete question. Please try again.');
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
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Questions / Quizzes</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage published and draft questions by topic, while keeping Learn Quiz and lesson assessment content separate.</p>
          </div>
          <button type="button" onClick={() => openCreateForm(selectedQuestionKind)} disabled={!selectedTopicId} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">Add New Question</button>
        </div>

        {actionError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {successMessage && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

        {isLoading ? (
          <p className="glass-card mt-8 p-6 text-sm text-slate-500" aria-busy="true">Loading topics and questions...</p>
        ) : loadError ? (
          <div className="glass-card mt-8 p-6">
            <p className="text-sm text-red-700">{loadError}</p>
            <button type="button" onClick={() => void loadData()} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="glass-card p-4 sm:p-5">
              <div className="mb-4">
                <label htmlFor="question-topic-filter" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                <select
                  id="question-topic-filter"
                  value={selectedTopicId}
                  onChange={(event) => {
                    const topicId = event.target.value;
                    setSelectedTopicId(topicId);
                    setSearchTerm('');
                    setEditingQuestion(null);
                    setForm({ ...createForm(), topic_id: topicId, level: selectedQuestionKind === 'learn-level' ? 1 : null, is_published: true });
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select a topic</option>
                  {topicOptions.map(({ topic }) => (
                    <option key={topic.$id} value={topic.$id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => openCreateForm('learn-level')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${selectedQuestionKind === 'learn-level' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}>Learn Quiz</button>
                <button type="button" onClick={() => openCreateForm('teacher-quiz')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${selectedQuestionKind === 'teacher-quiz' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}>Teacher Quiz</button>
                <button type="button" onClick={() => openCreateForm('lesson-assessment')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${selectedQuestionKind === 'lesson-assessment' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}>Assessment</button>
              </div>

              <div className="mb-4">
                <label htmlFor="question-search" className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
                <input id="question-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search in this topic..." className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>

              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Question list</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{visibleQuestions.length}</span>
              </div>

              {selectedTopicId ? (
                visibleQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    No {selectedQuestionKind === 'lesson-assessment' ? 'assessment' : 'Learn Quiz'} questions for {getTopicTitle(selectedTopicId)} yet.
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
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{question.lesson_id ? 'Assessment' : question.level === null || question.level === undefined ? 'Teacher Quiz' : 'Learn'}</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${question.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{question.is_published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm font-semibold text-slate-900">{question.question_text}</p>
                        <p className="mt-2 text-xs text-slate-500">{question.difficulty}{question.level ? ` · Level ${question.level}` : ''}</p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Choose a topic to view its question list.</div>
              )}
            </aside>

            <section className="glass-card p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Question editor</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{editingQuestion ? 'Edit selected question' : 'Create New Question'}</h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openCreateForm(selectedQuestionKind)} className="btn-secondary">New</button>
                  {editingQuestion && (
                    <button type="button" onClick={() => void handleDelete(editingQuestion)} disabled={deletingId === editingQuestion.$id} className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                      {deletingId === editingQuestion.$id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>

              <form className="mt-6 grid gap-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="question-kind" className="mb-2 block text-sm font-semibold text-slate-700">Question type</label>
                  <select id="question-kind" value={selectedQuestionKind} disabled={Boolean(editingQuestion)} onChange={(event) => {
                    const nextKind = event.target.value as QuestionKind;
                    setSelectedQuestionKind(nextKind);
                    setForm((current) => ({ ...current, lesson_id: '', level: nextKind === 'learn-level' ? current.level ?? 1 : null }));
                  }} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    <option value="learn-level">Learn Level Quiz Question</option>
                    <option value="teacher-quiz">Teacher Quiz Question</option>
                    <option value="lesson-assessment">Lesson Assessment Question</option>
                  </select>
                  <p className="mt-2 text-sm text-slate-500">Use the selected topic and question type to keep teacher-created items separated correctly.</p>
                </div>

                <div>
                  <label htmlFor="question-topic" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                  <select id="question-topic" required disabled={topicOptions.length === 0} value={form.topic_id} onChange={(event) => {
                    const topicId = event.target.value;
                    setSelectedTopicId(topicId);
                    setSearchTerm('');
                    setEditingQuestion(null);
                    setForm((current) => ({ ...current, topic_id: topicId, lesson_id: '' }));
                  }} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100">
                    <option value="">Select a topic</option>
                    {topicOptions.map(({ topic }) => <option key={topic.$id} value={topic.$id}>{topic.title}</option>)}
                  </select>
                  {topicContextError && <p className="mt-2 text-sm text-red-700" role="alert">{topicContextError}</p>}
                </div>

                {selectedQuestionKind === 'lesson-assessment' && (
                  <div>
                    <label htmlFor="question-lesson" className="mb-2 block text-sm font-semibold text-slate-700">Lesson</label>
                    <select id="question-lesson" required value={form.lesson_id ?? ''} onChange={(event) => updateFormField('lesson_id', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                      <option value="">Select a lesson</option>
                      {lessons.filter((lesson) => lesson.topic_id === form.topic_id).map((lesson) => <option key={lesson.$id} value={lesson.$id}>{lesson.title}{lesson.is_published ? '' : ' (Draft)'}</option>)}
                    </select>
                    {form.topic_id && lessons.every((lesson) => lesson.topic_id !== form.topic_id) && <p className="mt-2 text-sm text-slate-500">Create a lesson for this topic before adding assessment questions.</p>}
                  </div>
                )}

                <div>
                  <label htmlFor="question-text" className="mb-2 block text-sm font-semibold text-slate-700">Question text</label>
                  <textarea id="question-text" required rows={4} value={form.question_text} onChange={(event) => updateFormField('question_text', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <fieldset>
                  <legend className="mb-2 block text-sm font-semibold text-slate-700">Answer options</legend>
                  <div className="space-y-3">
                    {form.options.map((option, index) => (
                      <div key={index} className="flex gap-3">
                        <input aria-label={`Answer option ${index + 1}`} value={option} onChange={(event) => updateOption(index, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                        <button type="button" onClick={() => removeOption(index)} disabled={form.options.length <= 4} className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Remove</button>
                      </div>
                    ))}
                  </div>
                  {form.options.length < 4 && <button type="button" onClick={() => updateFormField('options', [...form.options, ''])} className="btn-secondary mt-3">Add Option</button>}
                </fieldset>

                <div>
                  <label htmlFor="question-correct-option" className="mb-2 block text-sm font-semibold text-slate-700">Correct option</label>
                  <select id="question-correct-option" required value={form.correct_option} onChange={(event) => updateFormField('correct_option', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    <option value="">Select the correct option</option>
                    {form.options.filter((option) => option.trim()).map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="question-explanation" className="mb-2 block text-sm font-semibold text-slate-700">Explanation</label>
                  <textarea id="question-explanation" rows={3} value={form.explanation} onChange={(event) => updateFormField('explanation', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <div>
                  <label htmlFor="question-difficulty" className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</label>
                  <select id="question-difficulty" required value={form.difficulty} onChange={(event) => updateFormField('difficulty', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                    <option value="">Select difficulty</option>
                    {difficultyOptions.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                  </select>
                </div>

                {selectedQuestionKind === 'learn-level' ? (
                  <div>
                    <label htmlFor="question-level" className="mb-2 block text-sm font-semibold text-slate-700">Learn Quiz level</label>
                    <select id="question-level" required value={form.level ?? ''} onChange={(event) => updateFormField('level', event.target.value ? Number(event.target.value) : null)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                      <option value="">Select Level 1, 2, or 3</option>
                      <option value="1">Level 1</option>
                      <option value="2">Level 2</option>
                      <option value="3">Level 3</option>
                    </select>
                  </div>
                ) : selectedQuestionKind === 'teacher-quiz' ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Teacher Quiz questions are separate from the fixed Level 1, 2, and 3 quizzes.</p>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Lesson assessment questions are not assigned to a Learn Quiz level.</p>
                )}

                <div>
                  <label htmlFor="question-hint" className="mb-2 block text-sm font-semibold text-slate-700">Optional hint</label>
                  <textarea id="question-hint" rows={2} maxLength={500} value={form.hint ?? ''} onChange={(event) => updateFormField('hint', event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Published
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}</button>
                  {editingQuestion && <button type="button" onClick={closeForm} className="btn-secondary">Clear</button>}
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
