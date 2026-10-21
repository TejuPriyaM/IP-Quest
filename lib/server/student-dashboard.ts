import 'server-only';

import { Client, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { getQuizPerformanceHistoryForUserId, LevelQuizError, verifyQuizStudent } from '@/lib/server/level-quiz';

const profilesTableId = 'profiles';
const progressTableId = 'progress';
const topicsTableId = 'topics';
const achievementsTableId = 'achievements';

type StudentProfile = Models.Row & {
  user_id?: string;
  display_name?: unknown;
  role?: unknown;
  total_points?: unknown;
};

type TopicProgressRow = Models.Row & {
  user_id?: string;
  topic_id?: string;
  completion_percentage?: unknown;
  best_score?: unknown;
  last_accessed_at?: unknown;
};

type TopicRow = Models.Row & {
  title?: string;
  slug?: string;
  is_published?: boolean;
};

type AchievementRow = Models.Row & {
  name?: string;
  description?: string;
  icon?: string;
  xp_reward?: number;
  requirement_type?: string;
  requirement_value?: number;
  is_active?: boolean;
};

export class StudentDashboardError extends Error {
  statusCode: 401 | 403 | 500 | 503;

  constructor(message: string, statusCode: StudentDashboardError['statusCode']) {
    super(message);
    this.name = 'StudentDashboardError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
    throw new StudentDashboardError('Appwrite endpoint, project, or database configuration is missing.', 503);
  }
  if (!apiKey) throw new StudentDashboardError('APPWRITE_QUIZ_API_KEY is not configured for dashboard reads.', 503);
  return { databaseId: appwriteConfig.databaseId, tables: new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey)) };
}

async function listRows<Row extends Models.Row>(tables: TablesDB, databaseId: string, tableId: string, queries: string[] = []) {
  const rows: Row[] = [];
  let cursor: string | undefined;
  try {
    while (true) {
      const response = await tables.listRows<Row>({
        databaseId,
        tableId,
        queries: [...queries, Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) return rows;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch {
    throw new StudentDashboardError(`Unable to load ${tableId} dashboard data.`, 500);
  }
}

function currentQuizStreakDays(completedAtValues: string[]) {
  const dates = new Set(completedAtValues.flatMap((value) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? [] : [new Date(timestamp).toISOString().slice(0, 10)];
  }));
  if (dates.size === 0) return 0;

  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  const today = cursor.toISOString().slice(0, 10);
  if (!dates.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function getStudentDashboard(jwt: string) {
  let user: Models.User<Models.Preferences>;
  try {
    user = await verifyQuizStudent(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new StudentDashboardError(error.message, error.statusCode);
    }
    throw new StudentDashboardError('Unable to verify student access.', 500);
  }

  const { databaseId, tables } = getPrivilegedTables();
  let profile: StudentProfile;
  try {
    profile = await tables.getRow<StudentProfile>({ databaseId, tableId: profilesTableId, rowId: user.$id });
  } catch {
    throw new StudentDashboardError('Unable to load the signed-in student profile.', 500);
  }
  if (profile.$id !== user.$id || profile.user_id !== user.$id || profile.role !== 'student') {
    throw new StudentDashboardError('A matching student profile is required.', 403);
  }

  const [progressRows, topicRows, achievementRows, history] = await Promise.all([
    listRows<TopicProgressRow>(tables, databaseId, progressTableId, [Query.equal('user_id', user.$id)]),
    listRows<TopicRow>(tables, databaseId, topicsTableId, [Query.equal('is_published', true)]),
    listRows<AchievementRow>(tables, databaseId, achievementsTableId, [Query.equal('is_active', true)]),
    getQuizPerformanceHistoryForUserId(user.$id, jwt),
  ]).catch((error) => {
    if (error instanceof StudentDashboardError) throw error;
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new StudentDashboardError(error.message, error.statusCode);
    }
    throw new StudentDashboardError('Unable to load current dashboard data.', 500);
  });

  const topics = new Map(topicRows
    .filter((topic) => topic.is_published === true && Boolean(getLearnModuleBySlug(topic.slug ?? topic.title ?? '')))
    .map((topic) => [topic.$id, topic.title ?? 'Learning topic']));
  const progress = progressRows.flatMap((row) => {
    if (
      row.user_id !== user.$id ||
      typeof row.topic_id !== 'string' ||
      !topics.has(row.topic_id) ||
      !Number.isInteger(row.completion_percentage) ||
      (row.completion_percentage as number) < 0 ||
      (row.completion_percentage as number) > 100
    ) return [];
    return [{
      topicId: row.topic_id,
      topicTitle: topics.get(row.topic_id) as string,
      completionPercentage: row.completion_percentage as number,
      bestScore: Number.isInteger(row.best_score) && (row.best_score as number) >= 0 ? row.best_score as number : null,
      lastAccessedAt: typeof row.last_accessed_at === 'string' ? row.last_accessed_at : null,
    }];
  });

  const quizAttempts = history.quizAttempts.map((attempt) => ({
    attemptId: attempt.attemptId,
    topicId: attempt.topicId,
    topicTitle: attempt.topicTitle,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    completedAt: attempt.completedAt,
    kind: 'quiz' as const,
  }));
  const levelAttempts = history.levelAttempts.map((attempt) => ({
    attemptId: attempt.attemptId,
    topicId: attempt.topicId,
    topicTitle: attempt.topicTitle,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    completedAt: attempt.completedAt,
    kind: 'level' as const,
    level: attempt.level,
    passed: attempt.passed,
  }));
  const teacherQuizAttempts = history.teacherQuizAttempts.map((attempt) => ({
    attemptId: attempt.attemptId,
    topicId: attempt.topicId,
    topicTitle: attempt.topicTitle,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    completedAt: attempt.completedAt,
    kind: 'teacher' as const,
    passed: attempt.passed,
  }));
  const lessonAssessments = history.lessonAssessments.map((attempt) => ({
    attemptId: attempt.attemptId,
    topicId: attempt.topicId,
    topicTitle: attempt.topicTitle,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    completedAt: attempt.completedAt,
    kind: 'assessment' as const,
    lessonId: attempt.lessonId,
    lessonTitle: attempt.lessonTitle,
  }));
  const attempts = [...quizAttempts, ...levelAttempts, ...teacherQuizAttempts, ...lessonAssessments]
    .sort((first, second) => Date.parse(second.completedAt) - Date.parse(first.completedAt));
  const averageCompletion = progress.length > 0
    ? Math.round(progress.reduce((total, row) => total + row.completionPercentage, 0) / progress.length)
    : null;
  const points = Number.isInteger(profile.total_points) && (profile.total_points as number) >= 0
    ? profile.total_points as number
    : null;
  const recommendedTopic = Array.from(topics.entries())
    .filter(([topicId]) => !progress.some((row) => row.topicId === topicId && row.completionPercentage >= 100))
    .sort((first, second) => {
      const firstCompletion = progress.find((row) => row.topicId === first[0])?.completionPercentage ?? -1;
      const secondCompletion = progress.find((row) => row.topicId === second[0])?.completionPercentage ?? -1;
      return firstCompletion - secondCompletion || first[1].localeCompare(second[1]);
    })[0];

  return {
    profile: {
      displayName: typeof profile.display_name === 'string' && profile.display_name.trim() ? profile.display_name : null,
      totalPoints: points,
    },
    progress,
    averageCompletion,
    completedTopics: progress.filter((row) => row.completionPercentage === 100).length,
    quizAttempts,
    levelAttempts,
    teacherQuizAttempts,
    lessonAssessments,
    recentAttempts: attempts.slice(0, 5),
    currentQuizStreakDays: currentQuizStreakDays(attempts.map((attempt) => attempt.completedAt)),
    recommendedTopic: recommendedTopic ? { id: recommendedTopic[0], title: recommendedTopic[1] } : null,
    achievementGoals: achievementRows.filter((achievement) => achievement.is_active === true).map((achievement) => ({
      id: achievement.$id,
      name: achievement.name ?? 'Achievement',
      description: achievement.description ?? '',
      icon: achievement.icon ?? '',
      xpReward: Number.isInteger(achievement.xp_reward) ? achievement.xp_reward as number : null,
      requirementType: achievement.requirement_type ?? '',
      requirementValue: Number.isInteger(achievement.requirement_value) ? achievement.requirement_value as number : null,
    })),
    earnedAchievements: null,
    lessonReadingCompletion: null,
  };
}