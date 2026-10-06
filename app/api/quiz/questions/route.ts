import { NextResponse } from 'next/server';
import { loadQuizQuestions, QuizSubmissionError } from '@/lib/server/quiz';

function getBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');
	const match = authorization?.match(/^Bearer ([^\s]+)$/i);
	return match?.[1] ?? null;
}

export async function GET(request: Request) {
	const jwt = getBearerToken(request);
	if (!jwt) {
		return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
	}

	const topicId = new URL(request.url).searchParams.get('topicId');
	if (!topicId?.trim()) {
		return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });
	}

	try {
		const questions = await loadQuizQuestions(jwt, topicId);
		return NextResponse.json({ questions }, { status: 200 });
	} catch (error) {
		if (error instanceof QuizSubmissionError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode });
		}

		return NextResponse.json({ error: 'Unable to load quiz questions.' }, { status: 500 });
	}
}