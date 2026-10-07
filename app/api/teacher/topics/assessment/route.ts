import { NextResponse } from 'next/server';
import { createOrUpdateTeacherTopicAssessment, TeacherTopicAssessmentError } from '@/lib/server/teacher-topic-assessment';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid topic assessment details.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await createOrUpdateTeacherTopicAssessment(jwt, body), { status: 200 });
  } catch (error) {
    if (error instanceof TeacherTopicAssessmentError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to save the topic assessment.' }, { status: 500 });
  }
}