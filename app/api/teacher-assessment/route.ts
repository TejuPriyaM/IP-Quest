import { NextResponse } from 'next/server';
import { getTeacherAssessmentResponses, listTeacherAssessmentQuestions, saveTeacherAssessmentResponse, TeacherAssessmentResponseError } from '@/lib/server/teacher-assessment';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof TeacherAssessmentResponseError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process this written assessment.' }, { status: 500 });
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  const parameters = new URL(request.url).searchParams;
  const topicId = parameters.get('topicId')?.trim() ?? '';
  const rawLevel = parameters.get('level');
  const level = rawLevel !== null && rawLevel !== undefined && rawLevel.trim() !== '' ? Number(rawLevel) : undefined;

  if (!topicId) return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });
  if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 3)) {
    return NextResponse.json({ error: 'A valid assessment level is required.' }, { status: 400 });
  }

  try {
    const { questions } = await listTeacherAssessmentQuestions(jwt, topicId, level);
    const responses = await getTeacherAssessmentResponses(jwt, topicId, questions.map((question) => question.id));
    return NextResponse.json({ questions, responses }, { status: 200 });
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
      return NextResponse.json({ error: 'Invalid written assessment submission.' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid written assessment submission.' }, { status: 400 });
  }

  if (typeof body.questionId !== 'string' || typeof body.answer !== 'string') {
    return NextResponse.json({ error: 'A question and answer are required.' }, { status: 400 });
  }

  try {
    const response = await saveTeacherAssessmentResponse(jwt, body.questionId, body.answer);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return getErrorResponse(error);
  }
}
