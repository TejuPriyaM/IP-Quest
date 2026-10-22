import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const appwriteMock = vi.hoisted(() => ({
  accountGet: vi.fn(),
  teacherTeamGet: vi.fn(),
  listRows: vi.fn(),
  getRow: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn(),
  attemptRows: [] as Array<Record<string, unknown>>,
  questionRows: [] as Array<Record<string, unknown>>,
  responseRows: [] as Array<Record<string, unknown>>,
  topicPublished: true,
  profileRole: 'student',
  isTeacherTeamMember: false,
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
  },
}));

vi.mock('node-appwrite', () => {
  class MockClient {
    authMode = 'none';

    setEndpoint() { return this; }
    setProject() { return this; }
    setJWT() { this.authMode = 'jwt'; return this; }
    setKey() { this.authMode = 'key'; return this; }
  }

  class MockAccount {
    constructor(private readonly client: MockClient) {}
    get() { return appwriteMock.accountGet(this.client.authMode); }
  }

  class MockTablesDB {
    constructor(private readonly client: MockClient) {}
    listRows(params: unknown) { return appwriteMock.listRows(this.client.authMode, params); }
    getRow(params: unknown) { return appwriteMock.getRow(this.client.authMode, params); }
    createRow(params: unknown) { return appwriteMock.createRow(this.client.authMode, params); }
    updateRow(params: unknown) { return appwriteMock.updateRow(this.client.authMode, params); }
    deleteRow(params: unknown) { return appwriteMock.deleteRow(this.client.authMode, params); }
  }

  class MockTeams {
    get(params: unknown) { return appwriteMock.teacherTeamGet(params); }
  }

  return {
    Account: MockAccount,
    Client: MockClient,
    ID: { unique: () => 'generated-row-id' },
    Query: {
      equal: (key: string, value: unknown) => `equal:${key}:${String(value)}`,
      isNull: (key: string) => `isNull:${key}`,
      limit: (value: number) => `limit:${value}`,
      cursorAfter: (value: string) => `cursorAfter:${value}`,
      orderDesc: (key: string) => `orderDesc:${key}`,
      orderAsc: (key: string) => `orderAsc:${key}`,
    },
    TablesDB: MockTablesDB,
    Teams: MockTeams,
  };
});

import { getQuizPerformanceHistoryForUserId, getStudentPerformanceHistory, startOrResumeLevel, verifyQuizRole } from '@/lib/server/level-quiz';
import { loadQuizQuestions } from '@/lib/server/quiz';
import { submitLessonAssessment } from '@/lib/server/lesson-assessments';
import { listTeacherQuestions } from '@/lib/server/teacher-questions';
import {
  getTeacherAssessmentResponses,
  listTeacherAssessmentQuestions,
  saveTeacherAssessmentResponse,
} from '@/lib/server/teacher-assessment';

function makeQuestion(overrides: Record<string, unknown> = {}) {
  return {
    $id: 'question-1',
    topic_id: 'topic-1',
    lesson_id: null,
    level: 1,
    is_published: true,
    question_text: 'What is protected?',
    options: ['A', 'B', 'C', 'D'],
    correct_option: 'A',
    explanation: 'Explanation',
    difficulty: 'Easy',
    hint: 'Hint',
    ...overrides,
  };
}

function makeWrittenQuestion(overrides: Record<string, unknown> = {}) {
  return makeQuestion({
    lesson_id: '',
    level: 2,
    options: [],
    correct_option: '',
    ...overrides,
  });
}

function makeResponse(overrides: Record<string, unknown> = {}) {
  return {
    $id: 'response-1',
    student_id: 'student-1',
    question_id: 'question-1',
    topic_id: 'topic-1',
    level: 2,
    answer: 'My answer',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'test-api-key');
  appwriteMock.questionRows = [];
  appwriteMock.attemptRows = [];
  appwriteMock.responseRows = [];
  appwriteMock.topicPublished = true;
  appwriteMock.profileRole = 'student';
  appwriteMock.isTeacherTeamMember = false;
  appwriteMock.accountGet.mockResolvedValue({ $id: 'student-1' });
  appwriteMock.teacherTeamGet.mockImplementation(async () => {
    if (appwriteMock.isTeacherTeamMember) return { $id: 'teachers' };
    throw Object.assign(new Error('Not in Teachers team'), { code: 403 });
  });
  appwriteMock.getRow.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { tableId: string; rowId: string };
    if (params.tableId === 'profiles') return { $id: 'student-1', role: appwriteMock.profileRole };
    if (params.tableId === 'topics') {
      return { $id: 'topic-1', title: 'Patent', slug: 'patent', is_published: appwriteMock.topicPublished };
    }
    if (params.tableId === 'lessons') return {
      $id: params.rowId,
      title: 'Lesson title',
      topic_id: 'topic-1',
      is_published: true,
    };
    if (params.tableId === 'questions') {
      const question = appwriteMock.questionRows.find((row) => row.$id === params.rowId);
      if (question) return question;
    }
    throw new Error('Mock row not found');
  });
  appwriteMock.listRows.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { tableId: string; queries: string[] };
    if (params.tableId === 'quiz_attempts') {
      const userId = params.queries.find((query) => query.startsWith('equal:user_id:'))?.slice('equal:user_id:'.length);
      const filteredRows = appwriteMock.attemptRows.filter((row) => row.user_id === userId);
      const cursor = params.queries.find((query) => query.startsWith('cursorAfter:'))?.slice('cursorAfter:'.length);
      const cursorIndex = cursor ? filteredRows.findIndex((row) => row.$id === cursor) + 1 : 0;
      return { rows: filteredRows.slice(cursorIndex, cursorIndex + 100) };
    }
    if (params.tableId === 'questions') {
      if (params.queries.includes('isNull:lesson_id')) {
        return { rows: appwriteMock.questionRows.filter((row) => row.lesson_id === null) };
      }
      if (params.queries.includes('equal:lesson_id:')) {
        return { rows: appwriteMock.questionRows.filter((row) => row.lesson_id === '') };
      }
      return { rows: appwriteMock.questionRows };
    }
    if (params.tableId === 'teacher_assessment_responses') return { rows: appwriteMock.responseRows };
    return { rows: [] };
  });
  appwriteMock.createRow.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { rowId: string; data: Record<string, unknown> };
    return { $id: params.rowId, ...params.data };
  });
  appwriteMock.updateRow.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { rowId: string; data: Record<string, unknown> };
    return { $id: params.rowId, ...params.data };
  });
  appwriteMock.deleteRow.mockResolvedValue({});
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('server-enforced teacher authorization', () => {
  it('rejects a forged teacher profile when the authenticated user is not a team member', async () => {
    appwriteMock.profileRole = 'teacher';

    await expect(verifyQuizRole('student-jwt', 'teacher')).rejects.toMatchObject({ statusCode: 403 });
    expect(appwriteMock.accountGet).toHaveBeenCalledOnce();
    expect(appwriteMock.getRow).not.toHaveBeenCalled();
  });

  it('allows authenticated team members regardless of profile role', async () => {
    appwriteMock.profileRole = 'student';
    appwriteMock.isTeacherTeamMember = true;

    await expect(verifyQuizRole('student-jwt', 'teacher')).resolves.toMatchObject({ $id: 'student-1' });
    expect(appwriteMock.getRow).toHaveBeenCalledWith('jwt', expect.objectContaining({ tableId: 'profiles', rowId: 'student-1' }));
  });

  it('does not let teacher team members use student-only quiz routes', async () => {
    appwriteMock.isTeacherTeamMember = true;

    await expect(verifyQuizRole('student-jwt', 'student')).rejects.toMatchObject({ statusCode: 403 });
    expect(appwriteMock.getRow).not.toHaveBeenCalled();
  });

  it('does not let a forged profile role retrieve teacher question rows or answer keys', async () => {
    appwriteMock.profileRole = 'teacher';
    appwriteMock.questionRows = [makeQuestion()];

    await expect(listTeacherQuestions('student-jwt')).rejects.toMatchObject({ statusCode: 403 });
    expect(appwriteMock.listRows).not.toHaveBeenCalled();
  });

  it('only returns answer-free quiz questions to an authenticated student', async () => {
    appwriteMock.questionRows = [makeQuestion()];

    const questions = await loadQuizQuestions('student-jwt', 'topic-1');

    expect(questions).toHaveLength(1);
    expect(questions[0]).not.toHaveProperty('correct_option');
    expect(questions[0]).not.toHaveProperty('explanation');
  });

  it('does not give an approved teacher access to student performance history', async () => {
    appwriteMock.isTeacherTeamMember = true;

    await expect(getStudentPerformanceHistory('teacher-jwt')).rejects.toMatchObject({ statusCode: 403 });
    expect(appwriteMock.listRows).not.toHaveBeenCalled();
  });

  it('scopes a student performance query to the JWT-authenticated user ID', async () => {
    await getStudentPerformanceHistory('student-jwt');

    const attemptQuery = appwriteMock.listRows.mock.calls.find(([, params]) =>
      (params as { tableId: string }).tableId === 'quiz_attempts',
    );
    expect((attemptQuery?.[1] as { queries: string[] }).queries).toContain('equal:user_id:student-1');
  });

  it('paginates attempts, omits missing scores, and returns no saved answer fields', async () => {
    appwriteMock.attemptRows = [
      ...Array.from({ length: 101 }, (_, index) => ({
        $id: `attempt-${index}`,
        user_id: 'student-1',
        topic_id: 'topic-1',
        ...(index === 0 ? { lesson_id: 'lesson-1' } : { status: 'completed' }),
        score: 4,
        total_questions: 5,
        completed_at: '2026-01-01T00:00:00.000Z',
        passed: true,
        responses: JSON.stringify({ answers: [{ selectedOption: 'A', correctAnswer: 'A' }] }),
      })),
      {
        $id: 'attempt-missing-score',
        user_id: 'student-1',
        topic_id: 'topic-1',
        total_questions: 5,
        completed_at: '2026-01-02T00:00:00.000Z',
      },
      {
        $id: 'attempt-zero-total',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: 0,
        total_questions: 0,
        completed_at: '2026-01-03T00:00:00.000Z',
      },
      {
        $id: 'attempt-negative-score',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: -1,
        total_questions: 5,
        completed_at: '2026-01-04T00:00:00.000Z',
      },
      {
        $id: 'attempt-score-over-total',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: 6,
        total_questions: 5,
        completed_at: '2026-01-05T00:00:00.000Z',
      },
      {
        $id: 'attempt-fractional-total',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: 1,
        total_questions: 2.5,
        completed_at: '2026-01-06T00:00:00.000Z',
      },
      {
        $id: 'attempt-fractional-score',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: 1.5,
        total_questions: 2,
        completed_at: '2026-01-07T00:00:00.000Z',
      },
      {
        $id: 'attempt-valid-zero-score',
        user_id: 'student-1',
        topic_id: 'topic-1',
        score: 0,
        total_questions: 5,
        status: 'completed',
        completed_at: '2026-01-08T00:00:00.000Z',
      },
      {
        $id: 'attempt-other-student',
        user_id: 'student-2',
        topic_id: 'topic-1',
        score: 5,
        total_questions: 5,
        completed_at: '2026-01-04T00:00:00.000Z',
      },
    ];

    const history = await getQuizPerformanceHistoryForUserId('student-1');
    const attemptQueries = appwriteMock.listRows.mock.calls.filter(([, params]) =>
      (params as { tableId: string }).tableId === 'quiz_attempts',
    );
    const flattenedHistory = [...history.levelAttempts, ...history.teacherQuizAttempts, ...history.lessonAssessments];

    expect(attemptQueries).toHaveLength(2);
    expect((attemptQueries[1][1] as { queries: string[] }).queries).toContain('cursorAfter:attempt-99');
    expect(flattenedHistory).toHaveLength(102);
    expect(flattenedHistory.find((attempt) => attempt.attemptId === 'attempt-valid-zero-score'))
      .toMatchObject({ score: 0, totalQuestions: 5, percentage: 0 });
    expect(flattenedHistory.every((attempt) => attempt.percentage >= 0 && attempt.percentage <= 100)).toBe(true);
    expect(history.lessonAssessments[0]).toMatchObject({ lessonTitle: 'Lesson title', score: 4, totalQuestions: 5 });
    expect(JSON.stringify(history)).not.toContain('responses');
    expect(JSON.stringify(history)).not.toContain('correctAnswer');
    expect(JSON.stringify(history)).not.toContain('selectedOption');
  });

  it('maps lesson assessments from versioned metadata in the existing responses column', async () => {
    appwriteMock.attemptRows = [{
      $id: 'lesson-assessment-attempt',
      user_id: 'student-1',
      topic_id: 'topic-1',
      score: 0,
      total_questions: 1,
      completed_at: '2026-02-01T00:00:00.000Z',
      status: 'completed',
      responses: JSON.stringify({ version: 1, kind: 'lesson_assessment', lessonId: 'lesson-1' }),
    }];

    const history = await getQuizPerformanceHistoryForUserId('student-1');

    expect(history.lessonAssessments).toMatchObject([
      { attemptId: 'lesson-assessment-attempt', lessonId: 'lesson-1', lessonTitle: 'Lesson title', percentage: 0 },
    ]);
    expect(history.teacherQuizAttempts).toHaveLength(0);
    expect(JSON.stringify(history)).not.toContain('responses');
  });

  it('saves lesson assessment results without writing the unsupported lesson_id column or student answers', async () => {
    appwriteMock.questionRows = [makeQuestion({
      $id: 'lesson-question',
      lesson_id: 'lesson-1',
      level: null,
    })];

    const result = await submitLessonAssessment('student-jwt', 'topic-1', 'lesson-1', [
      { questionId: 'lesson-question', selectedOption: 'A' },
    ]);
    const params = appwriteMock.createRow.mock.calls[0][1] as {
      tableId: string;
      data: Record<string, unknown>;
    };
    const metadata = JSON.parse(params.data.responses as string) as Record<string, unknown>;

    expect(result).toMatchObject({ lessonId: 'lesson-1', score: 1, totalQuestions: 1 });
    expect(params.tableId).toBe('quiz_attempts');
    expect(params.data).not.toHaveProperty('lesson_id');
    expect(params.data.status).toBe('completed');
    expect(metadata).toEqual({ version: 1, kind: 'lesson_assessment', lessonId: 'lesson-1' });
    expect(metadata).not.toHaveProperty('answers');
  });

  it('allows approved teachers to read answer-bearing questions only through the server path', async () => {
    appwriteMock.isTeacherTeamMember = true;
    appwriteMock.questionRows = [makeQuestion()];

    const questions = await listTeacherQuestions('teacher-jwt');

    expect(questions[0].correct_option).toBe('A');
    const questionQuery = appwriteMock.listRows.mock.calls.find(([, params]) =>
      (params as { tableId: string }).tableId === 'questions',
    );
    expect(questionQuery?.[0]).toBe('key');
  });
});

describe('student Level Quiz question access', () => {
  it('verifies the student and published topic, fetches eligible questions with the privileged client, and omits answer keys', async () => {
    appwriteMock.questionRows = [
      makeQuestion(),
      makeQuestion({ $id: 'question-2', lesson_id: '', question_text: 'Another question?' }),
      makeQuestion({ $id: 'draft', is_published: false }),
      makeQuestion({ $id: 'wrong-topic', topic_id: 'topic-2' }),
      makeQuestion({ $id: 'wrong-level', level: 2 }),
      makeQuestion({ $id: 'bad-options', options: ['A', 'A', 'C', 'D'] }),
    ];

    const result = await startOrResumeLevel('student-jwt', 'topic-1', 1);

    expect(appwriteMock.accountGet).toHaveBeenCalledOnce();
    const questionQuery = appwriteMock.listRows.mock.calls.find(([, params]) =>
      (params as { tableId: string }).tableId === 'questions',
    );
    expect(questionQuery?.[0]).toBe('key');
    const allQuestionQueries = appwriteMock.listRows.mock.calls
      .filter(([, params]) => (params as { tableId: string }).tableId === 'questions')
      .flatMap(([, params]) => (params as { queries: string[] }).queries);
    expect(allQuestionQueries).toContain('equal:topic_id:topic-1');
    expect(allQuestionQueries).toContain('equal:level:1');
    expect(allQuestionQueries).toContain('equal:is_published:true');
    expect(result.questions).toHaveLength(2);
    expect(result.questions.every((question) => !('correct_option' in question))).toBe(true);
    expect(result.questions.every((question) => !('explanation' in question))).toBe(true);
  });

  it('does not query questions when student verification fails', async () => {
    appwriteMock.accountGet.mockRejectedValue(Object.assign(new Error('Unauthenticated'), { code: 401 }));

    await expect(startOrResumeLevel('invalid-jwt', 'topic-1', 1)).rejects.toThrow();
    expect(appwriteMock.listRows).not.toHaveBeenCalled();
    expect(appwriteMock.getRow).not.toHaveBeenCalled();
  });

  it('does not query questions for an unpublished topic', async () => {
    appwriteMock.topicPublished = false;

    await expect(startOrResumeLevel('student-jwt', 'topic-1', 1)).rejects.toThrow('This topic is not available in the level quiz.');
    expect(appwriteMock.listRows).not.toHaveBeenCalled();
  });
});

describe('written assessment response access', () => {
  it('returns only published written questions matching the requested topic and level', async () => {
    appwriteMock.questionRows = [
      makeWrittenQuestion({ $id: 'written-1', level: 2 }),
      makeWrittenQuestion({ $id: 'draft', level: 2, is_published: false }),
      makeWrittenQuestion({ $id: 'other-topic', topic_id: 'topic-2', level: 2 }),
      makeWrittenQuestion({ $id: 'other-level', level: 1 }),
      makeQuestion({ $id: 'mcq', level: 2 }),
    ];

    const result = await listTeacherAssessmentQuestions('student-jwt', 'topic-1', 2);

    expect(result.questions.map((question) => question.id)).toEqual(['written-1']);
    const questionQuery = appwriteMock.listRows.mock.calls.find(([, params]) =>
      (params as { tableId: string }).tableId === 'questions',
    );
    expect(questionQuery?.[0]).toBe('key');
  });

  it('reads only the verified student’s responses for the requested topic and questions', async () => {
    appwriteMock.responseRows = [
      makeResponse(),
      makeResponse({ $id: 'other-student-response', student_id: 'student-2' }),
      makeResponse({ $id: 'other-topic-response', topic_id: 'topic-2' }),
    ];

    const result = await getTeacherAssessmentResponses('student-jwt', 'topic-1', ['question-1']);

    expect(result).toEqual({ 'question-1': 'My answer' });
    const responseQuery = appwriteMock.listRows.mock.calls.find(([, params]) =>
      (params as { tableId: string }).tableId === 'teacher_assessment_responses',
    );
    expect(responseQuery?.[0]).toBe('key');
    expect((responseQuery?.[1] as { queries: string[] }).queries).toContain('equal:student_id:student-1');
    expect((responseQuery?.[1] as { queries: string[] }).queries).toContain('equal:topic_id:topic-1');
  });

  it('creates a separate response instead of modifying another student’s row', async () => {
    appwriteMock.questionRows = [makeWrittenQuestion({ $id: 'question-1' })];
    appwriteMock.responseRows = [makeResponse({ $id: 'student-2-response', student_id: 'student-2' })];

    const result = await saveTeacherAssessmentResponse('student-jwt', 'question-1', 'A new answer');

    expect(result).toEqual({ questionId: 'question-1', answer: 'A new answer' });
    expect(appwriteMock.createRow).toHaveBeenCalledOnce();
    expect((appwriteMock.createRow.mock.calls[0][1] as { data: Record<string, unknown> }).data.student_id).toBe('student-1');
    expect(appwriteMock.updateRow).not.toHaveBeenCalled();
    expect(appwriteMock.deleteRow).not.toHaveBeenCalled();
  });

  it('deduplicates only the verified student’s responses for the exact question', async () => {
    appwriteMock.questionRows = [makeWrittenQuestion({ $id: 'question-1' })];
    appwriteMock.responseRows = [
      makeResponse({ $id: 'own-old', updated_at: '2026-01-01T00:00:00.000Z' }),
      makeResponse({ $id: 'own-new', updated_at: '2026-02-01T00:00:00.000Z' }),
      makeResponse({ $id: 'other-student', student_id: 'student-2', updated_at: '2026-03-01T00:00:00.000Z' }),
    ];

    await saveTeacherAssessmentResponse('student-jwt', 'question-1', 'Updated answer');

    expect(appwriteMock.deleteRow).toHaveBeenCalledOnce();
    expect((appwriteMock.deleteRow.mock.calls[0][1] as { rowId: string }).rowId).toBe('own-old');
    expect(appwriteMock.updateRow).toHaveBeenCalledOnce();
    expect((appwriteMock.updateRow.mock.calls[0][1] as { rowId: string }).rowId).toBe('own-new');
  });
});