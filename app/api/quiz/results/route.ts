import { NextResponse } from 'next/server';
import { getQuizResult, QuizResultError } from '@/lib/server/quiz-results';
import { getLevelAttemptResult, getOverallTopicResult, LevelQuizError } from '@/lib/server/level-quiz';

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

	const searchParams = new URL(request.url).searchParams;
	const mode = searchParams.get('mode');
	const attemptId = searchParams.get('attemptId');
	const topicId = searchParams.get('topicId');
	if (mode === 'overall') {
		if (!topicId?.trim()) {
			return NextResponse.json({ error: 'A valid quiz topic is required.' }, { status: 400 });
		}
		try {
			return NextResponse.json(await getOverallTopicResult(jwt, topicId));
		} catch (error) {
			if (error instanceof LevelQuizError) {
				return NextResponse.json({ error: error.message }, { status: error.statusCode });
			}
			return NextResponse.json({ error: 'Unable to retrieve the overall quiz result.' }, { status: 500 });
		}
	}

	if (!attemptId?.trim()) {
		return NextResponse.json({ error: 'A valid quiz attempt is required.' }, { status: 400 });
	}

	try {
		const result = mode === 'level'
			? await getLevelAttemptResult(jwt, attemptId)
			: await getQuizResult(jwt, attemptId);
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		if (error instanceof QuizResultError || error instanceof LevelQuizError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode });
		}

		return NextResponse.json({ error: 'Unable to retrieve the quiz result.' }, { status: 500 });
	}
}