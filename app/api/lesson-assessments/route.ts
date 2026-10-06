import { NextResponse } from 'next/server';
import {
  getLessonAssessment,
  LessonAssessmentError,
  listLessonAssessments,
  submitLessonAssessment,
} from '@/lib/server/lesson-assessments';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof LessonAssessmentError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process this lesson assessment.' }, { status: 500 });
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  const parameters = new URL(request.url).searchParams;
  const topicId = parameters.get('topicId')?.trim() ?? '';
  const lessonId = parameters.get('lessonId')?.trim() ?? '';
  if (!topicId) return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });

  try {
    if (lessonId) return NextResponse.json(await getLessonAssessment(jwt, topicId, lessonId));
    return NextResponse.json(await listLessonAssessments(jwt, topicId));
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
      return NextResponse.json({ error: 'Invalid assessment submission.' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid assessment submission.' }, { status: 400 });
  }

  if (typeof body.topicId !== 'string' || typeof body.lessonId !== 'string' || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'A topic, lesson, and answers are required.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await submitLessonAssessment(jwt, body.topicId, body.lessonId, body.answers as Array<{ questionId: string; selectedOption: string }>));
  } catch (error) {
    return getErrorResponse(error);
  }
}
