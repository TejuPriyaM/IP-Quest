import { createQuizJWT } from '@/lib/auth';

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

export class LessonError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'LessonError';
	}
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
	return listTeacherLessons();
}

async function teacherLessonRequest(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>) {
	const jwt = await createQuizJWT();
	const response = await fetch('/api/teacher/lessons', {
		method,
		headers: { Authorization: `Bearer ${jwt}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
		...(body ? { body: JSON.stringify(body) } : {}),
	});
	const payload: unknown = await response.json().catch(() => null);
	if (!response.ok) {
		const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
			? payload.error
			: 'Unable to access teacher lessons.';
		throw new LessonError(message);
	}
	return payload;
}

export async function listTeacherLessons(): Promise<Lesson[]> {
	const payload = await teacherLessonRequest('GET');
	if (typeof payload !== 'object' || payload === null || !('lessons' in payload) || !Array.isArray(payload.lessons)) {
		throw new LessonError('The teacher lessons response was invalid.');
	}
	return payload.lessons as Lesson[];
}

export async function getLesson(id: string): Promise<Lesson> {
	try {
		const query = new URLSearchParams({ resource: 'lessons', lessonId: id });
		const response = await fetch(`/api/learn/content?${query.toString()}`);
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok || typeof payload !== 'object' || payload === null || !('lesson' in payload)) {
			throw new LessonError('Unable to load this published lesson.');
		}
		return payload.lesson as Lesson;
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function listLessonsByTopic(topicId: string): Promise<Lesson[]> {
	try {
		const query = new URLSearchParams({ resource: 'lessons', topicId });
		const response = await fetch(`/api/learn/content?${query.toString()}`);
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok || typeof payload !== 'object' || payload === null || !('lessons' in payload) || !Array.isArray(payload.lessons)) {
			throw new LessonError('Unable to load published lessons.');
		}
		return payload.lessons as Lesson[];
	} catch (error) {
		throw getOperationError(error, 'load');
	}
}

export async function createLesson(data: LessonInput): Promise<Lesson> {
	try {
		return await teacherLessonRequest('POST', { lesson: data }) as Lesson;
	} catch (error) {
		throw getOperationError(error, 'create');
	}
}

export async function updateLesson(id: string, data: LessonInput): Promise<Lesson> {
	try {
		return await teacherLessonRequest('PATCH', { lessonId: id, lesson: data }) as Lesson;
	} catch (error) {
		throw getOperationError(error, 'update');
	}
}

export async function deleteLesson(id: string): Promise<void> {
	try {
		await teacherLessonRequest('DELETE', { lessonId: id });
	} catch (error) {
		throw getOperationError(error, 'delete');
	}
}
