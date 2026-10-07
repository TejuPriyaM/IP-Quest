import { NextResponse } from 'next/server';
import {
  evaluateTeacherQuizAnswer,
  loadTeacherQuizQuestions,
  QuizSubmissionError,
  submitTeacherQuiz,
  type TeacherQuizSubmission,
} from '@/lib/server/quiz';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
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

function getErrorResponse(error: unknown) {
  if (error instanceof QuizSubmissionError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process the Teacher Quiz.' }, { status: 500 });
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  const topicId = new URL(request.url).searchParams.get('topicId');
  if (!topicId?.trim()) return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });

  try {
    const questions = await loadTeacherQuizQuestions(jwt, topicId);
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (typeof body?.topicId !== 'string') {
    return NextResponse.json({ error: 'A valid topic is required.' }, { status: 400 });
  }

  try {
    if (body.action === 'answer') {
      if (typeof body.questionId !== 'string' || typeof body.selectedAnswer !== 'string') {
        return NextResponse.json({ error: 'A question and selected answer are required.' }, { status: 400 });
      }
      const feedback = await evaluateTeacherQuizAnswer(jwt, body.topicId, body.questionId, body.selectedAnswer);
      return NextResponse.json(feedback, { status: 200 });
    }
    if (!Array.isArray(body.answers)) {
      return NextResponse.json({ error: 'Quiz answers must be an array.' }, { status: 400 });
    }
    const result = await submitTeacherQuiz({
      jwt,
      topicId: body.topicId,
      answers: body.answers as TeacherQuizSubmission['answers'],
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return getErrorResponse(error);
  }
}