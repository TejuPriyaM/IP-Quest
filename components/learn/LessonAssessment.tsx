'use client';

import { useEffect, useMemo, useState } from 'react';
import { createQuizJWT } from '@/lib/auth';

type AssessmentSummary = {
  level: number;
  questionCount: number;
};

type AssessmentQuestion = {
  id: string;
  topic_id: string;
  level: number;
  question_text: string;
  difficulty: string;
};

type AssessmentResponsePayload = {
  questions: AssessmentQuestion[];
  responses: Record<string, string>;
};

async function assessmentRequest<T>(url: string, body?: Record<string, unknown>): Promise<T> {
  const jwt = await createQuizJWT();
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${jwt}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Unable to load written assessment data.';
    throw new Error(message);
  }

  return payload as T;
}

export default function LessonAssessment({ topic }: { topic: { id: string; title: string } }) {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [draftAnswer, setDraftAnswer] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const availableQuestions = useMemo(() => {
    if (selectedLevel === null) return [];
    return questions.filter((question) => question.topic_id === topic.id && question.level === selectedLevel);
  }, [questions, selectedLevel, topic.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadWrittenAssessments() {
      setIsLoading(true);
      setError('');

      try {
        const payload = await assessmentRequest<AssessmentResponsePayload>(`/api/teacher-assessment?topicId=${encodeURIComponent(topic.id)}`);
        if (!isMounted) return;

        const nextQuestions = payload.questions.filter((question) => question.topic_id === topic.id);
        const nextLevels = Array.from(new Set(nextQuestions.map((question) => question.level))).sort((first, second) => first - second);

        setQuestions(nextQuestions);
        setSavedAnswers(payload.responses ?? {});
        setAssessments(nextLevels.map((level) => ({ level, questionCount: nextQuestions.filter((question) => question.level === level).length })));
        setSelectedLevel((current) => {
          if (nextLevels.includes(current ?? 0)) return current;
          return nextLevels[0] ?? null;
        });
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load written assessments.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWrittenAssessments();

    return () => {
      isMounted = false;
    };
  }, [topic.id]);

  async function handleSave(question: AssessmentQuestion) {
    const trimmedAnswer = draftAnswer.trim();
    if (!trimmedAnswer) {
      setError('Please enter an answer before saving.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = await assessmentRequest<{ questionId: string; answer: string }>('/api/teacher-assessment', {
        questionId: question.id,
        answer: trimmedAnswer,
      });

      setSavedAnswers((current) => ({ ...current, [payload.questionId]: payload.answer }));
      setDraftAnswer('');
      setEditingQuestionId(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your written answer.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(questionId: string) {
    setEditingQuestionId(questionId);
    setDraftAnswer(savedAnswers[questionId] ?? '');
    setError('');
  }

  if (isLoading) {
    return <p className="glass-card p-6 text-sm text-slate-600" role="status">Loading written assessments...</p>;
  }

  if (assessments.length === 0) {
    return (
      <section className="glass-card min-w-0 p-5 sm:p-7" aria-labelledby="written-assessment-list-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{topic.title}</p>
        <h2 id="written-assessment-list-heading" className="mt-2 text-2xl font-bold text-slate-900">Written assessment</h2>
        <p className="mt-4 text-sm text-slate-600">No published written assignments are available for this topic yet.</p>
      </section>
    );
  }

  return (
    <section className="glass-card min-w-0 p-5 sm:p-8" aria-labelledby="written-assessment-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{topic.title}</p>
      <h2 id="written-assessment-heading" className="mt-2 text-2xl font-bold text-slate-900">Written assessment</h2>
      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {assessments.map((assessment) => (
          <button
            key={assessment.level}
            type="button"
            onClick={() => {
              setSelectedLevel(assessment.level);
              setDraftAnswer('');
              setEditingQuestionId(null);
            }}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedLevel === assessment.level ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            Level {assessment.level} ({assessment.questionCount})
          </button>
        ))}
      </div>

      {selectedLevel !== null && (
        <div className="mt-6 space-y-5">
          {availableQuestions.map((question) => {
            const currentAnswer = savedAnswers[question.id] ?? '';
            const isEditing = editingQuestionId === question.id;

            return (
              <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Level {question.level}</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{question.question_text}</h3>
                <p className="mt-2 text-sm text-slate-500">{question.difficulty}</p>

                {isEditing || !currentAnswer ? (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Your answer</label>
                    <textarea
                      rows={8}
                      value={isEditing ? draftAnswer : ''}
                      onChange={(event) => setDraftAnswer(event.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => void handleSave(question)} disabled={isSaving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      {isEditing && (
                        <button type="button" onClick={() => { setEditingQuestionId(null); setDraftAnswer(''); setError(''); }} className="btn-secondary">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Saved answer</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">{currentAnswer}</p>
                    </div>
                    <div className="mt-4">
                      <button type="button" onClick={() => handleEdit(question.id)} className="btn-secondary">Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
