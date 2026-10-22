import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyTeacher: vi.fn(),
  listRows: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn(),
}));


vi.mock('server-only', () => ({}));
vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'project-test',
    databaseId: 'database-test',
  },
}));
vi.mock('@/lib/server/level-quiz', () => ({ verifyQuizTeacher: mocks.verifyTeacher }));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  }
  class MockTablesDB {
    listRows(params: unknown) { return mocks.listRows(params); }
    createRow(params: unknown) { return mocks.createRow(params); }
    updateRow(params: unknown) { return mocks.updateRow(params); }
    deleteRow(params: unknown) { return mocks.deleteRow(params); }
  }
  return {
    Client: MockClient,
    ID: { unique: () => 'generated-id' },
    Query: {
      limit: (limit: number) => `limit:${limit}`,
      cursorAfter: (id: string) => `cursor:${id}`,
    },
    TablesDB: MockTablesDB,
  };
});

import {
  deleteTeacherLesson,
  deleteTeacherTopic,
  listTeacherLessons,
  listTeacherTopics,
  saveTeacherLesson,
  saveTeacherTopic,
} from '@/lib/server/teacher-content';

const topic = {
  title: 'Copyright',
  slug: 'copyright',
  description: 'Learn copyright basics.',
  icon: 'C',
  difficulty: 'Beginner',
  is_published: true,
};

const lesson = {
  topic_id: 'topic-1',
  title: 'Original works',
  content: 'Lesson content.',
  estimated_minutes: 10,
  order_index: 1,
  is_published: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'test-key');
  mocks.verifyTeacher.mockResolvedValue({ $id: 'approved-teacher' });
  mocks.listRows.mockResolvedValue({ rows: [{ $id: 'row-1' }] });
  mocks.createRow.mockImplementation(async (params: { rowId: string; data: unknown }) => ({ $id: params.rowId, ...params.data as object }));
  mocks.updateRow.mockImplementation(async (params: { rowId: string; data: unknown }) => ({ $id: params.rowId, ...params.data as object }));
  mocks.deleteRow.mockResolvedValue({});
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('teacher content authorization', () => {
  it('blocks unapproved topic reads before Appwrite access', async () => {
    mocks.verifyTeacher.mockRejectedValue(Object.assign(new Error('Approved teacher access is required.'), { statusCode: 403 }));

    await expect(listTeacherTopics('student-jwt')).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.listRows).not.toHaveBeenCalled();
  });

  it('blocks unapproved lesson writes before Appwrite access', async () => {
    mocks.verifyTeacher.mockRejectedValue(Object.assign(new Error('Approved teacher access is required.'), { statusCode: 403 }));

    await expect(saveTeacherLesson('student-jwt', lesson)).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('allows approved teachers to read topic and lesson data', async () => {
    await expect(listTeacherTopics('teacher-jwt')).resolves.toEqual([{ $id: 'row-1' }]);
    await expect(listTeacherLessons('teacher-jwt')).resolves.toEqual([{ $id: 'row-1' }]);
    expect(mocks.verifyTeacher).toHaveBeenCalledTimes(2);
    expect(mocks.listRows).toHaveBeenCalledTimes(2);
  });

  it('allows approved teachers to create, update, and delete topic and lesson records', async () => {
    await saveTeacherTopic('teacher-jwt', topic);
    await saveTeacherTopic('teacher-jwt', topic, 'topic-1');
    await deleteTeacherTopic('teacher-jwt', 'topic-1');
    await saveTeacherLesson('teacher-jwt', lesson);
    await saveTeacherLesson('teacher-jwt', lesson, 'lesson-1');
    await deleteTeacherLesson('teacher-jwt', 'lesson-1');

    expect(mocks.verifyTeacher).toHaveBeenCalledTimes(6);
    expect(mocks.createRow).toHaveBeenCalledTimes(2);
    expect(mocks.updateRow).toHaveBeenCalledTimes(2);
    expect(mocks.deleteRow).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed lesson writes even for approved teachers', async () => {
    await expect(saveTeacherLesson('teacher-jwt', { ...lesson, order_index: -1 })).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.createRow).not.toHaveBeenCalled();
  });
});
