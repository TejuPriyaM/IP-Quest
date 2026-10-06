import { NextResponse } from 'next/server';
import { createTeacherQuestion, TeacherQuestionError, updateTeacherQuestion } from '@/lib/server/teacher-questions';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof TeacherQuestionError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to save the quiz question.' }, { status: 500 });
}

async function getBody(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (!body || !('question' in body)) return NextResponse.json({ error: 'Question details are required.' }, { status: 400 });

  try {
    const question = await createTeacherQuestion(jwt, body.question);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (!body || typeof body.questionId !== 'string' || !('question' in body)) {
    return NextResponse.json({ error: 'A question ID and question details are required.' }, { status: 400 });
  }

  try {
    const question = await updateTeacherQuestion(jwt, body.questionId, body.question);
    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    return getErrorResponse(error);
  }
}
