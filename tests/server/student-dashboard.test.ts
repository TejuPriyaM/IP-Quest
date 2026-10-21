import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyQuizStudent: vi.fn(),
  getQuizPerformanceHistoryForUserId: vi.fn(),
  profileGetRow: vi.fn(),
  listRows: vi.fn(),
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
  verifyQuizStudent: mocks.verifyQuizStudent,
}));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  }
  class MockTablesDB {
    getRow(params: unknown) { return mocks.profileGetRow(params); }
    listRows(params: unknown) { return mocks.listRows(params); }
  }
  return {
    Client: MockClient,
    Query: {
      equal: (key: string, value: unknown) => `equal:${key}:${String(value)}`,
      limit: (value: number) => `limit:${value}`,
      cursorAfter: (value: string) => `cursorAfter:${value}`,
    },
    TablesDB: MockTablesDB,
  };
});

import { getStudentDashboard, StudentDashboardError } from '@/lib/server/student-dashboard';
import { LevelQuizError } from '@/lib/server/level-quiz';

const student = { $id: 'student-verified-id', email: 'private@example.test' };

function history(score = 7) {
  return {
    quizAttempts: [{
      attemptId: 'quiz-1', topicId: 'topic-patent', topicTitle: 'Patents',
      score, totalQuestions: 10, percentage: score * 10, completedAt: '2026-10-20T10:00:00.000Z',
      kind: 'quiz', responses: 'must-not-escape', selectedOption: 'A',
    }],
    levelAttempts: [],
    teacherQuizAttempts: [],
    lessonAssessments: [{
      attemptId: 'assessment-1', topicId: 'topic-patent', topicTitle: 'Patents',
      lessonId: 'lesson-1', lessonTitle: 'Patent basics', score: 0, totalQuestions: 5,
      percentage: 0, completedAt: '2026-10-20T11:00:00.000Z', kind: 'assessment', responses: 'private',
    }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'server-key-test');
  mocks.verifyQuizStudent.mockResolvedValue(student);
  mocks.profileGetRow.mockResolvedValue({
    $id: student.$id,
    user_id: student.$id,
    display_name: 'Learner',
    role: 'student',
    total_points: 125,
  });
  mocks.listRows.mockImplementation(async (params: { tableId: string; queries: string[] }) => {
    if (params.tableId === 'progress') {
      return { rows: [
        { $id: 'own-progress', user_id: student.$id, topic_id: 'topic-patent', completion_percentage: 40, best_score: 7, last_accessed_at: '2026-10-20T10:00:00.000Z' },
        { $id: 'other-progress', user_id: 'other-student', topic_id: 'topic-patent', completion_percentage: 100, best_score: 10 },
      ] };
    }
    if (params.tableId === 'topics') return { rows: [{ $id: 'topic-patent', title: 'Patents', slug: 'patent', is_published: true }] };
    if (params.tableId === 'achievements') return { rows: [{ $id: 'achievement-1', name: 'Curious Creator', description: 'Read and learn', icon: 'star', xp_reward: 20, requirement_type: 'quiz_count', requirement_value: 3, is_active: true }] };
    return { rows: [] };
  });
  mocks.getQuizPerformanceHistoryForUserId.mockImplementation(async (userId: string) => {
    if (userId !== student.$id) throw new Error('wrong account queried');
    return history();
  });
});

describe('student dashboard data', () => {
  it('derives all student data from the verified account and excludes other users and answers', async () => {
    const dashboard = await getStudentDashboard('student-jwt');

    expect(mocks.verifyQuizStudent).toHaveBeenCalledWith('student-jwt');
    expect(mocks.profileGetRow).toHaveBeenCalledWith(expect.objectContaining({ rowId: student.$id, tableId: 'profiles' }));
    const progressQuery = mocks.listRows.mock.calls.find(([params]) => (params as { tableId: string }).tableId === 'progress')?.[0] as { queries: string[] };
    expect(progressQuery.queries).toContain(`equal:user_id:${student.$id}`);
    expect(mocks.getQuizPerformanceHistoryForUserId).toHaveBeenCalledWith(student.$id, 'student-jwt');
    expect(dashboard.profile).toMatchObject({ displayName: 'Learner', totalPoints: 125 });
    expect(dashboard.progress).toEqual([expect.objectContaining({ topicId: 'topic-patent', completionPercentage: 40 })]);
    expect(dashboard.averageCompletion).toBe(40);
    expect(dashboard.lessonAssessments[0]).toMatchObject({ score: 0, percentage: 0, lessonTitle: 'Patent basics' });
    expect(dashboard.achievementGoals).toHaveLength(1);
    expect(dashboard.earnedAchievements).toBeNull();
    expect(dashboard.lessonReadingCompletion).toBeNull();
    expect(JSON.stringify(dashboard)).not.toContain('responses');
    expect(JSON.stringify(dashboard)).not.toContain('selectedOption');
    expect(JSON.stringify(dashboard)).not.toContain(student.email);
    expect(JSON.stringify(dashboard)).not.toContain('other-student');
  });

  it('returns updated database values on each request rather than retaining stale data', async () => {
    const first = await getStudentDashboard('student-jwt');
    mocks.profileGetRow.mockResolvedValueOnce({ ...await mocks.profileGetRow.mock.results[0].value, total_points: 260 });
    mocks.listRows.mockImplementationOnce(async (params: { tableId: string }) => {
      if (params.tableId === 'progress') return { rows: [{ user_id: student.$id, topic_id: 'topic-patent', completion_percentage: 80, best_score: 9 }] };
      if (params.tableId === 'topics') return { rows: [{ $id: 'topic-patent', title: 'Patents', slug: 'patent', is_published: true }] };
      return { rows: [] };
    });
    mocks.getQuizPerformanceHistoryForUserId.mockResolvedValueOnce(history(9));

    const second = await getStudentDashboard('student-jwt');

    expect(first.profile.totalPoints).toBe(125);
    expect(second.profile.totalPoints).toBe(260);
    expect(second.averageCompletion).toBe(80);
    expect(second.quizAttempts[0].score).toBe(9);
  });

  it('returns real empty values when the student has no saved progress', async () => {
    mocks.profileGetRow.mockResolvedValueOnce({ $id: student.$id, user_id: student.$id, role: 'student' });
    mocks.listRows.mockResolvedValue({ rows: [] });
    mocks.getQuizPerformanceHistoryForUserId.mockResolvedValue({ quizAttempts: [], levelAttempts: [], teacherQuizAttempts: [], lessonAssessments: [] });

    const dashboard = await getStudentDashboard('student-jwt');

    expect(dashboard.profile.totalPoints).toBeNull();
    expect(dashboard.progress).toEqual([]);
    expect(dashboard.averageCompletion).toBeNull();
    expect(dashboard.completedTopics).toBe(0);
    expect(dashboard.quizAttempts).toEqual([]);
    expect(dashboard.currentQuizStreakDays).toBe(0);
    expect(dashboard.achievementGoals).toEqual([]);
    expect(dashboard.recentAttempts).toEqual([]);
  });

  it('rejects a profile that does not match the JWT-authenticated account', async () => {
    mocks.profileGetRow.mockResolvedValueOnce({ $id: 'other-account', user_id: 'other-account', role: 'student' });

    await expect(getStudentDashboard('student-jwt')).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.listRows).not.toHaveBeenCalled();
    expect(mocks.getQuizPerformanceHistoryForUserId).not.toHaveBeenCalled();
  });

  it('does not return dummy data when a database query fails', async () => {
    mocks.listRows.mockRejectedValue(new Error('query failed'));

    await expect(getStudentDashboard('student-jwt')).rejects.toBeInstanceOf(StudentDashboardError);
  });

  it('rejects failed student authentication before reading any tables', async () => {
    mocks.verifyQuizStudent.mockRejectedValue(new LevelQuizError('Authentication failed.', 401));

    await expect(getStudentDashboard('invalid-jwt')).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.profileGetRow).not.toHaveBeenCalled();
    expect(mocks.listRows).not.toHaveBeenCalled();
  });
});
