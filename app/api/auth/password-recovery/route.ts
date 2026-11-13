import { NextResponse } from 'next/server';
import {
  PasswordRecoveryError,
  requestPasswordRecovery,
  resetRecoveredPassword,
  verifyPasswordRecoveryCode,
} from '@/lib/server/password-recovery';

const MAX_BODY_LENGTH = 8_000;

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function clientAddress(request: Request) {
  const realIp = request.headers.get('x-real-ip')?.trim();
  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return realIp || forwardedIp || 'unknown-client';
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_LENGTH) return response({ error: 'The recovery request is too large.' }, 413);

  let text: string;
  try {
    text = await request.text();
  } catch {
    return response({ error: 'Invalid recovery request.' }, 400);
  }
  if (text.length > MAX_BODY_LENGTH) return response({ error: 'The recovery request is too large.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return response({ error: 'Invalid recovery request.' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return response({ error: 'Invalid recovery request.' }, 400);
  }

  const input = body as Record<string, unknown>;
  try {
    if (input.action === 'request') {
      return response(await requestPasswordRecovery(input.email, clientAddress(request)), 202);
    }
    if (input.action === 'verify') {
      return response(await verifyPasswordRecoveryCode(input.email, input.code));
    }
    if (input.action === 'reset') {
      return response(await resetRecoveredPassword(input.email, input.resetToken, input.password, input.confirmPassword));
    }
    return response({ error: 'Choose a valid password recovery action.' }, 400);
  } catch (error) {
    if (error instanceof PasswordRecoveryError) return response({ error: error.message }, error.statusCode);
    return response({ error: 'Password recovery is temporarily unavailable. Please try again.' }, 503);
  }
}
