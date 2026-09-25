import { NextResponse } from 'next/server';
import { submitQuiz, QuizSubmissionError, type QuizSubmission } from '@/lib/server/quiz';

type QuizRequestBody = {
	topicId?: unknown;
	answers?: unknown;
};

function isRequestBody(body: unknown): body is QuizRequestBody {
	return typeof body === 'object' && body !== null;
}

function getBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return null;
	}

	const token = authorization.slice('Bearer '.length).trim();
	return token || null;
}

function isAnswerList(answers: unknown): answers is QuizSubmission['answers'] {
	return Array.isArray(answers);
}

export async function POST(request: Request) {
	const jwt = getBearerToken(request);
	if (!jwt) {
		return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
	}

	let body: QuizRequestBody;
	try {
		const parsedBody: unknown = await request.json();
		if (!isRequestBody(parsedBody)) {
			return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
		}
		body = parsedBody;
	} catch {
		return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
	}

	if (typeof body.topicId !== 'string' || !body.topicId.trim() || !isAnswerList(body.answers)) {
		return NextResponse.json({ error: 'A valid topic and answers are required.' }, { status: 400 });
	}

	try {
		const result = await submitQuiz({
			jwt,
			topicId: body.topicId,
			answers: body.answers,
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		if (error instanceof QuizSubmissionError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode });
		}

		return NextResponse.json({ error: 'Unable to submit the quiz.' }, { status: 500 });
	}
}
