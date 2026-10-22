import { NextResponse } from 'next/server';
import { AdminAuthorizationError, verifyAdminIdentity } from '@/lib/server/admin-auth';
import {
  decideTeacherAssignment,
  listTeacherAssignmentsForAdmin,
  TeacherAssignmentError,
  type AssignmentDecision,
} from '@/lib/server/teacher-assignments';

function getBearerToken(request: Request) {
  return request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof AdminAuthorizationError || error instanceof TeacherAssignmentError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Unable to process teacher assignments.' }, { status: 500 });
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  try {
    await verifyAdminIdentity(jwt);
    return NextResponse.json({ assignments: await listTeacherAssignmentsForAdmin() });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  let admin: Awaited<ReturnType<typeof verifyAdminIdentity>>;
  try {
    admin = await verifyAdminIdentity(jwt);
  } catch (error) {
    return getErrorResponse(error);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'An assignment and decision are required.' }, { status: 400 });
  }
  if (
    typeof body !== 'object' || body === null || Array.isArray(body) ||
    typeof (body as Record<string, unknown>).assignmentId !== 'string' ||
    !['approve', 'reject', 'revoke'].includes(String((body as Record<string, unknown>).decision))
  ) {
    return NextResponse.json({ error: 'An assignment and valid decision are required.' }, { status: 400 });
  }

  try {
    const result = await decideTeacherAssignment(
      admin.$id,
      (body as { assignmentId: string }).assignmentId,
      (body as { decision: AssignmentDecision }).decision,
    );
    return NextResponse.json(result);
  } catch (error) {
    return getErrorResponse(error);
  }
}