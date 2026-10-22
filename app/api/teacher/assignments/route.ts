import { NextResponse } from 'next/server';
import { LevelQuizError, verifyQuizTeacher } from '@/lib/server/level-quiz';
import { requestStudentAssignment, TeacherAssignmentError } from '@/lib/server/teacher-assignments';

function getBearerToken(request: Request) {
  return request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  try {
    await verifyQuizTeacher(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to verify teacher access.' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'A student email is required.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body) || typeof (body as Record<string, unknown>).email !== 'string') {
    return NextResponse.json({ error: 'A student email is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await requestStudentAssignment(jwt, (body as { email: string }).email), { status: 202 });
  } catch (error) {
    if (error instanceof TeacherAssignmentError) {
      return NextResponse.json({ error: error.message, ...(error.assignmentStatus ? { assignmentStatus: error.assignmentStatus } : {}) }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to request student access.' }, { status: 500 });
  }
}