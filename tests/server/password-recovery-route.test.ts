import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  verify: vi.fn(),
  reset: vi.fn(),
}));

vi.mock('@/lib/server/password-recovery', () => {
  class MockPasswordRecoveryError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  return {
    PasswordRecoveryError: MockPasswordRecoveryError,
    requestPasswordRecovery: mocks.request,
    verifyPasswordRecoveryCode: mocks.verify,
    resetRecoveredPassword: mocks.reset,
  };
});

import { POST } from '@/app/api/auth/password-recovery/route';
import { PasswordRecoveryError } from '@/lib/server/password-recovery';

beforeEach(() => {
  vi.clearAllMocks();
});

function post(body: string, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/auth/password-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

describe('password recovery API route', () => {
  it('supports a generic public email request without authentication', async () => {
    mocks.request.mockResolvedValue({ message: 'If an account uses this email address, a code will be sent.' });
    const response = await POST(post(JSON.stringify({ action: 'request', email: 'learner@example.test' }), {
      'X-Real-IP': '203.0.113.10',
    }));

    expect(response.status).toBe(202);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(mocks.request).toHaveBeenCalledWith('learner@example.test', '203.0.113.10');
  });

  it('forwards verification and reset inputs to the server service', async () => {
    mocks.verify.mockResolvedValue({ resetToken: 'a'.repeat(64) });
    mocks.reset.mockResolvedValue({ message: 'Your password has been updated.' });

    const verifyResponse = await POST(post(JSON.stringify({ action: 'verify', email: 'learner@example.test', code: '123456' })));
    const resetResponse = await POST(post(JSON.stringify({ action: 'reset', email: 'learner@example.test', resetToken: 'a'.repeat(64), password: 'password123', confirmPassword: 'password123' })));

    expect(verifyResponse.status).toBe(200);
    expect(await verifyResponse.json()).toEqual({ resetToken: 'a'.repeat(64) });
    expect(mocks.verify).toHaveBeenCalledWith('learner@example.test', '123456');
    expect(resetResponse.status).toBe(200);
    expect(mocks.reset).toHaveBeenCalledWith('learner@example.test', 'a'.repeat(64), 'password123', 'password123');
  });

  it('rejects malformed bodies and unsupported actions', async () => {
    expect((await POST(post('{invalid'))).status).toBe(400);
    expect((await POST(post(JSON.stringify({ action: 'admin-reset' })))).status).toBe(400);
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it('maps safe recovery errors to their intended status', async () => {
    mocks.verify.mockRejectedValue(new PasswordRecoveryError('That code is invalid or expired.', 400));

    const response = await POST(post(JSON.stringify({ action: 'verify', email: 'learner@example.test', code: '000000' })));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'That code is invalid or expired.' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
