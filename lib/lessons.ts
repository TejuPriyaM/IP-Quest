import { ID, Query, TablesDB, type Models } from 'appwrite';
import { getAppwriteClient, getAppwriteDatabaseId } from '@/lib/appwrite';

export const lessonsTableId = 'lessons';

export type Lesson = {
	$id: string;
	topic_id: string;
	title: string;
	content: string;
	estimated_minutes: number;
	order_index: number;
	is_published: boolean;
};

export type LessonInput = Omit<Lesson, '$id'>;

type LessonRow = Models.Row & Lesson;

export class LessonError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'LessonError';
	}
}

function getTablesDb() {
	const client = getAppwriteClient();
	const databaseId = getAppwriteDatabaseId();

	if (!client || !databaseId) {
		throw new LessonError('Lesson storage is not configured yet. Please try again later.');
	}

	return { databaseId, tablesDb: new TablesDB(client) };
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getOperationError(error: unknown, operation: 'load' | 'create' | 'update' | 'delete') {
	if (error instanceof LessonError) {
		return error;
	}

	const code = getErrorCode(error);
	if (code === 401 || code === 403) {
		const operationLabel = operation === 'load' ? 'Read' : operation[0].toUpperCase() + operation.slice(1);
		return new LessonError(`${operationLabel} permission is not enabled for the lessons table. Configure the appropriate Appwrite permission.`);
	}

	return new LessonError(`Unable to ${operation} lessons. Please try again.`);
}

export async function listLessons(): Promise<Lesson[]> {
	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<LessonRow>({ databaseId, tableId: lessonsTableId });

		return response.rows;
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function getLesson(id: string): Promise<Lesson> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.getRow<LessonRow>({
			databaseId,
			tableId: lessonsTableId,
			rowId: id,
		});
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function listLessonsByTopic(topicId: string): Promise<Lesson[]> {
	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<LessonRow>({
			databaseId,
			tableId: lessonsTableId,
			queries: [Query.equal('topic_id', topicId), Query.orderAsc('order_index')],
		});

		return response.rows;
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function createLesson(data: LessonInput): Promise<Lesson> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.createRow<LessonRow>({
			databaseId,
			tableId: lessonsTableId,
			rowId: ID.unique(),
			data,
		});
	} catch (error) {
		throw getOperationError(error, 'create');
	}
}

export async function updateLesson(id: string, data: LessonInput): Promise<Lesson> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.updateRow<LessonRow>({
			databaseId,
			tableId: lessonsTableId,
			rowId: id,
			data,
		});
	} catch (error) {
		throw getOperationError(error, 'update');
	}
}

export async function deleteLesson(id: string): Promise<void> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		await tablesDb.deleteRow({
			databaseId,
			tableId: lessonsTableId,
			rowId: id,
		});
	} catch (error) {
		throw getOperationError(error, 'delete');
	}
}
