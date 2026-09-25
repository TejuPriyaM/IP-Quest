import 'server-only';

import { Account, Client, ID, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

const questionsTableId = 'questions';
const quizAttemptsTableId = 'quiz_attempts';

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
	options: string[];
	correct_option: string;
	is_published: boolean;
	question_text: string;
	difficulty: string;
	explanation: string;
};

type QuizAttempt = Models.Row & {
	user_id: string;
	topic_id: string;
	score: number;
	total_questions: number;
	completed_at: string;
};

export class QuizSubmissionError extends Error {
	statusCode: 400 | 401 | 403 | 404 | 500;

	constructor(message: string, statusCode: 400 | 401 | 403 | 404 | 500) {
		super(message);
		this.name = 'QuizSubmissionError';
		this.statusCode = statusCode;
	}
}

function getServerAppwriteClient(jwt: string) {
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
		throw new QuizSubmissionError('Server-side Appwrite configuration is incomplete.', 500);
	}

	return new Client()
		.setEndpoint(appwriteConfig.endpoint)
		.setProject(appwriteConfig.projectId)
		.setJWT(jwt);
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

	const client = getServerAppwriteClient(submission.jwt.trim());
	const account = new Account(client);
	let user: Models.User<Models.Preferences>;

	try {
		user = await account.get();
	} catch (error) {
		const code = getErrorCode(error);
		if (code === 401) {
			throw new QuizSubmissionError('Authentication failed. Please sign in again.', 401);
		}
		if (code === 403) {
			throw new QuizSubmissionError('You do not have permission to submit this quiz.', 403);
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
