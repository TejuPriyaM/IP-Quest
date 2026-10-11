import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const appwriteMock = vi.hoisted(() => ({
  accountGet: vi.fn(),
  listRows: vi.fn(),
  getRow: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn(),
  questionRows: [] as Array<Record<string, unknown>>,
  responseRows: [] as Array<Record<string, unknown>>,
  topicPublished: true,
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
    },
    TablesDB: MockTablesDB,
  };
});

import { startOrResumeLevel } from '@/lib/server/level-quiz';
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
  appwriteMock.responseRows = [];
  appwriteMock.topicPublished = true;
  appwriteMock.accountGet.mockResolvedValue({ $id: 'student-1' });
  appwriteMock.getRow.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { tableId: string; rowId: string };
    if (params.tableId === 'profiles') return { $id: 'student-1', role: 'student' };
    if (params.tableId === 'topics') {
      return { $id: 'topic-1', title: 'Patent', slug: 'patent', is_published: appwriteMock.topicPublished };
    }
    if (params.tableId === 'questions') {
      const question = appwriteMock.questionRows.find((row) => row.$id === params.rowId);
      if (question) return question;
    }
    throw new Error('Mock row not found');
  });
  appwriteMock.listRows.mockImplementation(async (_authMode: string, rawParams: unknown) => {
    const params = rawParams as { tableId: string; queries: string[] };
    if (params.tableId === 'quiz_attempts') return { rows: [] };
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