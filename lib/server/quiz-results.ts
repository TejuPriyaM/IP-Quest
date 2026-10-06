import 'server-only';

import { Client, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { LevelQuizError, verifyQuizStudent } from '@/lib/server/level-quiz';

const quizAttemptsTableId = 'quiz_attempts';

type QuizAttempt = Models.Row & {
  user_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

export type QuizResult = {
  success: true;
  attemptId: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  percentage: number;
};

export class QuizResultError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 500;

  constructor(message: string, statusCode: 400 | 401 | 403 | 404 | 500) {
    super(message);
    this.name = 'QuizResultError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getPrivilegedClient() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
    throw new QuizResultError('Server-side quiz Appwrite configuration is incomplete.', 500);
  }

  return new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(apiKey);
}

export async function getQuizResult(jwt: string, attemptId: string): Promise<QuizResult> {
  if (!jwt.trim()) {
    throw new QuizResultError('Authentication is required.', 401);
  }

  if (!attemptId.trim()) {
    throw new QuizResultError('A valid quiz attempt is required.', 400);
  }

  let user: Models.User<Models.Preferences>;
  try {
    user = await verifyQuizStudent(jwt.trim());
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new QuizResultError(error.message, error.statusCode);
    }
    throw new QuizResultError('Unable to authenticate the quiz result request.', 500);
  }

  const databaseId = appwriteConfig.databaseId;
  if (!databaseId) {
    throw new QuizResultError('Appwrite database configuration is incomplete.', 500);
  }

  let attempt: QuizAttempt;
  try {
    attempt = await new TablesDB(getPrivilegedClient()).getRow<QuizAttempt>({
      databaseId,
      tableId: quizAttemptsTableId,
      rowId: attemptId.trim(),
    });
  } catch (error) {
    if (getErrorCode(error) === 404) {
      throw new QuizResultError('Quiz result not found.', 404);
    }
    throw new QuizResultError('Unable to retrieve the quiz result.', 500);
  }

  if (attempt.user_id !== user.$id) {
    throw new QuizResultError('You are not authorized to view this quiz result.', 403);
  }

  if (
    typeof attempt.$id !== 'string' ||
    typeof attempt.topic_id !== 'string' ||
    typeof attempt.score !== 'number' ||
    typeof attempt.total_questions !== 'number' ||
    typeof attempt.completed_at !== 'string'
  ) {
    throw new QuizResultError('Quiz result data is invalid.', 500);
  }

  return {
    success: true,
    attemptId: attempt.$id,
    topicId: attempt.topic_id,
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    completedAt: attempt.completed_at,
    percentage: attempt.total_questions > 0
      ? Math.round((attempt.score / attempt.total_questions) * 100)
      : 0,
  };
}
