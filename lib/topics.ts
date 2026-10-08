import { ID, TablesDB, type Models } from 'appwrite';
import { createQuizJWT } from '@/lib/auth';
import { getAppwriteClient, getAppwriteDatabaseId } from '@/lib/appwrite';

export const topicsTableId = 'topics';

export type Topic = {
	title: string;
	slug: string;
	description: string;
	icon: string;
	difficulty: string;
	is_published: boolean;
};

export type TopicRow = Models.Row & Topic;

export class TopicError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TopicError';
	}
}

function getTablesDb() {
	const client = getAppwriteClient();
	const databaseId = getAppwriteDatabaseId();

	if (!client || !databaseId) {
		throw new TopicError('Topic storage is not configured yet. Please try again later.');
	}

	return { databaseId, tablesDb: new TablesDB(client) };
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getOperationError(error: unknown, operation: 'load' | 'create' | 'update' | 'delete') {
	if (error instanceof TopicError) {
		return error;
	}

	const code = getErrorCode(error);
	if (code === 401 || code === 403) {
		const operationLabel = operation === 'load' ? 'Read' : operation[0].toUpperCase() + operation.slice(1);
		return new TopicError(`${operationLabel} permission is not enabled for the topics table. Configure the appropriate Appwrite permission for teachers.`);
	}

	return new TopicError(`Unable to ${operation} topics. Please try again.`);
}

export async function listTopics(): Promise<TopicRow[]> {
	try {
		const { databaseId, tablesDb } = getTablesDb();
		const response = await tablesDb.listRows<TopicRow>({ databaseId, tableId: topicsTableId });

		return response.rows;
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function listPublishedLearnTopics(): Promise<TopicRow[]> {
	try {
		const jwt = await createQuizJWT();
		const response = await fetch('/api/learn/topics', {
			headers: { Authorization: `Bearer ${jwt}` },
		});
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok) {
			const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
				? payload.error
				: 'Unable to load published learning topics.';
			throw new TopicError(message);
		}
		if (typeof payload !== 'object' || payload === null || !('topics' in payload) || !Array.isArray(payload.topics)) {
			throw new TopicError('The published learning topics response was invalid.');
		}
		return payload.topics as TopicRow[];
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function createTopic(topic: Topic): Promise<TopicRow> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.createRow<TopicRow>({
			databaseId,
			tableId: topicsTableId,
			rowId: ID.unique(),
			data: topic,
		});
	} catch (error) {
		throw getOperationError(error, 'create');
	}
}

export async function updateTopic(rowId: string, topic: Topic): Promise<TopicRow> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.updateRow<TopicRow>({
			databaseId,
			tableId: topicsTableId,
			rowId,
			data: topic,
		});
	} catch (error) {
		throw getOperationError(error, 'update');
	}
}

export async function deleteTopic(rowId: string): Promise<void> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		await tablesDb.deleteRow({
			databaseId,
			tableId: topicsTableId,
			rowId,
		});
	} catch (error) {
		throw getOperationError(error, 'delete');
	}
}
