import 'server-only';

import { Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { verifyQuizTeacher } from '@/lib/server/level-quiz';

const topicsTableId = 'topics';
const lessonsTableId = 'lessons';

export type TeacherTopicInput = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  difficulty: string;
  is_published: boolean;
};

export type TeacherLessonInput = {
  topic_id: string;
  title: string;
  content: string;
  estimated_minutes: number;
  order_index: number;
  is_published: boolean;
};

export class TeacherContentError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 500;

  constructor(message: string, statusCode: TeacherContentError['statusCode']) {
    super(message);
    this.name = 'TeacherContentError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId || !apiKey) {
    throw new TeacherContentError('Server-side teacher content access is not configured.', 500);
  }
  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

async function getAuthorizedTables(jwt: string) {
  try {
    await verifyQuizTeacher(jwt);
  } catch (error) {
    const statusCode = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
    if (statusCode === 401 || statusCode === 403) {
      throw new TeacherContentError(error instanceof Error ? error.message : 'Approved teacher access is required.', statusCode);
    }
    throw new TeacherContentError('Unable to verify teacher access.', 500);
  }
  return { databaseId: appwriteConfig.databaseId, tables: getPrivilegedTables() };
}

function parseTopic(value: unknown): TeacherTopicInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TeacherContentError('Topic details are required.', 400);
  }
  const topic = value as Record<string, unknown>;
  if (
    typeof topic.title !== 'string' || !topic.title.trim() ||
    typeof topic.slug !== 'string' || !topic.slug.trim() ||
    typeof topic.description !== 'string' ||
    typeof topic.icon !== 'string' ||
    typeof topic.difficulty !== 'string' || !topic.difficulty.trim() ||
    typeof topic.is_published !== 'boolean'
  ) {
    throw new TeacherContentError('Topic details are invalid.', 400);
  }
  return {
    title: topic.title.trim(),
    slug: topic.slug.trim(),
    description: topic.description.trim(),
    icon: topic.icon.trim(),
    difficulty: topic.difficulty.trim(),
    is_published: topic.is_published,
  };
}

function parseLesson(value: unknown): TeacherLessonInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TeacherContentError('Lesson details are required.', 400);
  }
  const lesson = value as Record<string, unknown>;
  if (
    typeof lesson.topic_id !== 'string' || !lesson.topic_id.trim() ||
    typeof lesson.title !== 'string' || !lesson.title.trim() ||
    typeof lesson.content !== 'string' || !lesson.content.trim() ||
    !Number.isInteger(lesson.estimated_minutes) || (lesson.estimated_minutes as number) < 0 ||
    !Number.isInteger(lesson.order_index) || (lesson.order_index as number) < 0 ||
    typeof lesson.is_published !== 'boolean'
  ) {
    throw new TeacherContentError('Lesson details are invalid.', 400);
  }
  return {
    topic_id: lesson.topic_id.trim(),
    title: lesson.title.trim(),
    content: lesson.content.trim(),
    estimated_minutes: lesson.estimated_minutes as number,
    order_index: lesson.order_index as number,
    is_published: lesson.is_published,
  };
}

async function listRows<Row extends Models.Row>(jwt: string, tableId: string) {
  const { databaseId, tables } = await getAuthorizedTables(jwt);
  const rows: Row[] = [];
  let cursor: string | undefined;
  try {
    while (true) {
      const response = await tables.listRows<Row>({
        databaseId,
        tableId,
        queries: [Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
    return rows;
  } catch {
    throw new TeacherContentError(`Unable to list ${tableId}.`, 500);
  }
}

function sanitizeTopic(row: Models.Row & TeacherTopicInput) {
  return {
    $id: row.$id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    difficulty: row.difficulty,
    is_published: row.is_published,
  };
}

function sanitizeLesson(row: Models.Row & TeacherLessonInput) {
  return {
    $id: row.$id,
    topic_id: row.topic_id,
    title: row.title,
    content: row.content,
    estimated_minutes: row.estimated_minutes,
    order_index: row.order_index,
    is_published: row.is_published,
  };
}

export async function listTeacherTopics(jwt: string) {
  return (await listRows<Models.Row & TeacherTopicInput>(jwt, topicsTableId)).map(sanitizeTopic);
}

export async function saveTeacherTopic(jwt: string, value: unknown, topicId?: string) {
  const { databaseId, tables } = await getAuthorizedTables(jwt);
  const topic = parseTopic(value);
  try {
    if (topicId?.trim()) {
      const row = await tables.updateRow<Models.Row & TeacherTopicInput>({ databaseId, tableId: topicsTableId, rowId: topicId.trim(), data: topic });
      return sanitizeTopic(row);
    }
    const row = await tables.createRow<Models.Row & TeacherTopicInput>({ databaseId, tableId: topicsTableId, rowId: ID.unique(), data: topic });
    return sanitizeTopic(row);
  } catch (error) {
    if (getErrorCode(error) === 404) throw new TeacherContentError('Topic not found.', 404);
    throw new TeacherContentError('Unable to save topic.', 500);
  }
}

export async function deleteTeacherTopic(jwt: string, topicId: string) {
  if (!topicId.trim()) throw new TeacherContentError('A valid topic ID is required.', 400);
  const { databaseId, tables } = await getAuthorizedTables(jwt);
  try {
    await tables.deleteRow({ databaseId, tableId: topicsTableId, rowId: topicId.trim() });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new TeacherContentError('Topic not found.', 404);
    throw new TeacherContentError('Unable to delete topic.', 500);
  }
}

export async function listTeacherLessons(jwt: string) {
  return (await listRows<Models.Row & TeacherLessonInput>(jwt, lessonsTableId)).map(sanitizeLesson);
}

export async function saveTeacherLesson(jwt: string, value: unknown, lessonId?: string) {
  const { databaseId, tables } = await getAuthorizedTables(jwt);
  const lesson = parseLesson(value);
  try {
    if (lessonId?.trim()) {
      const row = await tables.updateRow<Models.Row & TeacherLessonInput>({ databaseId, tableId: lessonsTableId, rowId: lessonId.trim(), data: lesson });
      return sanitizeLesson(row);
    }
    const row = await tables.createRow<Models.Row & TeacherLessonInput>({ databaseId, tableId: lessonsTableId, rowId: ID.unique(), data: lesson });
    return sanitizeLesson(row);
  } catch (error) {
    if (getErrorCode(error) === 404) throw new TeacherContentError('Lesson not found.', 404);
    throw new TeacherContentError('Unable to save lesson.', 500);
  }
}

export async function deleteTeacherLesson(jwt: string, lessonId: string) {
  if (!lessonId.trim()) throw new TeacherContentError('A valid lesson ID is required.', 400);
  const { databaseId, tables } = await getAuthorizedTables(jwt);
  try {
    await tables.deleteRow({ databaseId, tableId: lessonsTableId, rowId: lessonId.trim() });
  } catch (error) {
    if (getErrorCode(error) === 404) throw new TeacherContentError('Lesson not found.', 404);
    throw new TeacherContentError('Unable to delete lesson.', 500);
  }
}
