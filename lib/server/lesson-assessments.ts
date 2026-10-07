import 'server-only';

import { Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { LevelQuizError, verifyQuizStudent } from '@/lib/server/level-quiz';

const topicsTableId = 'topics';
const lessonsTableId = 'lessons';
const questionsTableId = 'questions';
const quizAttemptsTableId = 'quiz_attempts';

type TopicRow = Models.Row & {
  title?: string;
  slug?: string;
  description?: string;
  is_published?: boolean;
};

type LessonRow = Models.Row & {
  topic_id: string;
  title: string;
  content: string;
  estimated_minutes?: number;
  is_published: boolean;
};

type AssessmentQuestion = Models.Row & {
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

export class LessonAssessmentError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 409 | 500;

  constructor(message: string, statusCode: LessonAssessmentError['statusCode']) {
    super(message);
    this.name = 'LessonAssessmentError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getDatabaseId() {
  if (!appwriteConfig.databaseId || !appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new LessonAssessmentError('Appwrite is not configured for lesson assessments.', 500);
  }
  return appwriteConfig.databaseId;
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!apiKey) throw new LessonAssessmentError('Lesson assessments are not configured.', 500);
  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

async function verifyStudent(jwt: string) {
  try {
    return await verifyQuizStudent(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new LessonAssessmentError(error.message, error.statusCode);
    }
    throw new LessonAssessmentError('Unable to verify student access.', 500);
  }
}

async function getVerifiedTopic(topicId: string) {
  let topic: TopicRow;
  try {
    topic = await getPrivilegedTables().getRow<TopicRow>({
      databaseId: getDatabaseId(),
      tableId: topicsTableId,
      rowId: topicId,
    });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new LessonAssessmentError('This learning topic is not available.', 404);
    throw new LessonAssessmentError('Unable to load the learning topic.', 500);
  }

  if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
    throw new LessonAssessmentError('This learning topic is not available.', 404);
  }
  return topic;
}

function isValidQuestion(question: AssessmentQuestion) {
  if (!Array.isArray(question.options) || question.options.length !== 4) return false;
  const options = question.options.map((option) => option.trim());
  if (options.some((option) => !option)) return false;
  if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== 4) return false;
  return options.includes(question.correct_option?.trim() ?? '');
}

async function listRows<Row extends Models.Row>(tableId: string, queries: string[]) {
  const tablesDb = getPrivilegedTables();
  const rows: Row[] = [];
  let cursor: string | undefined;

  try {
    while (true) {
      const response = await tablesDb.listRows<Row>({
        databaseId: getDatabaseId(),
        tableId,
        queries: [...queries, Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch {
    throw new LessonAssessmentError('Unable to load lesson assessment content.', 500);
  }
  return rows;
}

async function getPublishedLesson(topicId: string, lessonId: string) {
  const topic = await getVerifiedTopic(topicId);
  let lesson: LessonRow;
  try {
    lesson = await getPrivilegedTables().getRow<LessonRow>({
      databaseId: getDatabaseId(),
      tableId: lessonsTableId,
      rowId: lessonId,
    });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new LessonAssessmentError('This lesson assessment is not available.', 404);
    throw new LessonAssessmentError('Unable to load the selected lesson.', 500);
  }

  if (lesson.is_published !== true || lesson.topic_id !== topicId) {
    throw new LessonAssessmentError('This lesson assessment is not available.', 404);
  }
  return { topic, lesson };
}

function shuffleArray<T>(items: T[]) {
  const reordered = [...items];
  for (let index = reordered.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  }
  return reordered;
}

async function getPublishedAssessmentQuestions(topicId: string, lessonId: string) {
  return (await listRows<AssessmentQuestion>(questionsTableId, [
    Query.equal('topic_id', topicId),
    Query.equal('lesson_id', lessonId),
    Query.equal('is_published', true),
  ])).filter((question) =>
    question.topic_id === topicId &&
    question.lesson_id === lessonId &&
    question.is_published === true &&
    (question.level === undefined || question.level === null) &&
    isValidQuestion(question),
  );
}

export async function listLessonAssessments(jwt: string, topicId: string) {
  await verifyStudent(jwt);
  await getVerifiedTopic(topicId);

  const lessons = await listRows<LessonRow>(lessonsTableId, [
    Query.equal('topic_id', topicId),
    Query.equal('is_published', true),
    Query.orderAsc('order_index'),
  ]);
  const assessments = [];

  for (const lesson of lessons) {
    if (lesson.topic_id !== topicId || lesson.is_published !== true) continue;
    const questions = await getPublishedAssessmentQuestions(topicId, lesson.$id);
    if (questions.length === 0) continue;
    assessments.push({ lessonId: lesson.$id, lessonTitle: lesson.title, questionCount: questions.length });
  }

  return { assessments };
}

export async function getLessonAssessment(jwt: string, topicId: string, lessonId: string) {
  await verifyStudent(jwt);
  if (!topicId.trim() || !lessonId.trim()) throw new LessonAssessmentError('A topic and lesson are required.', 400);

  const { topic, lesson } = await getPublishedLesson(topicId, lessonId);
  const questions = await getPublishedAssessmentQuestions(topicId, lessonId);
  if (questions.length === 0) throw new LessonAssessmentError('This lesson assessment has no published questions yet.', 404);

  const randomizedQuestions = shuffleArray(questions).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));

  return {
    topicId,
    topicTitle: topic.title ?? 'Learning topic',
    topicDescription: topic.description ?? '',
    lessonId: lesson.$id,
    lessonTitle: lesson.title,
    lessonContent: lesson.content,
    estimatedMinutes: lesson.estimated_minutes ?? 0,
    questions: randomizedQuestions.map((question) => ({
      id: question.$id,
      question: question.question_text,
      options: question.options,
      difficulty: question.difficulty,
    })),
  };
}

export async function submitLessonAssessment(
  jwt: string,
  topicId: string,
  lessonId: string,
  answers: Array<{ questionId: string; selectedOption: string }>,
) {
  const user = await verifyStudent(jwt);
  if (!topicId.trim() || !lessonId.trim() || !Array.isArray(answers) || answers.length === 0) {
    throw new LessonAssessmentError('A topic, lesson, and answers are required.', 400);
  }

  const { lesson } = await getPublishedLesson(topicId, lessonId);
  const questions = await getPublishedAssessmentQuestions(topicId, lessonId);
  if (questions.length === 0) throw new LessonAssessmentError('This lesson assessment has no published questions yet.', 404);

  const questionIds = new Set(questions.map((question) => question.$id));
  const answerIds = new Set<string>();
  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string' || typeof answer.selectedOption !== 'string' || !answer.selectedOption.trim()) {
      throw new LessonAssessmentError('Each answer must include a question and selected option.', 400);
    }
    if (!questionIds.has(answer.questionId) || answerIds.has(answer.questionId)) {
      throw new LessonAssessmentError('The submitted question set does not match this lesson assessment.', 400);
    }
    answerIds.add(answer.questionId);
  }
  if (answerIds.size !== questionIds.size) {
    throw new LessonAssessmentError('Answer every question before finishing the assessment.', 400);
  }

  const answerById = new Map(answers.map((answer) => [answer.questionId, answer.selectedOption]));
  let score = 0;
  const review = questions.map((question) => {
    const selectedOption = answerById.get(question.$id) ?? '';
    if (!question.options.includes(selectedOption)) {
      throw new LessonAssessmentError('Choose one of the listed options for every question.', 400);
    }
    const isCorrect = selectedOption === question.correct_option;
    if (isCorrect) score += 1;
    return {
      questionId: question.$id,
      question: question.question_text,
      selectedOption,
      isCorrect,
      correctAnswer: question.correct_option,
      explanation: question.explanation,
    };
  });

  const completedAt = new Date().toISOString();
  let attempt: Models.Row;
  try {
    attempt = await getPrivilegedTables().createRow<Models.Row & { user_id: string; topic_id: string; lesson_id: string; score: number; total_questions: number; completed_at: string }>({
      databaseId: getDatabaseId(),
      tableId: quizAttemptsTableId,
      rowId: ID.unique(),
      data: {
        user_id: user.$id,
        topic_id: topicId,
        lesson_id: lessonId,
        score,
        total_questions: questions.length,
        completed_at: completedAt,
      },
    });
  } catch {
    throw new LessonAssessmentError('Unable to save your assessment result.', 500);
  }

  return {
    attemptId: attempt.$id,
    completedAt,
    topicId,
    lessonId,
    lessonTitle: lesson.title,
    score,
    totalQuestions: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    review,
  };
}
