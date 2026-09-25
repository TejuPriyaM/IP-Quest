'use client';

import { FormEvent, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { listTopics, type TopicRow } from '@/lib/topics';
import { createQuestion, deleteQuestion, listQuestions, type Question, type QuestionInput, updateQuestion } from '@/lib/questions';
import type { DifficultyLevel } from '@/data/mockTopics';

const difficultyOptions: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const createForm = (): QuestionInput => ({
  topic_id: '',
  options: ['', ''],
  correct_option: '',
  explanation: '',
  difficulty: '',
  is_published: false,
  question_text: '',
});

function getQuestionInput(question: Question): QuestionInput {
  return {
    topic_id: question.topic_id,
    options: [...question.options],
    correct_option: question.correct_option,
    explanation: question.explanation,
    difficulty: question.difficulty,
    is_published: question.is_published,
    question_text: question.question_text,
  };
}

type QuestionValidationResult = { error: string } | { data: QuestionInput };


export default function TeacherQuestionsPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionInput>(createForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [topicRows, questionRows] = await Promise.all([listTopics(), listQuestions()]);
      setTopics(topicRows);
      setQuestions(questionRows);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getTopicTitle(topicId: string) {
    return topics.find((topic) => topic.$id === topicId)?.title ?? 'Unknown topic';
  }

  function openCreateForm() {
    setEditingQuestion(null);
    setForm({ ...createForm(), topic_id: topics[0]?.$id ?? '' });
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function openEditForm(question: Question) {
    setEditingQuestion(question);
    setForm(getQuestionInput(question));
    setActionError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingQuestion(null);
    setForm(createForm());
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

    if (!form.topic_id) return { error: 'Please select a topic.' } as const;
    if (!form.question_text.trim()) return { error: 'Question text is required.' } as const;
    if (trimmedOptions.length === 0) return { error: 'At least one answer option is required.' } as const;
    if (trimmedOptions.some((option) => !option)) return { error: 'Answer options cannot be blank.' } as const;
    if (!form.correct_option || !trimmedOptions.includes(form.correct_option.trim())) return { error: 'Please select a correct option from the answer options.' } as const;
    if (typeof form.explanation !== 'string') return { error: 'Explanation must be text.' } as const;
    if (!form.difficulty) return { error: 'Please select a difficulty.' } as const;

    return {
      data: {
        topic_id: form.topic_id,
        options: trimmedOptions,
        correct_option: form.correct_option.trim(),
        explanation: form.explanation.trim(),
        difficulty: form.difficulty,
        is_published: form.is_published,
        question_text: form.question_text.trim(),
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
        await updateQuestion(editingQuestion.$id, validation.data);
        setSuccessMessage('Question updated successfully.');
      } else {
        await createQuestion(validation.data);
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
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage quiz questions and assessments for students.</p>
          </div>
          <button type="button" onClick={openCreateForm} disabled={topics.length === 0} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">Create Question</button>
        </div>

        {topics.length === 0 && !isLoading && !loadError && <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Create a topic before adding questions.</p>}
        {actionError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {successMessage && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

        {isFormOpen && (
          <section className="glass-card mt-8 max-w-3xl p-6 sm:p-8" aria-labelledby="question-form-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Question details</p>
                <h2 id="question-form-heading" className="mt-1 text-2xl font-bold text-slate-900">{editingQuestion ? 'Edit question' : 'Create question'}</h2>
              </div>
              <button type="button" onClick={closeForm} className="btn-secondary">{editingQuestion ? 'Cancel Edit' : 'Cancel'}</button>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="question-topic" className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
                <select id="question-topic" required value={form.topic_id} onChange={(event) => updateFormField('topic_id', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                  <option value="">Select a topic</option>
                  {topics.map((topic) => <option key={topic.$id} value={topic.$id}>{topic.title}</option>)}
                </select>
              </div>
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
                      <button type="button" onClick={() => removeOption(index)} className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => updateFormField('options', [...form.options, ''])} className="btn-secondary mt-3">Add Option</button>
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
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.is_published} onChange={(event) => updateFormField('is_published', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Published
              </label>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}</button>
            </form>
          </section>
        )}

        <section className="mt-8" aria-labelledby="question-list-heading">
          <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Assessment library</p><h2 id="question-list-heading" className="mt-1 text-2xl font-bold text-slate-900">All questions</h2></div>
          {isLoading ? <p className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading topics and questions...</p> : loadError ? <div className="glass-card p-6"><p className="text-sm text-red-700">{loadError}</p><button type="button" onClick={loadData} className="btn-secondary mt-4">Try again</button></div> : questions.length === 0 ? <div className="glass-card p-6"><p className="font-semibold text-slate-900">No questions yet</p><p className="mt-2 text-sm text-slate-600">Create your first question to start building an assessment.</p></div> : (
            <div className="grid gap-4">
              {questions.map((question) => (
                <article key={question.$id} className="glass-card p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{getTopicTitle(question.topic_id)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{question.difficulty}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${question.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{question.is_published ? 'Published' : 'Draft'}</span></div><h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">{question.question_text}</h3><p className="mt-2 text-sm text-slate-500">{question.options.length} options</p></div>
                    <div className="flex shrink-0 gap-3"><button type="button" onClick={() => openEditForm(question)} className="btn-secondary">Edit</button><button type="button" onClick={() => handleDelete(question)} disabled={deletingId === question.$id} className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{deletingId === question.$id ? 'Deleting...' : 'Delete'}</button></div>
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