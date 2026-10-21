import { NextResponse } from 'next/server';
import {
  deleteTeacherTopic,
  listTeacherTopics,
  saveTeacherTopic,
  TeacherContentError,
} from '@/lib/server/teacher-content';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

function errorResponse(error: unknown) {
  if (error instanceof TeacherContentError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process teacher topic content.' }, { status: 500 });
}

async function getBody(request: Request) {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  try {
    return NextResponse.json({ topics: await listTeacherTopics(jwt) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (!body || !('topic' in body)) return NextResponse.json({ error: 'Topic details are required.' }, { status: 400 });
  try {
    return NextResponse.json(await saveTeacherTopic(jwt, body.topic), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (!body || typeof body.topicId !== 'string' || !('topic' in body)) {
    return NextResponse.json({ error: 'A topic ID and topic details are required.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveTeacherTopic(jwt, body.topic, body.topicId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await getBody(request);
  if (!body || typeof body.topicId !== 'string') {
    return NextResponse.json({ error: 'A topic ID is required.' }, { status: 400 });
  }
  try {
    await deleteTeacherTopic(jwt, body.topicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
