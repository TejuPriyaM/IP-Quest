import { NextResponse } from 'next/server';
import { getTeacherStudentProgress, TeacherProgressError } from '@/lib/server/teacher-progress';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'A valid student email is required.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body) || typeof (body as Record<string, unknown>).email !== 'string') {
    return NextResponse.json({ error: 'A valid student email is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getTeacherStudentProgress(jwt, (body as { email: string }).email));
  } catch (error) {
    if (error instanceof TeacherProgressError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to load the student progress report.' }, { status: 500 });
  }
}