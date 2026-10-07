import 'server-only';

import { randomInt } from 'node:crypto';
import { Account, Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { appwriteConfig } from '@/lib/appwrite';
import { QUIZ_LEVEL_COUNT, QUIZ_PASS_PERCENTAGE, QUIZ_QUESTIONS_PER_LEVEL } from '@/lib/server/quiz-config';

const questionsTableId = 'questions';
const quizAttemptsTableId = 'quiz_attempts';
const topicsTableId = 'topics';
const lessonsTableId = 'lessons';
const profilesTableId = 'profiles';

type QuestionRow = Models.Row & {
  topic_id: string;
  lesson_id?: string | null;
  question_text: string;
  options: string[];
  correct_option: string;
  explanation: string;
  difficulty: string;
  is_published: boolean;
  level?: number | null;
  hint?: string | null;
};

type StoredAnswer = {
  questionId: string;
  selectedOption: string;
  incorrectReview?: {
    questionText: string;
    correctAnswer: string;
    explanation: string;
  };
};

type AttemptResponses = {
  version: 1;
  questionIds: string[];
  answers: StoredAnswer[];
  optionOrders?: Record<string, string[]>;
  hintsById?: Record<string, string>;
};

type QuizAttempt = Models.Row & {
  user_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  lesson_id?: string | null;
  level?: number | null;
  status?: string | null;
  passed?: boolean | null;
  responses?: string | null;
};

type PerformanceHistoryEntry = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
} & (
  | { kind: 'level'; level: number; passed: boolean }
  | { kind: 'assessment'; lessonId: string; lessonTitle: string }
);

export type LevelQuizErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;

export class LevelQuizError extends Error {
  statusCode: LevelQuizErrorStatus;

  constructor(message: string, statusCode: LevelQuizErrorStatus) {
    super(message);
    this.name = 'LevelQuizError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getDevelopmentErrorDetails(error: unknown) {
  if (process.env.NODE_ENV !== 'development' || !(error instanceof Error)) return '';
  const code = getErrorCode(error);
  return ` (Appwrite${typeof code === 'number' ? ` status ${code}` : ''}: ${error.message})`;
}

function getAttemptWriteError(message: string, error: unknown) {
  const code = getErrorCode(error);
  if (code === 401 || code === 403) {
    return new LevelQuizError(`${message} Configure APPWRITE_QUIZ_API_KEY with rows.write and documents.write scopes.`, 500);
  }
  return new LevelQuizError(`${message}${getDevelopmentErrorDetails(error)}`, 500);
}

function getDatabaseId() {
  if (!appwriteConfig.databaseId) {
    throw new LevelQuizError('Appwrite database configuration is incomplete.', 500);
  }

  return appwriteConfig.databaseId;
}

function getJwtClient(jwt: string) {
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new LevelQuizError('Server-side Appwrite configuration is incomplete.', 500);
  }

  return new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt);
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
    throw new LevelQuizError('Server-side quiz Appwrite configuration is incomplete.', 500);
  }

  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

function getJwtTables(jwt: string) {
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !jwt.trim()) {
    throw new LevelQuizError('Authenticated quiz access is not available.', 401);
  }

  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt.trim()));
}

export async function verifyQuizRole(jwt: string, requiredRole: 'student' | 'teacher') {
  if (!jwt.trim()) {
    throw new LevelQuizError('Authentication is required.', 401);
  }

  let user: Models.User<Models.Preferences>;
  const jwtClient = getJwtClient(jwt.trim());
  try {
    user = await new Account(jwtClient).get();
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 401) {
      throw new LevelQuizError(`Authentication failed. Please sign in again.${getDevelopmentErrorDetails(error)}`, 401);
    }
    if (code === 403) {
      throw new LevelQuizError(`Appwrite denied account verification.${getDevelopmentErrorDetails(error)}`, 403);
    }
    throw new LevelQuizError(`Unable to authenticate the quiz request.${getDevelopmentErrorDetails(error)}`, 500);
  }

  try {
    const profile = await new TablesDB(jwtClient).getRow<Models.Row & { role?: unknown }>({
      databaseId: getDatabaseId(),
      tableId: profilesTableId,
      rowId: user.$id,
    });
    if (profile.role !== requiredRole) {
      throw new LevelQuizError(`Only ${requiredRole} accounts can use this quiz operation.`, 403);
    }
  } catch (error) {
    if (error instanceof LevelQuizError) throw error;
    if (getErrorCode(error) === 401 || getErrorCode(error) === 403) {
      throw new LevelQuizError(`Your student profile could not be verified.${getDevelopmentErrorDetails(error)}`, 403);
    }
    if (getErrorCode(error) === 404) {
      throw new LevelQuizError('A student profile is required to use quizzes.', 403);
    }
    throw new LevelQuizError(`Unable to verify your student profile.${getDevelopmentErrorDetails(error)}`, 500);
  }

  return user;
}

export async function verifyQuizStudent(jwt: string) {
  return verifyQuizRole(jwt, 'student');
}

export async function verifyQuizTeacher(jwt: string) {
  return verifyQuizRole(jwt, 'teacher');
}

function assertLevel(level: number) {
  if (!Number.isInteger(level) || level < 1 || level > QUIZ_LEVEL_COUNT) {
    throw new LevelQuizError('Choose a valid quiz level.', 400);
  }
}

function isValidQuestion(question: QuestionRow) {
  if (!Array.isArray(question.options) || question.options.length !== 4) return false;
  const options = question.options.map((option) => option.trim());
  if (options.some((option) => !option)) return false;
  if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== 4) return false;
  return options.includes(question.correct_option?.trim() ?? '');
}

function isLearnLevelQuestion(question: QuestionRow) {
  return question.lesson_id === undefined || question.lesson_id === null || question.lesson_id === '';
}

function parseResponses(value: string | null | undefined): AttemptResponses | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const candidate = parsed as Record<string, unknown>;
    if (
      candidate.version !== 1 ||
      !Array.isArray(candidate.questionIds) ||
      !candidate.questionIds.every((questionId) => typeof questionId === 'string') ||
      !Array.isArray(candidate.answers)
    ) return null;

    const answers: StoredAnswer[] = [];
    for (const answer of candidate.answers) {
      if (typeof answer !== 'object' || answer === null) return null;
      const item = answer as Record<string, unknown>;
      if (typeof item.questionId !== 'string' || typeof item.selectedOption !== 'string') return null;
      let incorrectReview: StoredAnswer['incorrectReview'];
      if (item.incorrectReview !== undefined) {
        if (typeof item.incorrectReview !== 'object' || item.incorrectReview === null) return null;
        const review = item.incorrectReview as Record<string, unknown>;
        if (typeof review.questionText !== 'string' || typeof review.correctAnswer !== 'string' || typeof review.explanation !== 'string') return null;
        incorrectReview = {
          questionText: review.questionText,
          correctAnswer: review.correctAnswer,
          explanation: review.explanation,
        };
      }
      answers.push({ questionId: item.questionId, selectedOption: item.selectedOption, ...(incorrectReview ? { incorrectReview } : {}) });
    }

    const questionIds = candidate.questionIds as string[];
    if (new Set(questionIds).size !== questionIds.length || new Set(answers.map((answer) => answer.questionId)).size !== answers.length) return null;
    if (answers.some((answer) => !questionIds.includes(answer.questionId))) return null;
    let optionOrders: Record<string, string[]> | undefined;
    if (candidate.optionOrders !== undefined) {
      if (typeof candidate.optionOrders !== 'object' || candidate.optionOrders === null || Array.isArray(candidate.optionOrders)) return null;
      const parsedOptionOrders: Record<string, string[]> = {};
      for (const [questionId, options] of Object.entries(candidate.optionOrders)) {
        if (!questionIds.includes(questionId) || !Array.isArray(options) || !options.every((option) => typeof option === 'string')) return null;
        parsedOptionOrders[questionId] = options;
      }
      optionOrders = parsedOptionOrders;
    }
    let hintsById: Record<string, string> | undefined;
    if (candidate.hintsById !== undefined) {
      if (typeof candidate.hintsById !== 'object' || candidate.hintsById === null || Array.isArray(candidate.hintsById)) return null;
      const parsedHints: Record<string, string> = {};
      for (const [questionId, hint] of Object.entries(candidate.hintsById)) {
        if (!questionIds.includes(questionId) || typeof hint !== 'string') return null;
        parsedHints[questionId] = hint;
      }
      hintsById = parsedHints;
    }
    return { version: 1, questionIds, answers, ...(optionOrders ? { optionOrders } : {}), ...(hintsById ? { hintsById } : {}) };
  } catch {
    return null;
  }
}

function serializeResponses(responses: AttemptResponses) {
  return JSON.stringify(responses);
}

async function getVerifiedTopic(topicId: string, jwt?: string) {
  if (!topicId.trim()) throw new LevelQuizError('A valid quiz topic is required.', 400);

  const tablesDb = jwt ? getJwtTables(jwt) : getPrivilegedTables();

  let topic: Models.Row & { title?: string; slug?: string; is_published?: boolean };
  try {
    topic = await tablesDb.getRow({ databaseId: getDatabaseId(), tableId: topicsTableId, rowId: topicId.trim() });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new LevelQuizError('This quiz topic is not available.', 404);
    throw new LevelQuizError('Unable to load the quiz topic.', 500);
  }

  if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
    throw new LevelQuizError('This topic is not available in the level quiz.', 404);
  }
  return topic;
}

async function getAttempt(attemptId: string, jwt?: string) {
  const tablesDb = jwt ? getJwtTables(jwt) : getPrivilegedTables();
  try {
    return await tablesDb.getRow<QuizAttempt>({
      databaseId: getDatabaseId(),
      tableId: quizAttemptsTableId,
      rowId: attemptId,
    });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new LevelQuizError('Quiz attempt not found.', 404);
    throw new LevelQuizError('Unable to load the quiz attempt.', 500);
  }
}

function assertAttemptOwner(attempt: QuizAttempt, userId: string) {
  if (attempt.user_id !== userId) throw new LevelQuizError('This quiz attempt is not available for your account.', 403);
}

async function getLevelQuestions(topicId: string, level: number, jwt?: string) {
  const tablesDb = jwt ? getJwtTables(jwt) : getPrivilegedTables();
  const databaseId = getDatabaseId();
  const rows: QuestionRow[] = [];

  try {
    for (const lessonQuery of [Query.isNull('lesson_id'), Query.equal('lesson_id', '')]) {
      let cursor: string | undefined;
      while (true) {
        const queries = [
          Query.equal('topic_id', topicId),
          Query.equal('level', level),
          Query.equal('is_published', true),
          lessonQuery,
          Query.limit(100),
          ...(cursor ? [Query.cursorAfter(cursor)] : []),
        ];
        const response = await tablesDb.listRows<QuestionRow>({ databaseId, tableId: questionsTableId, queries });
        rows.push(...response.rows);
        if (response.rows.length < 100) break;
        cursor = response.rows[response.rows.length - 1].$id;
      }
    }
  } catch {
    throw new LevelQuizError('Unable to load questions for this level.', 500);
  }

  return rows.filter((question) => isLearnLevelQuestion(question) && isValidQuestion(question));
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function sanitizeQuestion(question: QuestionRow) {
  return {
    id: question.$id,
    question: question.question_text,
    options: question.options,
    difficulty: question.difficulty,
    hint: typeof question.hint === 'string' ? question.hint : '',
  };
}

const fallbackHints = [
  'Look for the key idea in the question, then eliminate options that do not match.',
  'Compare each option with what you remember about this topic.',
  'Choose the most accurate answer, not just one that sounds related.',
];

function createQuestionPresentation(questions: QuestionRow[]) {
  const hintedQuestions = shuffle(questions).slice(0, 3);
  const shuffledFallbackHints = shuffle(fallbackHints);
  return {
    optionOrders: Object.fromEntries(questions.map((question) => [question.$id, shuffle(question.options)])),
    hintsById: Object.fromEntries(hintedQuestions.map((question, index) => [
      question.$id,
      question.hint?.trim() || shuffledFallbackHints[index % shuffledFallbackHints.length],
    ])),
  };
}

async function getAttemptRows(userId: string, topicId?: string, jwt?: string) {
  const tablesDb = jwt ? getJwtTables(jwt) : getPrivilegedTables();
  const databaseId = getDatabaseId();
  const rows: QuizAttempt[] = [];
  let cursor: string | undefined;

  try {
    while (true) {
      const queries = [
        Query.equal('user_id', userId),
        ...(topicId ? [Query.equal('topic_id', topicId)] : []),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
        ...(cursor ? [Query.cursorAfter(cursor)] : []),
      ];
      const response = await tablesDb.listRows<QuizAttempt>({ databaseId, tableId: quizAttemptsTableId, queries });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch {
    throw new LevelQuizError('Unable to load quiz progress.', 500);
  }

  return rows;
}

function passedLevels(attempts: QuizAttempt[]) {
  return new Set(attempts
    .filter((attempt) => attempt.status === 'completed' && attempt.passed === true && Number.isInteger(attempt.level))
    .map((attempt) => attempt.level as number));
}

export async function getLevelQuizProgress(jwt: string, topicId: string) {
  const user = await verifyQuizStudent(jwt);
  const topic = await getVerifiedTopic(topicId, jwt);
  const attempts = await getAttemptRows(user.$id, topicId, jwt);
  const passed = passedLevels(attempts);

  return {
    topicId,
    passPercentage: QUIZ_PASS_PERCENTAGE,
    questionsPerLevel: QUIZ_QUESTIONS_PER_LEVEL,
    levels: Array.from({ length: QUIZ_LEVEL_COUNT }, (_, index) => {
      const level = index + 1;
      const inProgress = attempts.find((attempt) => attempt.level === level && attempt.status === 'in_progress');
      return {
        level,
        passed: passed.has(level),
        unlocked: level === 1 || passed.has(level - 1),
        inProgressAttemptId: inProgress?.$id ?? null,
      };
    }),
    topicTitle: topic.title ?? 'Quiz',
  };
}

export async function getStudentPerformanceHistory(jwt: string) {
  const user = await verifyQuizStudent(jwt);
  const attempts = (await getAttemptRows(user.$id, undefined, jwt)).filter((attempt) =>
    attempt.total_questions > 0 && Number.isInteger(attempt.score) && typeof attempt.completed_at === 'string',
  );
  const topicIds = Array.from(new Set(attempts.map((attempt) => attempt.topic_id)));
  const lessonIds = Array.from(new Set(attempts.map((attempt) => attempt.lesson_id).filter((lessonId): lessonId is string => Boolean(lessonId))));
  const tablesDb = getJwtTables(jwt);

  const [topicRows, lessonRows] = await Promise.all([
    Promise.all(topicIds.map(async (topicId) => {
      try {
        return await tablesDb.getRow<Models.Row & { title?: string }>({ databaseId: getDatabaseId(), tableId: topicsTableId, rowId: topicId });
      } catch {
        return null;
      }
    })),
    Promise.all(lessonIds.map(async (lessonId) => {
      try {
        return await tablesDb.getRow<Models.Row & { title?: string }>({ databaseId: getDatabaseId(), tableId: lessonsTableId, rowId: lessonId });
      } catch {
        return null;
      }
    })),
  ]);
  const topicTitles = new Map(topicRows.filter((row): row is Models.Row & { title?: string } => row !== null).map((row) => [row.$id, row.title ?? 'Learning topic']));
  const lessonTitles = new Map(lessonRows.filter((row): row is Models.Row & { title?: string } => row !== null).map((row) => [row.$id, row.title ?? 'Lesson assessment']));

  const history = attempts.reduce<PerformanceHistoryEntry[]>((entries, attempt) => {
      if (attempt.status !== 'completed' && !attempt.lesson_id) return entries;
      const common = {
        attemptId: attempt.$id,
        topicId: attempt.topic_id,
        topicTitle: topicTitles.get(attempt.topic_id) ?? 'Learning topic',
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        completedAt: attempt.completed_at,
      };
      if (attempt.lesson_id) {
        entries.push({ ...common, kind: 'assessment', lessonId: attempt.lesson_id, lessonTitle: lessonTitles.get(attempt.lesson_id) ?? 'Lesson assessment' });
        return entries;
      }
      if (Number.isInteger(attempt.level)) {
        entries.push({ ...common, kind: 'level', level: attempt.level as number, passed: attempt.passed === true });
      }
      return entries;
    }, []).sort((first, second) => new Date(first.completedAt).getTime() - new Date(second.completedAt).getTime());

  return {
    levelAttempts: history.filter((attempt) => attempt.kind === 'level'),
    lessonAssessments: history.filter((attempt) => attempt.kind === 'assessment'),
  };
}

export async function startOrResumeLevel(jwt: string, topicId: string, level: number) {
  const user = await verifyQuizStudent(jwt);
  assertLevel(level);
  const topic = await getVerifiedTopic(topicId, jwt);
  const attempts = await getAttemptRows(user.$id, topicId, jwt);
  if (level > 1 && !passedLevels(attempts).has(level - 1)) {
    throw new LevelQuizError('Pass the previous level before starting this one.', 403);
  }

  const existing = attempts.find((attempt) => attempt.level === level && attempt.status === 'in_progress');
  let attempt: QuizAttempt;
  let responses: AttemptResponses;
  if (existing) {
    attempt = existing;
    const parsed = parseResponses(existing.responses);
    if (!parsed || parsed.questionIds.length !== QUIZ_QUESTIONS_PER_LEVEL) {
      throw new LevelQuizError('This saved attempt cannot be resumed. Please contact your teacher.', 409);
    }
    responses = parsed;
  } else {
    const candidates = await getLevelQuestions(topicId, level, jwt);
    if (candidates.length < QUIZ_QUESTIONS_PER_LEVEL) {
      throw new LevelQuizError('This level is not ready yet. More questions are being added.', 409);
    }
    const questionIds = shuffle(candidates.map((question) => question.$id)).slice(0, QUIZ_QUESTIONS_PER_LEVEL);
    const questionById = new Map(candidates.map((question) => [question.$id, question]));
    const presentation = createQuestionPresentation(questionIds.flatMap((questionId) => {
      const question = questionById.get(questionId);
      return question ? [question] : [];
    }));
    responses = { version: 1, questionIds, answers: [], ...presentation };
    try {
      attempt = await getPrivilegedTables().createRow<QuizAttempt>({
        databaseId: getDatabaseId(),
        tableId: quizAttemptsTableId,
        rowId: ID.unique(),
        data: {
          user_id: user.$id,
          topic_id: topicId,
          score: 0,
          total_questions: questionIds.length,
          completed_at: new Date().toISOString(),
          level,
          status: 'in_progress',
          passed: false,
          responses: serializeResponses(responses),
        },
      });
    } catch (error) {
      throw getAttemptWriteError('Unable to save this quiz attempt.', error);
    }
  }

  const tablesDb = getJwtTables(jwt);
  const questionRows = await Promise.all(responses.questionIds.map(async (questionId) => {
    try {
      const question = await tablesDb.getRow<QuestionRow>({ databaseId: getDatabaseId(), tableId: questionsTableId, rowId: questionId });
      if (question.topic_id !== topicId || question.level !== level || question.is_published !== true || !isLearnLevelQuestion(question) || !isValidQuestion(question)) {
        throw new LevelQuizError('A saved question is no longer available for this attempt.', 409);
      }
      return question;
    } catch (error) {
      if (error instanceof LevelQuizError) throw error;
      throw new LevelQuizError('A saved question is no longer available for this attempt.', 409);
    }
  }));
  if (!responses.optionOrders || !responses.hintsById) {
    const presentation = createQuestionPresentation(questionRows);
    responses = { ...responses, ...presentation };
    try {
      await getPrivilegedTables().updateRow<QuizAttempt>({
        databaseId: getDatabaseId(),
        tableId: quizAttemptsTableId,
        rowId: attempt.$id,
        data: { responses: serializeResponses(responses) },
      });
    } catch (error) {
      throw getAttemptWriteError('Unable to save this quiz question order. Please try again.', error);
    }
  }
  const answersById = new Map(responses.answers.map((answer) => [answer.questionId, answer]));

  return {
    attemptId: attempt.$id,
    topicId,
    topicTitle: topic.title ?? 'Quiz',
    level,
    passPercentage: QUIZ_PASS_PERCENTAGE,
    questions: questionRows.map((question) => ({
      ...sanitizeQuestion(question),
      options: responses.optionOrders?.[question.$id] ?? question.options,
      hint: responses.hintsById?.[question.$id] ?? '',
    })),
    answers: responses.answers,
    answerFeedback: responses.answers.map((answer) => {
      const question = questionRows.find((item) => item.$id === answer.questionId);
      return {
        questionId: answer.questionId,
        isCorrect: answer.selectedOption === question?.correct_option,
        explanation: question?.explanation ?? '',
        correctAnswer: answer.selectedOption === question?.correct_option ? undefined : question?.correct_option,
      };
    }),
    inProgress: attempt.status === 'in_progress',
    questionOrder: responses.questionIds,
    answersById: Object.fromEntries(responses.answers.map((answer) => [answer.questionId, answersById.get(answer.questionId)?.selectedOption ?? ''])),
  };
}

export async function submitLevelAnswer(jwt: string, attemptId: string, questionId: string, selectedOption: string) {
  const user = await verifyQuizStudent(jwt);
  if (!attemptId.trim() || !questionId.trim() || !selectedOption.trim()) {
    throw new LevelQuizError('An attempt, question, and answer are required.', 400);
  }

  const attempt = await getAttempt(attemptId.trim(), jwt);
  const tablesDb = getJwtTables(jwt);
  assertAttemptOwner(attempt, user.$id);
  if (attempt.status !== 'in_progress' || !Number.isInteger(attempt.level)) {
    throw new LevelQuizError('This attempt is no longer accepting answers.', 409);
  }
  const responses = parseResponses(attempt.responses);
  if (!responses || !responses.questionIds.includes(questionId)) {
    throw new LevelQuizError('This question is not part of the saved attempt.', 400);
  }
  if (responses.answers.some((answer) => answer.questionId === questionId)) {
    throw new LevelQuizError('An answer has already been submitted for this question.', 409);
  }
  const nextQuestionId = responses.questionIds.find((id) => !responses.answers.some((answer) => answer.questionId === id));
  if (questionId !== nextQuestionId) {
    throw new LevelQuizError('Answer the questions in order.', 400);
  }

  let question: QuestionRow;
  try {
    question = await tablesDb.getRow<QuestionRow>({ databaseId: getDatabaseId(), tableId: questionsTableId, rowId: questionId });
  } catch {
    throw new LevelQuizError('This question is no longer available.', 409);
  }
  if (question.topic_id !== attempt.topic_id || question.level !== attempt.level || question.is_published !== true || !isLearnLevelQuestion(question) || !isValidQuestion(question)) {
    throw new LevelQuizError('This question is no longer available for the attempt.', 409);
  }
  if (!question.options.includes(selectedOption)) {
    throw new LevelQuizError('Choose one of the four listed options.', 400);
  }

  const isCorrect = selectedOption === question.correct_option;
  const answer: StoredAnswer = {
    questionId,
    selectedOption,
    ...(!isCorrect ? {
      incorrectReview: {
        questionText: question.question_text,
        correctAnswer: question.correct_option,
        explanation: question.explanation ?? '',
      },
    } : {}),
  };
  const updatedResponses = { ...responses, answers: [...responses.answers, answer] };
  try {
    await getPrivilegedTables().updateRow<QuizAttempt>({
      databaseId: getDatabaseId(),
      tableId: quizAttemptsTableId,
      rowId: attempt.$id,
      data: { responses: serializeResponses(updatedResponses) },
    });
  } catch (error) {
    throw getAttemptWriteError('Unable to save your answer. Please try again.', error);
  }

  return {
    questionId,
    isCorrect,
    explanation: question.explanation ?? '',
    correctAnswer: isCorrect ? undefined : question.correct_option,
    answeredCount: updatedResponses.answers.length,
  };
}

export async function completeLevelAttempt(jwt: string, attemptId: string) {
  const user = await verifyQuizStudent(jwt);
  if (!attemptId.trim()) throw new LevelQuizError('A valid quiz attempt is required.', 400);

  const attempt = await getAttempt(attemptId.trim(), jwt);
  assertAttemptOwner(attempt, user.$id);
  if (attempt.status !== 'in_progress' || !Number.isInteger(attempt.level)) {
    throw new LevelQuizError('This attempt is already complete or invalid.', 409);
  }
  const responses = parseResponses(attempt.responses);
  if (!responses || responses.questionIds.length !== QUIZ_QUESTIONS_PER_LEVEL || responses.answers.length !== responses.questionIds.length) {
    throw new LevelQuizError('Answer every question before finishing the level.', 400);
  }

  const answerById = new Map(responses.answers.map((answer) => [answer.questionId, answer]));
  const tablesDb = getJwtTables(jwt);
  const reviewAnswers: StoredAnswer[] = [];
  let score = 0;
  for (const questionId of responses.questionIds) {
    const answer = answerById.get(questionId);
    if (!answer) throw new LevelQuizError('Answer every question before finishing the level.', 400);

    let question: QuestionRow;
    try {
      question = await tablesDb.getRow<QuestionRow>({ databaseId: getDatabaseId(), tableId: questionsTableId, rowId: questionId });
    } catch {
      throw new LevelQuizError('A question in this attempt is no longer available.', 409);
    }
    if (question.topic_id !== attempt.topic_id || question.level !== attempt.level || question.is_published !== true || !isLearnLevelQuestion(question) || !isValidQuestion(question) || !question.options.includes(answer.selectedOption)) {
      throw new LevelQuizError('A question in this attempt has changed and cannot be graded.', 409);
    }

    const isCorrect = answer.selectedOption === question.correct_option;
    if (isCorrect) score += 1;
    reviewAnswers.push({
      questionId,
      selectedOption: answer.selectedOption,
      ...(!isCorrect ? {
        incorrectReview: {
          questionText: question.question_text,
          correctAnswer: question.correct_option,
          explanation: question.explanation ?? '',
        },
      } : {}),
    });
  }

  const totalQuestions = responses.questionIds.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= QUIZ_PASS_PERCENTAGE;
  const completedAt = new Date().toISOString();
  try {
    await getPrivilegedTables().updateRow<QuizAttempt>({
      databaseId: getDatabaseId(),
      tableId: quizAttemptsTableId,
      rowId: attempt.$id,
      data: {
        score,
        total_questions: totalQuestions,
        completed_at: completedAt,
        status: 'completed',
        passed,
        responses: serializeResponses({ ...responses, answers: reviewAnswers }),
      },
    });
  } catch (error) {
    throw getAttemptWriteError('Unable to save the level result.', error);
  }

  return {
    attemptId: attempt.$id,
    topicId: attempt.topic_id,
    level: attempt.level,
    score,
    totalQuestions,
    wrong: totalQuestions - score,
    percentage,
    passed,
    completedAt,
    passPercentage: QUIZ_PASS_PERCENTAGE,
  };
}

function getMistakes(responses: AttemptResponses | null) {
  if (!responses) return [];
  const answerById = new Map(responses.answers.map((answer) => [answer.questionId, answer]));
  return responses.questionIds.flatMap((questionId) => {
    const answer = answerById.get(questionId);
    if (!answer?.incorrectReview) return [];
    return [{
      questionId,
      question: answer.incorrectReview.questionText,
      selectedAnswer: answer.selectedOption,
      correctAnswer: answer.incorrectReview.correctAnswer,
      explanation: answer.incorrectReview.explanation,
    }];
  });
}

export async function getLevelAttemptResult(jwt: string, attemptId: string) {
  const user = await verifyQuizStudent(jwt);
  const attempt = await getAttempt(attemptId, jwt);
  assertAttemptOwner(attempt, user.$id);
  if (attempt.status !== 'completed' || !Number.isInteger(attempt.level) || typeof attempt.passed !== 'boolean') {
    throw new LevelQuizError('This level result is not complete.', 409);
  }

  const responses = parseResponses(attempt.responses);
  if (!responses) throw new LevelQuizError('The saved level review is unavailable.', 500);
  return {
    attemptId: attempt.$id,
    topicId: attempt.topic_id,
    level: attempt.level,
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    wrong: Math.max(0, attempt.total_questions - attempt.score),
    percentage: attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
    passed: attempt.passed,
    completedAt: attempt.completed_at,
    passPercentage: QUIZ_PASS_PERCENTAGE,
    mistakes: getMistakes(responses),
  };
}

export async function getOverallTopicResult(jwt: string, topicId: string) {
  const user = await verifyQuizStudent(jwt);
  const topic = await getVerifiedTopic(topicId);
  const attempts = await getAttemptRows(user.$id, topicId);
  const passed = passedLevels(attempts);
  if (Array.from({ length: QUIZ_LEVEL_COUNT }, (_, index) => index + 1).some((level) => !passed.has(level))) {
    throw new LevelQuizError('Complete and pass all three levels to view the final result.', 403);
  }

  const levelResults = Array.from({ length: QUIZ_LEVEL_COUNT }, (_, index) => index + 1).map((level) => {
    const best = attempts
      .filter((attempt) => attempt.level === level && attempt.status === 'completed' && attempt.passed === true)
      .sort((first, second) => (second.score / Math.max(1, second.total_questions)) - (first.score / Math.max(1, first.total_questions)))[0];
    if (!best) throw new LevelQuizError('A completed level result is unavailable.', 500);
    const responses = parseResponses(best.responses);
    return {
      level,
      score: best.score,
      totalQuestions: best.total_questions,
      percentage: best.total_questions > 0 ? Math.round((best.score / best.total_questions) * 100) : 0,
      mistakes: getMistakes(responses),
    };
  });
  const totalQuestions = levelResults.reduce((total, result) => total + result.totalQuestions, 0);
  const score = levelResults.reduce((total, result) => total + result.score, 0);
  const weakestLevel = [...levelResults].sort((first, second) => first.percentage - second.percentage)[0];

  return {
    overall: true,
    topicId,
    topicTitle: topic.title ?? 'Quiz',
    completedLevels: QUIZ_LEVEL_COUNT,
    totalLevels: QUIZ_LEVEL_COUNT,
    score,
    totalQuestions,
    wrong: totalQuestions - score,
    percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    levelResults,
    weakestLevel: weakestLevel.level,
    mistakes: levelResults.flatMap((result) => result.mistakes.map((mistake) => ({ ...mistake, level: result.level }))),
  };
}