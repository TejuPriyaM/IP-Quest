import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getStudentDashboard: vi.fn() }));

vi.mock('@/lib/server/student-dashboard', () => ({
  StudentDashboardError: class extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  getStudentDashboard: mocks.getStudentDashboard,
}));

import { GET } from '@/app/api/dashboard/route';

const dashboard = {
  profile: { displayName: 'Learner', totalPoints: 0 },
  progress: [],
  averageCompletion: null,
  completedTopics: 0,
  quizAttempts: [],
  levelAttempts: [],
  teacherQuizAttempts: [],
  lessonAssessments: [],
  recentAttempts: [],
  currentQuizStreakDays: 0,
  recommendedTopic: null,
  achievementGoals: [],
  earnedAchievements: null,
  lessonReadingCompletion: null,
};

describe('student dashboard API', () => {
  it('denies requests without a JWT before loading student records', async () => {
    const response = await GET(new Request('http://localhost/api/dashboard'));

    expect(response.status).toBe(401);
    expect(mocks.getStudentDashboard).not.toHaveBeenCalled();
  });

  it('uses only the JWT for student identity and disables caching', async () => {
    mocks.getStudentDashboard.mockResolvedValueOnce(dashboard);
    const response = await GET(new Request('http://localhost/api/dashboard?userId=forged-student', {
      headers: { Authorization: 'Bearer verified-student-jwt' },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(mocks.getStudentDashboard).toHaveBeenCalledWith('verified-student-jwt');
    expect(await response.json()).toEqual(dashboard);
  });
});
