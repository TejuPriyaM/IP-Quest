import { NextResponse } from 'next/server';
import { getStudentDashboard, StudentDashboardError } from '@/lib/server/student-dashboard';

export const dynamic = 'force-dynamic';

function getBearerToken(request: Request) {
  return request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

  try {
    return NextResponse.json(await getStudentDashboard(jwt), { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    if (error instanceof StudentDashboardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ error: 'Unable to load current dashboard data.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}