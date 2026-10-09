import { Query, TablesDB, type Models } from 'appwrite';
import { createCurrentUserJWT } from '@/lib/auth';
import { getAppwriteClient, getAppwriteDatabaseId } from '@/lib/appwrite';

export const questionsTableId = 'questions';

export type Question = {
	$id: string;
	topic_id: string;
	lesson_id?: string | null;
	options: string[];
	correct_option: string;
	explanation: string;
	difficulty: string;
	is_published: boolean;
	question_text: string;
	level?: number | null;
	hint?: string | null;
};

export type QuestionInput = Omit<Question, '$id'>;
export type QuestionKind = 'learn-level' | 'teacher-quiz' | 'lesson-assessment' | 'teacher-assessment';

type QuestionRow = Models.Row & Question;

export class QuestionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'QuestionError';
	}
}

function getTablesDb() {
	const client = getAppwriteClient();
	const databaseId = getAppwriteDatabaseId();

	if (!client || !databaseId) {
		throw new QuestionError('Question storage is not configured yet. Please try again later.');
	}

	return { databaseId, tablesDb: new TablesDB(client) };
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getOperationError(error: unknown, operation: 'list' | 'get' | 'create' | 'update' | 'delete') {
	if (error instanceof QuestionError) {
		return error;
	}

	const code = getErrorCode(error);
	if (code === 401 || code === 403) {
		const operationLabel = operation === 'list' ? 'List' : operation[0].toUpperCase() + operation.slice(1);
		return new QuestionError(`${operationLabel} permission denied for the questions table (${code}). Configure the appropriate Appwrite permission.`);
	}

	return new QuestionError(`Unable to ${operation} question${operation === 'list' ? 's' : ''}. Please try again.`);
}

export function validateQuestionInput(data: QuestionInput, kind?: QuestionKind) {
	if (typeof data.topic_id !== 'string' || !data.topic_id.trim()) {
		throw new QuestionError('Question topic_id must be a non-empty string.');
	}

	if (data.lesson_id !== undefined && data.lesson_id !== null && (typeof data.lesson_id !== 'string' || data.lesson_id.length > 36)) {
		throw new QuestionError('Question lesson_id must be a valid lesson ID.');
	}

	const lessonId = typeof data.lesson_id === 'string' ? data.lesson_id.trim() : '';
	const questionKind = kind ?? (lessonId ? 'lesson-assessment' : 'learn-level');
	if (lessonId && data.level !== undefined && data.level !== null) {
		throw new QuestionError('Lesson assessment questions cannot be assigned to a Learn Quiz level.');
	}
	if (questionKind === 'teacher-quiz' && (lessonId || (data.level !== undefined && data.level !== null))) {
		throw new QuestionError('Teacher Quiz questions cannot be assigned to a lesson or level.');
	}
	if (questionKind === 'lesson-assessment' && !lessonId) {
		throw new QuestionError('Lesson assessment questions must be assigned to a lesson.');
	}
	if (questionKind === 'teacher-assessment' && (lessonId || !Number.isInteger(data.level) || (data.level as number) < 1 || (data.level as number) > 3)) {
		throw new QuestionError('Teacher assessment questions must be assigned to Level 1, 2, or 3 without a lesson.');
	}
	if (questionKind === 'learn-level' && !lessonId && (!Number.isInteger(data.level) || (data.level as number) < 1 || (data.level as number) > 3)) {
		throw new QuestionError('Learn Quiz questions must be assigned to Level 1, 2, or 3.');
	}

	if (typeof data.question_text !== 'string' || !data.question_text.trim()) {
		throw new QuestionError('Question question_text must be a non-empty string.');
	}

	if (!Array.isArray(data.options)) {
		throw new QuestionError('Question options must be an array.');
	}

	if (questionKind === 'teacher-assessment') {
		if (data.options.length !== 0) {
			throw new QuestionError('Teacher assessment questions are written-answer questions and do not use MCQ options.');
		}
		if (typeof data.correct_option !== 'string' || data.correct_option.trim()) {
			throw new QuestionError('Teacher assessment questions should not require a correct option.');
		}
	} else {
		if (data.options.length !== 4 || data.options.some((option) => typeof option !== 'string' || !option.trim())) {
			throw new QuestionError('A quiz question must have exactly four non-empty answer options.');
		}
		const normalizedOptions = data.options.map((option) => option.trim().toLocaleLowerCase());
		if (new Set(normalizedOptions).size !== 4) {
			throw new QuestionError('Answer options must be distinct.');
		}
		if (typeof data.correct_option !== 'string' || !data.options.some((option) => option.trim() === data.correct_option.trim())) {
			throw new QuestionError('The correct answer must match one of the four options.');
		}
	}

	if (typeof data.explanation !== 'string') {
		throw new QuestionError('Question explanation must be a string.');
	}

	if (typeof data.difficulty !== 'string' || !data.difficulty.trim()) {
		throw new QuestionError('Question difficulty must be a non-empty string.');
	}

	if (typeof data.is_published !== 'boolean') {
		throw new QuestionError('Question is_published must be a boolean.');
	}

	if (data.level !== undefined && data.level !== null && (!Number.isInteger(data.level) || data.level < 1 || data.level > 3)) {
		throw new QuestionError('Question level must be 1, 2, or 3.');
	}

	if (data.hint !== undefined && data.hint !== null && (typeof data.hint !== 'string' || data.hint.length > 500)) {
		throw new QuestionError('Question hint must be 500 characters or fewer.');
	}
}

function validateQuestionId(id: string) {
	if (typeof id !== 'string' || !id.trim()) {
		throw new QuestionError('A valid question ID is required.');
	}
}

async function saveQuestion(method: 'POST' | 'PATCH', body: Record<string, unknown>, operation: 'create' | 'update'): Promise<Question> {
	try {
		const jwt = await createCurrentUserJWT();
		const response = await fetch('/api/teacher/questions', {
			method,
			headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok) {
			const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
				? payload.error
				: `Unable to ${operation} question. Please try again.`;
			throw new QuestionError(message);
		}
		if (typeof payload !== 'object' || payload === null || !('$id' in payload) || typeof payload.$id !== 'string') {
			throw new QuestionError('The saved question response was invalid.');
		}
		return payload as Question;
	} catch (error) {
		if (error instanceof QuestionError) throw error;
		throw getOperationError(error, operation);
	}
}

export async function listQuestions(): Promise<Question[]> {
	try {
		const { databaseId, tablesDb } = getTablesDb();
		const questions: Question[] = [];
		let cursor: string | undefined;

		while (true) {
			const response = await tablesDb.listRows<QuestionRow>({
				databaseId,
				tableId: questionsTableId,
				queries: [Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
			});
			questions.push(...response.rows);
			if (response.rows.length < 100) break;
			cursor = response.rows[response.rows.length - 1].$id;
		}

		return questions;
	} catch (error) {
		throw getOperationError(error, 'list');
	}
}

export async function getQuestion(id: string): Promise<Question> {
	validateQuestionId(id);

	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.getRow<QuestionRow>({
			databaseId,
			tableId: questionsTableId,
			rowId: id,
		});
	} catch (error) {
		throw getOperationError(error, 'get');
	}
}

export async function listQuestionsByTopic(topicId: string): Promise<Question[]> {
	if (typeof topicId !== 'string' || !topicId.trim()) {
		throw new QuestionError('A valid topic ID is required.');
	}

	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<QuestionRow>({
			databaseId,
			tableId: questionsTableId,
			queries: [Query.equal('topic_id', topicId)],
		});

		return response.rows;
	} catch (error) {
		throw getOperationError(error, 'list');
	}
}

export async function listPublishedQuestionsByTopic(topicId: string): Promise<Question[]> {
	if (typeof topicId !== 'string' || !topicId.trim()) {
		throw new QuestionError('A valid topic ID is required.');
	}

	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<QuestionRow>({
			databaseId,
			tableId: questionsTableId,
			queries: [Query.equal('topic_id', topicId), Query.equal('is_published', true)],
		});

		return response.rows;
	} catch (error) {
		throw getOperationError(error, 'list');
	}
}

export async function createQuestion(data: QuestionInput, kind?: QuestionKind): Promise<Question> {
	validateQuestionInput(data, kind);
	return saveQuestion('POST', { question: data, ...(kind ? { kind } : {}) }, 'create');
}

export async function updateQuestion(id: string, data: QuestionInput, kind?: QuestionKind): Promise<Question> {
	validateQuestionId(id);
	validateQuestionInput(data, kind);
	return saveQuestion('PATCH', { questionId: id, question: data, ...(kind ? { kind } : {}) }, 'update');
}

export async function deleteQuestion(id: string): Promise<void> {
	validateQuestionId(id);

	try {
		const jwt = await createCurrentUserJWT();
		const response = await fetch('/api/teacher/questions', {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ questionId: id }),
		});
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok) {
			const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
				? payload.error
				: 'Unable to delete question. Please try again.';
			throw new QuestionError(message);
		}
	} catch (error) {
		throw getOperationError(error, 'delete');
	}
}
