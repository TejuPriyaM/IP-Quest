import { NextResponse } from 'next/server';
import { getStudentPerformanceHistory, LevelQuizError } from '@/lib/server/level-quiz';

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  try {
    return NextResponse.json(await getStudentPerformanceHistory(jwt));
  } catch (error) {
    if (error instanceof LevelQuizError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to load your performance history.' }, { status: 500 });
  }
}