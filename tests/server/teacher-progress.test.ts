import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyQuizTeacher: vi.fn(),
  getQuizPerformanceHistoryForUserId: vi.fn(),
  usersList: vi.fn(),
  profileGetRow: vi.fn(),
  assignmentListRows: vi.fn(),
  LevelQuizError: class extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
  },
}));
vi.mock('@/lib/server/level-quiz', () => ({
  getQuizPerformanceHistoryForUserId: mocks.getQuizPerformanceHistoryForUserId,
  LevelQuizError: mocks.LevelQuizError,
  verifyQuizTeacher: mocks.verifyQuizTeacher,
}));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  }
  class MockUsers {
    list(params: unknown) { return mocks.usersList(params); }
  }
  class MockTablesDB {
    getRow(params: unknown) { return mocks.profileGetRow(params); }
    listRows(params: unknown) { return mocks.assignmentListRows(params); }
  }
  return {
    Client: MockClient,
    Query: {
      equal: (key: string, value: unknown) => `equal:${key}:${String(value)}`,
      limit: (value: number) => `limit:${value}`,
      cursorAfter: (value: string) => `cursorAfter:${value}`,
    },
    TablesDB: MockTablesDB,
    Users: MockUsers,
  };
});

import { POST } from '@/app/api/teacher/progress/route';
import { LevelQuizError } from '@/lib/server/level-quiz';
import { getTeacherStudentProgress, TeacherProgressError } from '@/lib/server/teacher-progress';

const teacher = { $id: 'teacher-1', email: 'teacher@example.test' };
const student = { $id: 'student-1', email: 'student@example.test' };
const approvedAssignment = {
  $id: 'assignment-1',
  teacher_id: 'teacher-1',
  student_id: 'student-1',
  status: 'approved',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'test-api-key');
  vi.stubEnv('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID', '6ad8d25c002985fc2093');
  mocks.verifyQuizTeacher.mockResolvedValue(teacher);
  mocks.usersList.mockResolvedValue({ users: [student] });
  mocks.profileGetRow.mockResolvedValue({
    $id: student.$id,
    user_id: student.$id,
    display_name: 'Student One',
    role: 'student',
  });
  mocks.assignmentListRows.mockResolvedValue({ rows: [approvedAssignment] });
  mocks.getQuizPerformanceHistoryForUserId.mockResolvedValue({
    levelAttempts: [],
    teacherQuizAttempts: [],
    lessonAssessments: [],
  });
});

describe('teacher student progress authorization', () => {
  it('rejects unauthenticated API requests before looking up student records', async () => {
    const response = await POST(new Request('http://localhost/api/teacher/progress', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@example.test' }),
    }));

    expect(response.status).toBe(401);
    expect(mocks.verifyQuizTeacher).not.toHaveBeenCalled();
    expect(mocks.usersList).not.toHaveBeenCalled();
  });

  it('keeps unknown-student and unapproved access responses generic', async () => {
    mocks.usersList.mockResolvedValueOnce({ users: [] });
    const response = await POST(new Request('http://localhost/api/teacher/progress', {
      method: 'POST',
      headers: { Authorization: 'Bearer teacher-jwt', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe('No authorized student record was found for this teacher.');
    expect(payload).not.toHaveProperty('student');
    expect(mocks.assignmentListRows).not.toHaveBeenCalled();
    expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
  });

  it('does not perform lookup when the teacher identity or team membership is rejected', async () => {
    mocks.verifyQuizTeacher.mockRejectedValue(new LevelQuizError('Teacher team membership is required.', 403));

    await expect(getTeacherStudentProgress('invalid-teacher-jwt', 'student@example.test'))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.usersList).not.toHaveBeenCalled();
    expect(mocks.profileGetRow).not.toHaveBeenCalled();
    expect(mocks.assignmentListRows).not.toHaveBeenCalled();
  });

  it('normalizes the email and verifies that the profile belongs to a student account', async () => {
    mocks.profileGetRow.mockResolvedValueOnce({
      $id: student.$id,
      user_id: student.$id,
      display_name: 'Student One',
      role: 'teacher',
    });

    await expect(getTeacherStudentProgress('teacher-jwt', ' Student@Example.Test '))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.usersList).toHaveBeenCalledWith(expect.objectContaining({
      queries: ['equal:email:student@example.test', 'limit:2'],
    }));
    expect(mocks.assignmentListRows).not.toHaveBeenCalled();
  });

  it.each(['$id', 'user_id'] as const)(
    'rejects a student profile whose %s does not match the resolved Appwrite account',
    async (field) => {
      mocks.profileGetRow.mockResolvedValueOnce({
        $id: field === '$id' ? 'different-account-id' : student.$id,
        user_id: field === 'user_id' ? 'different-account-id' : student.$id,
        display_name: 'Mismatch',
        role: 'student',
      });

      await expect(getTeacherStudentProgress('teacher-jwt', student.email)).rejects.toMatchObject({ statusCode: 404 });
      expect(mocks.assignmentListRows).not.toHaveBeenCalled();
      expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
    },
  );

  it('fails clearly before student lookup when the assignment table ID is missing', async () => {
    vi.stubEnv('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID', '');

    await expect(getTeacherStudentProgress('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID is not configured.',
    });
    expect(mocks.usersList).not.toHaveBeenCalled();
    expect(mocks.assignmentListRows).not.toHaveBeenCalled();
  });

  it('reports the required Users API scope when Appwrite denies Users.list for scope', async () => {
    mocks.usersList.mockRejectedValue(Object.assign(new Error('not exposed'), {
      code: 401,
      type: 'general_unauthorized_scope',
    }));

    await expect(getTeacherStudentProgress('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'APPWRITE_QUIZ_API_KEY needs the users.read scope to look up a student by email.',
    });
    expect(mocks.profileGetRow).not.toHaveBeenCalled();
    expect(mocks.assignmentListRows).not.toHaveBeenCalled();
  });

  it('reports a missing server key separately from a missing assignment table', async () => {
    vi.stubEnv('APPWRITE_QUIZ_API_KEY', '');

    await expect(getTeacherStudentProgress('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'APPWRITE_QUIZ_API_KEY is not configured for server-side student lookup and progress reads.',
    });
    expect(mocks.usersList).not.toHaveBeenCalled();
  });

  it.each(['pending', 'rejected', 'revoked'])(
    'denies a %s assignment',
    async (status) => {
      mocks.assignmentListRows.mockResolvedValue({
        rows: [{ ...approvedAssignment, status }],
      });

      await expect(getTeacherStudentProgress('teacher-jwt', student.email))
        .rejects.toMatchObject({ statusCode: 404 });
      expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
    },
  );

  it('denies an approved assignment that belongs to a different teacher', async () => {
    mocks.assignmentListRows.mockResolvedValue({
      rows: [{ ...approvedAssignment, teacher_id: 'teacher-2' }],
    });

    await expect(getTeacherStudentProgress('teacher-jwt', student.email))
      .rejects.toMatchObject({ statusCode: 404 });
    const query = (mocks.assignmentListRows.mock.calls[0][0] as { queries: string[] }).queries;
    expect(query).toContain('equal:teacher_id:teacher-1');
    expect(query).toContain('equal:student_id:student-1');
    expect(query).not.toContain('equal:status:approved');
    expect((mocks.assignmentListRows.mock.calls[0][0] as { tableId: string }).tableId).toBe('6ad8d25c002985fc2093');
    expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
  });

  it.each(['revoked', 'pending', 'rejected'])(
    'fails closed when an approved row is followed by a %s row for the same pair',
    async (status) => {
      mocks.assignmentListRows.mockResolvedValue({
        rows: [
          { ...approvedAssignment, $createdAt: '2026-01-01T00:00:00.000Z' },
          { ...approvedAssignment, $id: `assignment-${status}`, status, $createdAt: '2026-02-01T00:00:00.000Z' },
        ],
      });

      await expect(getTeacherStudentProgress('teacher-jwt', student.email))
        .rejects.toMatchObject({
          statusCode: 503,
          message: 'Teacher progress is unavailable because multiple assignment records make the authoritative status ambiguous.',
        });
      expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
    },
  );

  it('returns mapped history only for an approved exact teacher-student pair', async () => {
    mocks.getQuizPerformanceHistoryForUserId.mockResolvedValueOnce({
      levelAttempts: [{
        attemptId: 'attempt-1',
        topicId: 'topic-1',
        topicTitle: 'Patent',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        completedAt: '2026-01-01T00:00:00.000Z',
        kind: 'level',
        level: 1,
        passed: true,
      }],
      teacherQuizAttempts: [],
      lessonAssessments: [],
    });

    const result = await getTeacherStudentProgress('teacher-jwt', student.email);

    expect(mocks.getQuizPerformanceHistoryForUserId).toHaveBeenCalledWith(student.$id);
    expect(result).toEqual({
      student: { displayName: 'Student One' },
      levelAttempts: [{
        attemptId: 'attempt-1',
        topicId: 'topic-1',
        topicTitle: 'Patent',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        completedAt: '2026-01-01T00:00:00.000Z',
        kind: 'level',
        level: 1,
        passed: true,
      }],
      teacherQuizAttempts: [],
      lessonAssessments: [],
    });
    expect(result).not.toHaveProperty('student.email');
  });

  it('returns an explicit unavailable error when assignment storage does not exist', async () => {
    mocks.assignmentListRows.mockRejectedValue(Object.assign(new Error('Table not found'), { code: 404 }));

    await expect(getTeacherStudentProgress('teacher-jwt', student.email))
      .rejects.toMatchObject({
        statusCode: 503,
        message: 'Teacher progress is unavailable because assignment storage is not configured.',
      });
    expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
  });

  it('explains when the configured assignment table ID is not found', async () => {
    mocks.assignmentListRows.mockRejectedValue(Object.assign(new Error('not exposed'), {
      code: 404,
      type: 'table_not_found',
    }));

    await expect(getTeacherStudentProgress('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'The configured assignment table was not found. Verify APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID and the database.',
    });
    expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
  });

  it('does not return answer fields even if a mocked mapper accidentally includes them', async () => {
    mocks.getQuizPerformanceHistoryForUserId.mockResolvedValueOnce({
      levelAttempts: [],
      teacherQuizAttempts: [],
      lessonAssessments: [],
      responses: 'private',
      selectedOption: 'A',
      correctAnswer: 'A',
    });

    const result = await getTeacherStudentProgress('teacher-jwt', student.email);

    expect(result).not.toHaveProperty('responses');
    expect(result).not.toHaveProperty('selectedOption');
    expect(result).not.toHaveProperty('correctAnswer');
  });

  it('reports storage unavailable when the assignment table is not readable', async () => {
    mocks.assignmentListRows.mockRejectedValue(Object.assign(new Error('Forbidden'), { code: 403 }));

    await expect(getTeacherStudentProgress('teacher-jwt', student.email))
      .rejects.toBeInstanceOf(TeacherProgressError);
    await expect(getTeacherStudentProgress('teacher-jwt', student.email))
      .rejects.toMatchObject({ statusCode: 503 });
  });
});
