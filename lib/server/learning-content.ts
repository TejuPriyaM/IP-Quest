import 'server-only';

import { Client, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';

const topicsTableId = 'topics';
const lessonsTableId = 'lessons';

type TopicRow = Models.Row & {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  difficulty?: string;
  is_published?: boolean;
};

type LessonRow = Models.Row & {
  topic_id: string;
  title: string;
  content: string;
  estimated_minutes: number;
  order_index: number;
  is_published: boolean;
};

export class LearningContentError extends Error {
  statusCode: 400 | 404 | 500;

  constructor(message: string, statusCode: LearningContentError['statusCode']) {
    super(message);
    this.name = 'LearningContentError';
    this.statusCode = statusCode;
  }
}

function getDatabase() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId || !apiKey) {
    throw new LearningContentError('Learning content is not configured.', 500);
  }
  return {
    databaseId: appwriteConfig.databaseId,
    tables: new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey)),
  };
}

async function listRows<Row extends Models.Row>(tableId: string, queries: string[]) {
  const { databaseId, tables } = getDatabase();
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
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
    return rows;
  } catch {
    throw new LearningContentError('Unable to load published learning content.', 500);
  }
}

async function getPublishedTopic(topicId: string) {
  const { databaseId, tables } = getDatabase();
  let topic: TopicRow;
  try {
    topic = await tables.getRow<TopicRow>({ databaseId, tableId: topicsTableId, rowId: topicId });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 404) {
      throw new LearningContentError('This topic is not available.', 404);
    }
    throw new LearningContentError('Unable to load this topic.', 500);
  }
  if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
    throw new LearningContentError('This topic is not available.', 404);
  }
  return topic;
}

export async function listPublishedTopics() {
  const rows = await listRows<TopicRow>(topicsTableId, [Query.equal('is_published', true)]);
  return rows
    .filter((topic) => topic.is_published === true && Boolean(getLearnModuleBySlug(topic.slug ?? topic.title ?? '')))
    .map((topic) => ({
      $id: topic.$id,
      title: topic.title ?? '',
      slug: topic.slug ?? '',
      description: topic.description ?? '',
      icon: topic.icon ?? '',
      difficulty: topic.difficulty ?? '',
      is_published: true,
    }));
}

export async function listPublishedLessons(topicId: string) {
  if (!topicId.trim()) throw new LearningContentError('A valid topic ID is required.', 400);
  await getPublishedTopic(topicId.trim());
  const rows = await listRows<LessonRow>(lessonsTableId, [
    Query.equal('topic_id', topicId.trim()),
    Query.equal('is_published', true),
    Query.orderAsc('order_index'),
  ]);
  return rows
    .filter((lesson) => lesson.topic_id === topicId.trim() && lesson.is_published === true)
    .map((lesson) => ({
      $id: lesson.$id,
      topic_id: lesson.topic_id,
      title: lesson.title,
      content: lesson.content,
      estimated_minutes: lesson.estimated_minutes,
      order_index: lesson.order_index,
      is_published: true,
    }));
}

export async function getPublishedLesson(lessonId: string) {
  if (!lessonId.trim()) throw new LearningContentError('A valid lesson ID is required.', 400);
  const { databaseId, tables } = getDatabase();
  let lesson: LessonRow;
  try {
    lesson = await tables.getRow<LessonRow>({ databaseId, tableId: lessonsTableId, rowId: lessonId.trim() });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 404) {
      throw new LearningContentError('This lesson is not available.', 404);
    }
    throw new LearningContentError('Unable to load this lesson.', 500);
  }
  if (lesson.is_published !== true) throw new LearningContentError('This lesson is not available.', 404);
  await getPublishedTopic(lesson.topic_id);
  return {
    $id: lesson.$id,
    topic_id: lesson.topic_id,
    title: lesson.title,
    content: lesson.content,
    estimated_minutes: lesson.estimated_minutes,
    order_index: lesson.order_index,
    is_published: true,
  };
}
