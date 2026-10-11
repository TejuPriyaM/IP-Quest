import 'server-only';

import { Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { verifyQuizStudent } from '@/lib/server/level-quiz';

const topicsTableId = 'topics';
const questionsTableId = 'questions';
const assessmentResponsesTableId = 'teacher_assessment_responses';

type TopicRow = Models.Row & {
  title?: string;
  slug?: string;
  description?: string;
  is_published?: boolean;
};

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

type AssessmentResponseRow = Models.Row & {
  student_id: string;
  question_id: string;
  topic_id: string;
  level: number;
  answer: string;
  created_at: string;
  updated_at: string;
};

export class TeacherAssessmentResponseError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 409 | 500;

  constructor(message: string, statusCode: TeacherAssessmentResponseError['statusCode']) {
    super(message);
    this.name = 'TeacherAssessmentResponseError';
    this.statusCode = statusCode;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getDatabaseId() {
  if (!appwriteConfig.databaseId || !appwriteConfig.endpoint || !appwriteConfig.projectId) {
    throw new TeacherAssessmentResponseError('Appwrite is not configured for written assessment responses.', 500);
  }
  return appwriteConfig.databaseId;
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
    throw new TeacherAssessmentResponseError('Server-side Appwrite configuration is incomplete.', 500);
  }

  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
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
  } catch (error) {
    throw new TeacherAssessmentResponseError(`Unable to load data from ${tableId}.`, 500);
  }

  return rows;
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
    if (getErrorCode(error) === 404) throw new TeacherAssessmentResponseError('This learning topic is not available.', 404);
    throw new TeacherAssessmentResponseError('Unable to load the learning topic.', 500);
  }

  if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
    throw new TeacherAssessmentResponseError('This learning topic is not available.', 404);
  }

  return topic;
}

function isTeacherAssessmentQuestion(question: Partial<QuestionRow>) {
  if (!question || typeof question.topic_id !== 'string' || !question.topic_id.trim()) return false;
  if (!Number.isInteger(question.level) || (question.level as number) < 1 || (question.level as number) > 3) return false;
  if (!Array.isArray(question.options) || question.options.length !== 0) return false;
  if (question.lesson_id !== undefined && question.lesson_id !== null && String(question.lesson_id).trim() !== '') return false;
  if (question.is_published !== true) return false;
  if (typeof question.correct_option === 'string' && question.correct_option.trim()) return false;
  return true;
}

async function getPublishedTeacherAssessmentQuestions(topicId: string, level?: number) {
  const rows = await listRows<QuestionRow>(questionsTableId, [Query.equal('topic_id', topicId), Query.equal('is_published', true)]);
  const filtered = rows.filter((question) => {
    if (question.topic_id !== topicId || question.is_published !== true) return false;
    if (level !== undefined && question.level !== level) return false;
    if (question.level === undefined || question.level === null || !Number.isInteger(question.level)) return false;
    if ((question.lesson_id ?? '').trim()) return false;
    if (!Array.isArray(question.options) || question.options.length !== 0) return false;
    if (typeof question.correct_option === 'string' && question.correct_option.trim()) return false;
    return true;
  });

  filtered.sort((first, second) => (first.level ?? 0) - (second.level ?? 0) || first.question_text.localeCompare(second.question_text));
  return filtered;
}

async function getQuestionById(questionId: string) {
  try {
    const question = await getPrivilegedTables().getRow<QuestionRow>({
      databaseId: getDatabaseId(),
      tableId: questionsTableId,
      rowId: questionId,
    });
    if (!isTeacherAssessmentQuestion(question)) {
      throw new TeacherAssessmentResponseError('The selected written assessment question is not available.', 404);
    }
    return question;
  } catch (error) {
    if (error instanceof TeacherAssessmentResponseError) throw error;
    if (getErrorCode(error) === 404) throw new TeacherAssessmentResponseError('The selected written assessment question is not available.', 404);
    throw new TeacherAssessmentResponseError('Unable to load the selected question.', 500);
  }
}

export async function listTeacherAssessmentQuestions(jwt: string, topicId: string, level?: number) {
  await verifyQuizStudent(jwt);
  await getVerifiedTopic(topicId);

  const questions = await getPublishedTeacherAssessmentQuestions(topicId, level);
  return {
    questions: questions.map((question) => ({
      id: question.$id,
      topic_id: question.topic_id,
      level: question.level as number,
      question_text: question.question_text,
      difficulty: question.difficulty,
    })),
  };
}

export async function getTeacherAssessmentResponses(jwt: string, topicId: string, questionIds: string[]) {
  const user = await verifyQuizStudent(jwt);
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return {} as Record<string, string>;
  }

  const tablesDb = getPrivilegedTables();
  const rows: AssessmentResponseRow[] = [];
  let cursor: string | undefined;
  try {
    while (true) {
      const response = await tablesDb.listRows<AssessmentResponseRow>({
        databaseId: getDatabaseId(),
        tableId: assessmentResponsesTableId,
        queries: [
          Query.equal('student_id', user.$id),
          Query.equal('topic_id', topicId),
          Query.limit(100),
          ...(cursor ? [Query.cursorAfter(cursor)] : []),
        ],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch {
    throw new TeacherAssessmentResponseError('Unable to load saved written answers.', 500);
  }

  return rows.reduce<Record<string, string>>((answers, row) => {
    if (row.student_id === user.$id && row.topic_id === topicId && questionIds.includes(row.question_id)) {
      answers[row.question_id] = row.answer;
    }
    return answers;
  }, {});
}

export async function saveTeacherAssessmentResponse(jwt: string, questionId: string, answer: string) {
  const user = await verifyQuizStudent(jwt);
  const trimmedAnswer = typeof answer === 'string' ? answer.trim() : '';
  const targetQuestionId = questionId.trim();
  if (!targetQuestionId || !trimmedAnswer) {
    throw new TeacherAssessmentResponseError('A question and answer are required.', 400);
  }

  const question = await getQuestionById(targetQuestionId);
  const tablesDb = getPrivilegedTables();
  const existingRows: AssessmentResponseRow[] = [];
  let cursor: string | undefined;
  try {
    while (true) {
      const existingResponse = await tablesDb.listRows<AssessmentResponseRow>({
        databaseId: getDatabaseId(),
        tableId: assessmentResponsesTableId,
        queries: [
          Query.equal('student_id', user.$id),
          Query.equal('question_id', targetQuestionId),
          Query.limit(100),
          ...(cursor ? [Query.cursorAfter(cursor)] : []),
        ],
      });
      existingRows.push(...existingResponse.rows.filter((row) => row.student_id === user.$id && row.question_id === targetQuestionId));
      if (existingResponse.rows.length < 100) break;
      cursor = existingResponse.rows[existingResponse.rows.length - 1].$id;
    }
  } catch {
    throw new TeacherAssessmentResponseError('Unable to load the saved written answer.', 500);
  }

  const now = new Date().toISOString();
  if (existingRows.length === 0) {
    const created = await tablesDb.createRow<AssessmentResponseRow>({
      databaseId: getDatabaseId(),
      tableId: assessmentResponsesTableId,
      rowId: ID.unique(),
      data: {
        student_id: user.$id,
        question_id: targetQuestionId,
        topic_id: question.topic_id,
        level: Number(question.level),
        answer: trimmedAnswer,
        created_at: now,
        updated_at: now,
      },
    });

    return { questionId: targetQuestionId, answer: created.answer };
  }

  const orderedRows = [...existingRows].sort((first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime());
  const primary = orderedRows[0];
  const duplicates = orderedRows.slice(1);

  for (const duplicate of duplicates) {
    if (duplicate.student_id !== user.$id || duplicate.question_id !== targetQuestionId) continue;
    await tablesDb.deleteRow({
      databaseId: getDatabaseId(),
      tableId: assessmentResponsesTableId,
      rowId: duplicate.$id,
    });
  }

  const updated = await tablesDb.updateRow<AssessmentResponseRow>({
    databaseId: getDatabaseId(),
    tableId: assessmentResponsesTableId,
    rowId: primary.$id,
    data: {
      ...primary,
      student_id: user.$id,
      question_id: targetQuestionId,
      topic_id: question.topic_id,
      level: Number(question.level),
      answer: trimmedAnswer,
      updated_at: now,
    },
  });

  return { questionId: targetQuestionId, answer: updated.answer };
}
