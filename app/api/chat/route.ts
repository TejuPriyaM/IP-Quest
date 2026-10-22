import { NextResponse } from 'next/server';
import { ChatError, generateChatReply } from '@/lib/server/chat';

const MAX_BODY_LENGTH = 12_000;

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

function errorResponse(error: unknown) {
  if (error instanceof ChatError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { error: 'Unable to process this chat request.' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) {
    return NextResponse.json(
      { error: 'Authentication is required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: 'The chat request is too large.' },
      { status: 413, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return NextResponse.json(
      { error: 'Invalid chat request.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (text.length > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: 'The chat request is too large.' },
      { status: 413, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: 'Invalid chat request.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    return NextResponse.json(await generateChatReply(jwt, body), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
