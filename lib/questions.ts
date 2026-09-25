import { ID, Query, TablesDB, type Models } from 'appwrite';
import { getAppwriteClient, getAppwriteDatabaseId } from '@/lib/appwrite';

export const questionsTableId = 'questions';

export type Question = {
	$id: string;
	topic_id: string;
	options: string[];
	correct_option: string;
	explanation: string;
	difficulty: string;
	is_published: boolean;
	question_text: string;
};

export type QuestionInput = Omit<Question, '$id'>;

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

function validateQuestionInput(data: QuestionInput) {
	if (typeof data.topic_id !== 'string' || !data.topic_id.trim()) {
		throw new QuestionError('Question topic_id must be a non-empty string.');
	}

	if (typeof data.question_text !== 'string' || !data.question_text.trim()) {
		throw new QuestionError('Question question_text must be a non-empty string.');
	}

	if (!Array.isArray(data.options) || data.options.length === 0 || data.options.some((option) => typeof option !== 'string')) {
		throw new QuestionError('Question options must be a non-empty string array.');
	}

	if (typeof data.correct_option !== 'string' || !data.correct_option.trim()) {
		throw new QuestionError('Question correct_option must be a non-empty string.');
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
}

function validateQuestionId(id: string) {
	if (typeof id !== 'string' || !id.trim()) {
		throw new QuestionError('A valid question ID is required.');
	}
}

export async function listQuestions(): Promise<Question[]> {
	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<QuestionRow>({ databaseId, tableId: questionsTableId });

		return response.rows;
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

export async function createQuestion(data: QuestionInput): Promise<Question> {
	validateQuestionInput(data);

	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.createRow<QuestionRow>({
			databaseId,
			tableId: questionsTableId,
			rowId: ID.unique(),
			data,
		});
	} catch (error) {
		throw getOperationError(error, 'create');
	}
}

export async function updateQuestion(id: string, data: QuestionInput): Promise<Question> {
	validateQuestionId(id);
	validateQuestionInput(data);

	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.updateRow<QuestionRow>({
			databaseId,
			tableId: questionsTableId,
			rowId: id,
			data,
		});
	} catch (error) {
		throw getOperationError(error, 'update');
	}
}

export async function deleteQuestion(id: string): Promise<void> {
	validateQuestionId(id);

	try {
		const { databaseId, tablesDb } = getTablesDb();

		await tablesDb.deleteRow({
			databaseId,
			tableId: questionsTableId,
			rowId: id,
		});
	} catch (error) {
		throw getOperationError(error, 'delete');
	}
}
