import { NextResponse } from 'next/server';
import {
  completeLevelAttempt,
  getLevelQuizProgress,
  LevelQuizError,
  startOrResumeLevel,
  submitLevelAnswer,
} from '@/lib/server/level-quiz';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof LevelQuizError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process this quiz request.' }, { status: 500 });
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const topicId = new URL(request.url).searchParams.get('topicId')?.trim() ?? '';
  if (!topicId) return NextResponse.json({ error: 'A valid quiz topic is required.' }, { status: 400 });

  try {
    return NextResponse.json(await getLevelQuizProgress(jwt, topicId));
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid quiz request.' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid quiz request.' }, { status: 400 });
  }

  try {
    if (body.action === 'start') {
      if (typeof body.topicId !== 'string' || typeof body.level !== 'number') {
        return NextResponse.json({ error: 'A topic and level are required.' }, { status: 400 });
      }
      return NextResponse.json(await startOrResumeLevel(jwt, body.topicId, body.level));
    }

    if (body.action === 'answer') {
      if (typeof body.attemptId !== 'string' || typeof body.questionId !== 'string' || typeof body.selectedOption !== 'string') {
        return NextResponse.json({ error: 'An attempt, question, and answer are required.' }, { status: 400 });
      }
      return NextResponse.json(await submitLevelAnswer(jwt, body.attemptId, body.questionId, body.selectedOption));
    }

    if (body.action === 'complete') {
      if (typeof body.attemptId !== 'string') {
        return NextResponse.json({ error: 'A quiz attempt is required.' }, { status: 400 });
      }
      return NextResponse.json(await completeLevelAttempt(jwt, body.attemptId));
    }

    return NextResponse.json({ error: 'Choose a valid quiz action.' }, { status: 400 });
  } catch (error) {
    return getErrorResponse(error);
  }
}
