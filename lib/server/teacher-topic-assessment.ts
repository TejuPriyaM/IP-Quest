import 'server-only';

import { Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { QuestionError, validateQuestionInput, type QuestionInput } from '@/lib/questions';
import { LevelQuizError, verifyQuizTeacher } from '@/lib/server/level-quiz';

const topicsTableId = 'topics';
const questionsTableId = 'questions';

type TopicData = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  difficulty: string;
  is_published: boolean;
};

type TopicRow = Models.Row & TopicData;
type AssessmentQuestionRow = Models.Row & QuestionInput;

export class TeacherTopicAssessmentError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 409 | 500;

  constructor(message: string, statusCode: TeacherTopicAssessmentError['statusCode']) {
    super(message);
    this.name = 'TeacherTopicAssessmentError';
    this.statusCode = statusCode;
  }
}

function getDatabaseId() {
  if (!appwriteConfig.databaseId || !appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new TeacherTopicAssessmentError('Appwrite is not configured for teacher assessments.', 500);
  }
  return appwriteConfig.databaseId;
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!apiKey || !appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new TeacherTopicAssessmentError('Teacher assessment saving is not configured.', 500);
  }
  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function parseTopic(value: unknown): TopicData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TeacherTopicAssessmentError('Topic details are required.', 400);
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
    throw new TeacherTopicAssessmentError('Title, slug, description, icon, difficulty, and publication status are required.', 400);
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

function parseQuestions(value: unknown, topicId: string): QuestionInput[] {
  if (!Array.isArray(value)) throw new TeacherTopicAssessmentError('Assessment questions must be a list.', 400);
  return value.map((value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new TeacherTopicAssessmentError('Assessment question details are invalid.', 400);
    }
    const item = value as Record<string, unknown>;
    const question: QuestionInput = {
      topic_id: topicId || 'pending-topic',
      lesson_id: '',
      question_text: typeof item.question_text === 'string' ? item.question_text.trim() : '',
      options: Array.isArray(item.options) && item.options.every((option) => typeof option === 'string') ? item.options as string[] : [],
      correct_option: typeof item.correct_option === 'string' ? item.correct_option.trim() : '',
      explanation: typeof item.explanation === 'string' ? item.explanation.trim() : '',
      difficulty: typeof item.difficulty === 'string' ? item.difficulty : '',
      is_published: item.is_published === true,
      level: typeof item.level === 'number' ? item.level : null,
      hint: typeof item.hint === 'string' ? item.hint.trim() : '',
    };
    try {
      validateQuestionInput(question);
    } catch (error) {
      if (error instanceof QuestionError) throw new TeacherTopicAssessmentError(error.message, 400);
      throw error;
    }
    if (!question.is_published) {
      throw new TeacherTopicAssessmentError('Publish each new assessment question before creating the topic.', 400);
    }
    return question;
  });
}

async function findExistingTopic(tablesDb: TablesDB, topicId: string, slug: string) {
  if (topicId) {
    try {
      return await tablesDb.getRow<TopicRow>({ databaseId: getDatabaseId(), tableId: topicsTableId, rowId: topicId });
    } catch (error) {
      if (getErrorCode(error) === 404) throw new TeacherTopicAssessmentError('The selected topic no longer exists.', 404);
      throw new TeacherTopicAssessmentError('Unable to load the selected topic.', 500);
    }
  }

  try {
    const matches = await tablesDb.listRows<TopicRow>({
      databaseId: getDatabaseId(),
      tableId: topicsTableId,
      queries: [Query.equal('slug', slug), Query.limit(2)],
    });
    if (matches.rows.length > 1) throw new TeacherTopicAssessmentError('More than one topic uses this slug. Resolve the duplicate before continuing.', 409);
    return matches.rows[0] ?? null;
  } catch (error) {
    if (error instanceof TeacherTopicAssessmentError) throw error;
    throw new TeacherTopicAssessmentError('Unable to check for an existing topic.', 500);
  }
}

export async function createOrUpdateTeacherTopicAssessment(jwt: string, value: unknown) {
  try {
    await verifyQuizTeacher(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new TeacherTopicAssessmentError(error.message, error.statusCode);
    }
    throw new TeacherTopicAssessmentError('Unable to verify teacher access.', 500);
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TeacherTopicAssessmentError('Topic assessment details are required.', 400);
  }
  const body = value as Record<string, unknown>;
  const topic = parseTopic(body.topic);
  const topicId = typeof body.topicId === 'string' ? body.topicId.trim() : '';
  const questions = parseQuestions(body.questions, topicId);
  const tablesDb = getPrivilegedTables();
  const existingTopic = await findExistingTopic(tablesDb, topicId, topic.slug);

  if (existingTopic && topicId && existingTopic.slug !== topic.slug) {
    const duplicate = await findExistingTopic(tablesDb, '', topic.slug);
    if (duplicate && duplicate.$id !== existingTopic.$id) {
      throw new TeacherTopicAssessmentError('Another topic already uses this slug.', 409);
    }
  }

  if (questions.length > 0 && (!topic.is_published || !getLearnModuleBySlug(topic.slug) && !getLearnModuleBySlug(topic.title))) {
    throw new TeacherTopicAssessmentError('Assessment questions require a published IP learning topic.', 400);
  }

  const existingQuestionRows = existingTopic
    ? await tablesDb.listRows<AssessmentQuestionRow>({
      databaseId: getDatabaseId(),
      tableId: questionsTableId,
      queries: [Query.equal('topic_id', existingTopic.$id), Query.equal('is_published', true), Query.limit(1)],
    }).then((result) => result.rows)
    : [];
  if (existingQuestionRows.length === 0 && questions.length === 0) {
    throw new TeacherTopicAssessmentError('Add at least one published assessment question for this topic before creating it.', 400);
  }

  const transaction = await tablesDb.createTransaction({ ttl: 60 });
  let savedTopic: TopicRow;
  try {
    if (existingTopic) {
      savedTopic = await tablesDb.updateRow<TopicRow>({
        databaseId: getDatabaseId(),
        tableId: topicsTableId,
        rowId: existingTopic.$id,
        data: topic,
        transactionId: transaction.$id,
      });
    } else {
      savedTopic = await tablesDb.createRow<TopicRow>({
        databaseId: getDatabaseId(),
        tableId: topicsTableId,
        rowId: ID.unique(),
        data: topic,
        transactionId: transaction.$id,
      });
    }

    for (const question of questions) {
      await tablesDb.createRow<AssessmentQuestionRow>({
        databaseId: getDatabaseId(),
        tableId: questionsTableId,
        rowId: ID.unique(),
        data: { ...question, topic_id: savedTopic.$id },
        transactionId: transaction.$id,
      });
    }
    await tablesDb.updateTransaction({ transactionId: transaction.$id, commit: true });
  } catch {
    try { await tablesDb.updateTransaction({ transactionId: transaction.$id, rollback: true }); } catch { /* transaction will expire if rollback cannot be acknowledged */ }
    throw new TeacherTopicAssessmentError('Unable to save the topic assessment. No changes were kept; please try again.', 500);
  }

  return { topic: savedTopic, created: !existingTopic, addedQuestionCount: questions.length };
}