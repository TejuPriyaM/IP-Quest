import 'server-only';

import { Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { verifyQuizStudent } from '@/lib/server/level-quiz';
import { QUIZ_PASS_PERCENTAGE } from '@/lib/server/quiz-config';

const questionsTableId = 'questions';
const quizAttemptsTableId = 'quiz_attempts';
const topicsTableId = 'topics';

export type QuizSubmission = {
	jwt: string;
	topicId: string;
	answers: Array<{
		questionId: string;
		selectedAnswer: string;
	}>;
};

export type QuizSubmissionResult = {
	success: true;
	attemptId: string;
	topicId: string;
	score: number;
	totalQuestions: number;
	percentage: number;
};

type CanonicalQuestion = Models.Row & {
	topic_id: string;
	lesson_id?: string | null;
	level?: number | null;
	options: string[];
	correct_option: string;
	is_published: boolean;
	question_text: string;
	difficulty: string;
	explanation: string;
};

export type StudentQuizQuestion = Pick<
	CanonicalQuestion,
	'$id' | 'topic_id' | 'question_text' | 'options' | 'difficulty'
>;

export type TeacherQuizSubmission = {
	jwt: string;
	topicId: string;
	attemptId: string;
	answers: Array<{ questionId: string; selectedAnswer: string }>;
};

export type TeacherQuizResult = {
	attemptId: string;
	score: number;
	totalQuestions: number;
	percentage: number;
	passed: boolean;
};

export type TeacherQuizAnswerFeedback = {
	questionId: string;
	isCorrect: boolean;
	correctAnswer?: string;
	explanation: string;
};

type QuizAttempt = Models.Row & {
	user_id: string;
	topic_id: string;
	score: number;
	total_questions: number;
	completed_at: string;
	level?: number | null;
	lesson_id?: string | null;
	status?: string | null;
	passed?: boolean | null;
};

export class QuizSubmissionError extends Error {
	statusCode: 400 | 401 | 403 | 404 | 500;

	constructor(message: string, statusCode: 400 | 401 | 403 | 404 | 500) {
		super(message);
		this.name = 'QuizSubmissionError';
		this.statusCode = statusCode;
	}
}

function getQuizAppwriteClient() {
	const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
		throw new QuizSubmissionError('Server-side quiz Appwrite configuration is incomplete.', 500);
	}

	return new Client()
		.setEndpoint(appwriteConfig.endpoint)
		.setProject(appwriteConfig.projectId)
		.setKey(apiKey);
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function assertSubmissionShape(submission: QuizSubmission) {
	if (typeof submission.jwt !== 'string' || !submission.jwt.trim()) {
		throw new QuizSubmissionError('Authentication is required.', 401);
	}

	if (typeof submission.topicId !== 'string' || !submission.topicId.trim()) {
		throw new QuizSubmissionError('A valid topic is required.', 400);
	}

	if (!Array.isArray(submission.answers)) {
		throw new QuizSubmissionError('Quiz answers must be an array.', 400);
	}

	const questionIds = new Set<string>();
	for (const answer of submission.answers) {
		if (
			typeof answer !== 'object' ||
			answer === null ||
			typeof answer.questionId !== 'string' ||
			!answer.questionId.trim() ||
			typeof answer.selectedAnswer !== 'string' ||
			!answer.selectedAnswer.trim()
		) {
			throw new QuizSubmissionError('Each quiz answer must include a question ID and selected answer.', 400);
		}

		if (questionIds.has(answer.questionId)) {
			throw new QuizSubmissionError('A question cannot be submitted more than once.', 400);
		}

		questionIds.add(answer.questionId);
	}
}

function getAppwriteError(error: unknown, fallback: string) {
	const code = getErrorCode(error);

	if (code === 401) {
		return new QuizSubmissionError('Authentication failed. Please sign in again.', 401);
	}

	if (code === 403) {
		return new QuizSubmissionError('You do not have permission to complete this quiz.', 403);
	}

	return new QuizSubmissionError(fallback, 500);
}

export async function submitQuiz(submission: QuizSubmission): Promise<QuizSubmissionResult> {
	assertSubmissionShape(submission);

	let user: Models.User<Models.Preferences>;
	try {
		user = await verifyQuizStudent(submission.jwt.trim());
	} catch (error) {
		const code = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
		if (code === 401 || code === 403) {
			throw new QuizSubmissionError(error instanceof Error ? error.message : 'You do not have permission to submit this quiz.', code);
		}
		throw new QuizSubmissionError('Unable to authenticate the quiz submission.', 500);
	}

	const quizClient = getQuizAppwriteClient();
	const tablesDb = new TablesDB(quizClient);
	const databaseId = appwriteConfig.databaseId;
	if (!databaseId) {
		throw new QuizSubmissionError('Appwrite database configuration is incomplete.', 500);
	}

	let canonicalQuestions: CanonicalQuestion[];
	try {
		const response = await tablesDb.listRows<CanonicalQuestion>({
			databaseId,
			tableId: questionsTableId,
			queries: [Query.equal('topic_id', submission.topicId.trim()), Query.equal('is_published', true)],
		});
		canonicalQuestions = response.rows;
	} catch (error) {
		throw getAppwriteError(error, 'Unable to load the quiz questions.');
	}

	if (canonicalQuestions.length === 0) {
		throw new QuizSubmissionError('No published questions are available for this topic.', 404);
	}

	const canonicalIds = new Set(canonicalQuestions.map((question) => question.$id));
	const submittedIds = new Set(submission.answers.map((answer) => answer.questionId));
	if (submittedIds.size !== canonicalIds.size || canonicalQuestions.some((question) => !submittedIds.has(question.$id))) {
		throw new QuizSubmissionError('The submitted question set does not match the current published quiz.', 400);
	}

	const answersByQuestionId = new Map(submission.answers.map((answer) => [answer.questionId, answer.selectedAnswer.trim()]));
	let score = 0;

	for (const question of canonicalQuestions) {
		const selectedAnswer = answersByQuestionId.get(question.$id);
		if (selectedAnswer === undefined || !question.options.includes(selectedAnswer)) {
			throw new QuizSubmissionError('One or more submitted answers are invalid.', 400);
		}

		if (selectedAnswer === question.correct_option) {
			score += 1;
		}
	}

	const totalQuestions = canonicalQuestions.length;
	const percentage = Math.round((score / totalQuestions) * 100);
	let attempt: QuizAttempt;

	try {
		attempt = await tablesDb.createRow<QuizAttempt>({
			databaseId,
			tableId: quizAttemptsTableId,
			rowId: ID.unique(),
			data: {
				user_id: user.$id,
				topic_id: submission.topicId.trim(),
				score,
				total_questions: totalQuestions,
				completed_at: new Date().toISOString(),
			},
		});
	} catch (error) {
		throw getAppwriteError(error, 'Unable to save your quiz attempt.');
	}

	return {
		success: true,
		attemptId: attempt.$id,
		topicId: submission.topicId.trim(),
		score,
		totalQuestions,
		percentage,
	};
}

function shuffleArray<T>(items: T[]) {
	const reordered = [...items];
	for (let index = reordered.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
	}
	return reordered;
}

async function getPublishedTeacherQuizQuestions(jwt: string, topicId: string) {
	if (typeof jwt !== 'string' || !jwt.trim()) {
		throw new QuizSubmissionError('Authentication is required.', 401);
	}
	if (typeof topicId !== 'string' || !topicId.trim()) {
		throw new QuizSubmissionError('A valid topic is required.', 400);
	}

	try {
		await verifyQuizStudent(jwt.trim());
	} catch (error) {
		const code = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
		if (code === 401 || code === 403) {
			throw new QuizSubmissionError(error instanceof Error ? error.message : 'You do not have permission to take this quiz.', code);
		}
		throw new QuizSubmissionError('Unable to authenticate the quiz request.', 500);
	}

	const databaseId = appwriteConfig.databaseId;
	if (!databaseId) throw new QuizSubmissionError('Appwrite database configuration is incomplete.', 500);
	const tablesDb = new TablesDB(getQuizAppwriteClient());
	let topic: Models.Row & { title?: string; slug?: string; is_published?: boolean };
	try {
		topic = await tablesDb.getRow({ databaseId, tableId: topicsTableId, rowId: topicId.trim() });
	} catch (error) {
		if (getErrorCode(error) === 404) throw new QuizSubmissionError('This topic is not available.', 404);
		throw getAppwriteError(error, 'Unable to load the selected topic.');
	}
	if (topic.is_published !== true || !getLearnModuleBySlug(topic.slug ?? topic.title ?? '')) {
		throw new QuizSubmissionError('This topic is not available for Teacher Quiz.', 404);
	}

	const questions: CanonicalQuestion[] = [];
	try {
		for (const lessonQuery of [Query.isNull('lesson_id'), Query.equal('lesson_id', '')]) {
			let cursor: string | undefined;
			while (true) {
				const response = await tablesDb.listRows<CanonicalQuestion>({
					databaseId,
					tableId: questionsTableId,
					queries: [
						Query.equal('topic_id', topicId.trim()),
						Query.equal('is_published', true),
						Query.isNull('level'),
						lessonQuery,
						Query.limit(100),
						...(cursor ? [Query.cursorAfter(cursor)] : []),
					],
				});
				questions.push(...response.rows);
				if (response.rows.length < 100) break;
				cursor = response.rows[response.rows.length - 1].$id;
			}
		}
	} catch (error) {
		throw getAppwriteError(error, 'Unable to load Teacher Quiz questions.');
	}

	const uniqueQuestions = Array.from(new Map(questions.map((question) => [question.$id, question])).values());
	return uniqueQuestions.filter((question) =>
		question.topic_id === topicId.trim() &&
		question.is_published === true &&
		(question.lesson_id === undefined || question.lesson_id === null || question.lesson_id === '') &&
		(question.level === undefined || question.level === null) &&
		Array.isArray(question.options) &&
		question.options.length === 4 &&
		new Set(question.options.map((option) => option.trim().toLocaleLowerCase())).size === 4 &&
		question.options.every((option) => option.trim()) &&
		question.options.includes(question.correct_option),
	);
}

export async function loadTeacherQuizQuestions(jwt: string, topicId: string): Promise<StudentQuizQuestion[]> {
	const questions = await getPublishedTeacherQuizQuestions(jwt, topicId);
	return shuffleArray(questions).map((question) => ({
		$id: question.$id,
		topic_id: question.topic_id,
		question_text: question.question_text,
		options: shuffleArray(question.options),
		difficulty: question.difficulty,
	}));
}

function isTeacherAnswerCorrect(question: CanonicalQuestion, selectedAnswer: string) {
	return selectedAnswer.trim() === question.correct_option;
}

export async function evaluateTeacherQuizAnswer(
	jwt: string,
	topicId: string,
	questionId: string,
	selectedAnswer: string,
): Promise<TeacherQuizAnswerFeedback> {
	if (!questionId.trim() || !selectedAnswer.trim()) {
		throw new QuizSubmissionError('A question and selected answer are required.', 400);
	}

	const questions = await getPublishedTeacherQuizQuestions(jwt, topicId);
	const question = questions.find((item) => item.$id === questionId);
	if (!question) throw new QuizSubmissionError('This question is not part of the selected Teacher Quiz.', 400);

	const answer = selectedAnswer.trim();
	if (!question.options.includes(answer)) throw new QuizSubmissionError('Choose one of the listed answers.', 400);

	const isCorrect = isTeacherAnswerCorrect(question, answer);
	return {
		questionId,
		isCorrect,
		...(!isCorrect ? { correctAnswer: question.correct_option } : {}),
		explanation: question.explanation ?? '',
	};
}

export async function submitTeacherQuiz(submission: TeacherQuizSubmission): Promise<TeacherQuizResult> {
	assertSubmissionShape(submission);
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submission.attemptId)) {
		throw new QuizSubmissionError('A valid quiz attempt is required.', 400);
	}
	const questions = await getPublishedTeacherQuizQuestions(submission.jwt, submission.topicId);
	if (questions.length === 0) {
		throw new QuizSubmissionError('No teacher-created questions are available for this module yet.', 404);
	}
	const submittedIds = new Set(submission.answers.map((answer) => answer.questionId));
	if (submittedIds.size !== questions.length || questions.some((question) => !submittedIds.has(question.$id))) {
		throw new QuizSubmissionError('The submitted question set does not match the current published Teacher Quiz.', 400);
	}
	const answersById = new Map(submission.answers.map((answer) => [answer.questionId, answer.selectedAnswer.trim()]));
	let score = 0;
	for (const question of questions) {
		const answer = answersById.get(question.$id);
		if (!answer || !question.options.includes(answer)) {
			throw new QuizSubmissionError('One or more submitted answers are invalid.', 400);
		}
		if (isTeacherAnswerCorrect(question, answer)) score += 1;
	}
	const percentage = Math.round((score / questions.length) * 100);
	const passed = percentage >= QUIZ_PASS_PERCENTAGE;
	let user: Models.User<Models.Preferences>;
	try {
		user = await verifyQuizStudent(submission.jwt.trim());
	} catch (error) {
		const code = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
		if (code === 401 || code === 403) {
			throw new QuizSubmissionError(error instanceof Error ? error.message : 'You do not have permission to submit this quiz.', code);
		}
		throw new QuizSubmissionError('Unable to authenticate the quiz submission.', 500);
	}

	const databaseId = appwriteConfig.databaseId;
	if (!databaseId) throw new QuizSubmissionError('Appwrite database configuration is incomplete.', 500);
	const tablesDb = new TablesDB(getQuizAppwriteClient());
	const topicId = submission.topicId.trim();
	let attempt: QuizAttempt;
	try {
		attempt = await tablesDb.createRow<QuizAttempt>({
			databaseId,
			tableId: quizAttemptsTableId,
			rowId: submission.attemptId,
			data: {
				user_id: user.$id,
				topic_id: topicId,
				score,
				total_questions: questions.length,
				completed_at: new Date().toISOString(),
				status: 'completed',
				passed,
			},
		});
	} catch (error) {
		if (getErrorCode(error) !== 409) throw getAppwriteError(error, 'Unable to save your Teacher Quiz attempt.');
		try {
			attempt = await tablesDb.getRow<QuizAttempt>({ databaseId, tableId: quizAttemptsTableId, rowId: submission.attemptId });
		} catch {
			throw new QuizSubmissionError('Unable to confirm your Teacher Quiz attempt.', 500);
		}
		if (attempt.user_id !== user.$id || attempt.topic_id !== topicId || attempt.status !== 'completed' || Number.isInteger(attempt.level) || attempt.lesson_id) {
			throw new QuizSubmissionError('This quiz attempt is not available.', 400);
		}
	}

	return {
		attemptId: attempt.$id,
		score,
		totalQuestions: attempt.total_questions,
		percentage: Math.round((attempt.score / attempt.total_questions) * 100),
		passed: attempt.passed === true,
	};
}

export async function loadQuizQuestions(jwt: string, topicId: string): Promise<StudentQuizQuestion[]> {
	if (typeof jwt !== 'string' || !jwt.trim()) {
		throw new QuizSubmissionError('Authentication is required.', 401);
	}

	if (typeof topicId !== 'string' || !topicId.trim()) {
		throw new QuizSubmissionError('A valid topic is required.', 400);
	}

	try {
		await verifyQuizStudent(jwt.trim());
	} catch (error) {
		const code = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
		if (code === 401 || code === 403) {
			throw new QuizSubmissionError(error instanceof Error ? error.message : 'You do not have permission to load this quiz.', code);
		}
		throw new QuizSubmissionError('Unable to authenticate the quiz request.', 500);
	}

	const tablesDb = new TablesDB(getQuizAppwriteClient());
	const databaseId = appwriteConfig.databaseId;
	if (!databaseId) {
		throw new QuizSubmissionError('Appwrite database configuration is incomplete.', 500);
	}

	let questions: CanonicalQuestion[];
	try {
		const response = await tablesDb.listRows<CanonicalQuestion>({
			databaseId,
			tableId: questionsTableId,
			queries: [
				Query.equal('topic_id', topicId.trim()),
				Query.equal('is_published', true),
				Query.orderAsc('$id'),
			],
		});
		questions = response.rows;
	} catch {
		throw new QuizSubmissionError('Unable to load quiz questions.', 500);
	}

	return shuffleArray(questions).map((question) => ({
		$id: question.$id,
		topic_id: question.topic_id,
		question_text: question.question_text,
		options: shuffleArray(question.options),
		difficulty: question.difficulty,
	}));
}

