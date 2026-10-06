import 'server-only';

import { Client, ID, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { QuestionError, validateQuestionInput, type QuestionInput } from '@/lib/questions';
import { LevelQuizError, verifyQuizTeacher } from '@/lib/server/level-quiz';

const questionsTableId = 'questions';
const lessonsTableId = 'lessons';
const topicsTableId = 'topics';

type QuestionRow = Models.Row & QuestionInput;

export class TeacherQuestionError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 500;

  constructor(message: string, statusCode: 400 | 401 | 403 | 404 | 500) {
    super(message);
    this.name = 'TeacherQuestionError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getDatabaseId() {
  if (!appwriteConfig.databaseId || !appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new TeacherQuestionError('Appwrite is not configured for question editing.', 500);
  }
  return appwriteConfig.databaseId;
}

function getJwtTables(jwt: string) {
  const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt);
  return new TablesDB(client);
}

function parseQuestionInput(value: unknown): QuestionInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TeacherQuestionError('Invalid question details.', 400);
  }
  const input = value as Record<string, unknown>;
  if (
    typeof input.topic_id !== 'string' ||
    typeof input.question_text !== 'string' ||
    !Array.isArray(input.options) ||
    !input.options.every((option) => typeof option === 'string') ||
    typeof input.correct_option !== 'string' ||
    typeof input.explanation !== 'string' ||
    typeof input.difficulty !== 'string' ||
    typeof input.is_published !== 'boolean' ||
    (input.lesson_id !== undefined && input.lesson_id !== null && typeof input.lesson_id !== 'string') ||
    (input.level !== undefined && input.level !== null && typeof input.level !== 'number') ||
    (input.hint !== undefined && input.hint !== null && typeof input.hint !== 'string')
  ) {
    throw new TeacherQuestionError('Invalid question details.', 400);
  }

  const question: QuestionInput = {
    topic_id: input.topic_id,
    question_text: input.question_text,
    options: input.options,
    correct_option: input.correct_option,
    explanation: input.explanation,
    difficulty: input.difficulty,
    is_published: input.is_published,
    lesson_id: typeof input.lesson_id === 'string' ? input.lesson_id.trim() : '',
    ...(input.level !== undefined ? { level: input.level as number | null } : {}),
    ...(input.hint !== undefined ? { hint: input.hint as string | null } : {}),
  };
  try {
    validateQuestionInput(question);
  } catch (error) {
    if (error instanceof QuestionError) throw new TeacherQuestionError(error.message, 400);
    throw error;
  }
  return question;
}

async function verifyQuestionRelationship(jwt: string, question: QuestionInput) {
  const tablesDb = getJwtTables(jwt);
  const lessonId = question.lesson_id?.trim() ?? '';

  if (lessonId) {
    let lesson: Models.Row & { topic_id?: string };
    try {
      lesson = await tablesDb.getRow({ databaseId: getDatabaseId(), tableId: lessonsTableId, rowId: lessonId });
    } catch (error) {
      if (getErrorCode(error) === 404) throw new TeacherQuestionError('The selected lesson was not found.', 404);
      if (getErrorCode(error) === 401 || getErrorCode(error) === 403) throw new TeacherQuestionError('You do not have permission to use the selected lesson.', 403);
      throw new TeacherQuestionError('Unable to verify the selected lesson.', 500);
    }
    if (lesson.topic_id !== question.topic_id) {
      throw new TeacherQuestionError('The selected lesson must belong to the selected topic.', 400);
    }
    return;
  }

  let topic: Models.Row & { title?: string; slug?: string; is_published?: boolean };
  try {
    topic = await tablesDb.getRow({ databaseId: getDatabaseId(), tableId: topicsTableId, rowId: question.topic_id });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new TeacherQuestionError('The selected Learn Quiz topic was not found.', 404);
    if (getErrorCode(error) === 401 || getErrorCode(error) === 403) throw new TeacherQuestionError('You do not have permission to use the selected topic.', 403);
    throw new TeacherQuestionError('Unable to verify the selected Learn Quiz topic.', 500);
  }

  if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
    throw new TeacherQuestionError('Learn Quiz questions must use one of the published IP learning topics.', 400);
  }
}

async function verifyTeacher(jwt: string) {
  try {
    await verifyQuizTeacher(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new TeacherQuestionError(error.message, error.statusCode);
    }
    throw new TeacherQuestionError('Unable to verify teacher access.', 500);
  }
}

export async function createTeacherQuestion(jwt: string, value: unknown) {
  await verifyTeacher(jwt);
  const question = parseQuestionInput(value);
  await verifyQuestionRelationship(jwt, question);
  try {
    return await getJwtTables(jwt).createRow<QuestionRow>({
      databaseId: getDatabaseId(),
      tableId: questionsTableId,
      rowId: ID.unique(),
      data: question,
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 401 || code === 403) throw new TeacherQuestionError('You do not have permission to create quiz questions.', 403);
    throw new TeacherQuestionError('Unable to create the quiz question.', 500);
  }
}

export async function updateTeacherQuestion(jwt: string, questionId: string, value: unknown) {
  await verifyTeacher(jwt);
  if (!questionId.trim()) throw new TeacherQuestionError('A valid question ID is required.', 400);
  const question = parseQuestionInput(value);
  await verifyQuestionRelationship(jwt, question);
  try {
    return await getJwtTables(jwt).updateRow<QuestionRow>({
      databaseId: getDatabaseId(),
      tableId: questionsTableId,
      rowId: questionId,
      data: question,
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 404) throw new TeacherQuestionError('The question was not found.', 404);
    if (code === 401 || code === 403) throw new TeacherQuestionError('You do not have permission to update quiz questions.', 403);
    throw new TeacherQuestionError('Unable to update the quiz question.', 500);
  }
}
