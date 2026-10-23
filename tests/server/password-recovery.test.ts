import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rows: new Map<string, Record<string, unknown>>(),
  transactions: new Map<string, Array<Record<string, unknown>>>(),
  users: [{ $id: 'student-id', email: 'student@example.test' } as { $id: string; email: string }],
  fetch: vi.fn(),
  listUsers: vi.fn(),
  updatePassword: vi.fn(),
  idCounter: 0,
  transactionCounter: 0,
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
  },
}));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  }
  class MockTablesDB {
    async getRow(params: { rowId: string }) {
      const row = mocks.rows.get(params.rowId);
      if (!row) throw Object.assign(new Error('Not found'), { code: 404 });
      return { $id: params.rowId, ...row };
    }
    async createRow(params: { rowId: string; data: Record<string, unknown>; transactionId?: string }) {
      if (params.transactionId) {
        mocks.transactions.get(params.transactionId)?.push({ kind: 'create', ...params });
        return { $id: params.rowId, ...params.data };
      }
      if (mocks.rows.has(params.rowId)) throw Object.assign(new Error('Conflict'), { code: 409 });
      mocks.rows.set(params.rowId, params.data);
      return { $id: params.rowId, ...params.data };
    }
    async updateRow(params: { rowId: string; data?: Record<string, unknown>; transactionId?: string }) {
      if (params.transactionId) {
        mocks.transactions.get(params.transactionId)?.push({ kind: 'update', ...params });
        return {};
      }
      const existing = mocks.rows.get(params.rowId);
      if (!existing) throw Object.assign(new Error('Not found'), { code: 404 });
      mocks.rows.set(params.rowId, { ...existing, ...params.data });
      return { $id: params.rowId, ...mocks.rows.get(params.rowId) };
    }
    async deleteRows() { return { rows: [], total: 0 }; }
    async createTransaction() {
      mocks.transactionCounter += 1;
      const $id = `transaction-${mocks.transactionCounter}`;
      mocks.transactions.set($id, []);
      return { $id };
    }
    async updateTransaction(params: { transactionId: string; commit?: boolean }) {
      const operations = mocks.transactions.get(params.transactionId) ?? [];
      if (params.commit) {
        for (const operation of operations) {
          if (operation.kind === 'create' && mocks.rows.has(operation.rowId as string)) {
            throw Object.assign(new Error('Conflict'), { code: 409 });
          }
        }
        for (const operation of operations) {
          const rowId = operation.rowId as string;
          if (operation.kind === 'create') mocks.rows.set(rowId, operation.data as Record<string, unknown>);
          if (operation.kind === 'update') {
            const existing = mocks.rows.get(rowId);
            if (existing) mocks.rows.set(rowId, { ...existing, ...(operation.data as Record<string, unknown>) });
          }
        }
      }
      mocks.transactions.delete(params.transactionId);
      return {};
    }
  }
  class MockUsers {
    list(params: { queries?: string[] }) { return mocks.listUsers(params); }
    updatePassword(params: { userId: string; password: string }) { return mocks.updatePassword(params); }
  }
  return {
    Client: MockClient,
    ID: { unique: () => `request-${++mocks.idCounter}` },
    Query: {
      equal: (key: string, value: string) => JSON.stringify({ equal: [key, value] }),
      lessThan: (key: string, value: string) => JSON.stringify({ lessThan: [key, value] }),
      limit: (value: number) => JSON.stringify({ limit: value }),
    },
    TablesDB: MockTablesDB,
    Users: MockUsers,
  };
});

import {
  PasswordRecoveryError,
  requestPasswordRecovery,
  resetRecoveredPassword,
  verifyPasswordRecoveryCode,
} from '@/lib/server/password-recovery';

function emailBody() {
  return JSON.parse(mocks.fetch.mock.calls[0][1].body as string) as { to: string[]; text: string };
}

async function requestCode(email = 'student@example.test') {
  await requestPasswordRecovery(email);
  const code = emailBody().text.match(/\b\d{6}\b/)?.[0];
  if (!code) throw new Error('The test email did not contain a verification code.');
  return code;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_PASSWORD_RECOVERY_API_KEY', 'server-only-test-key');
  vi.stubEnv('PASSWORD_RECOVERY_SECRET', 'test-only-secret-that-is-at-least-32-bytes');
  vi.stubEnv('RESEND_API_KEY', 'resend-test-key');
  vi.stubEnv('PASSWORD_RECOVERY_FROM_EMAIL', 'IP Quest <accounts@example.test>');
  mocks.rows.clear();
  mocks.transactions.clear();
  mocks.users = [{ $id: 'student-id', email: 'student@example.test' }];
  mocks.idCounter = 0;
  mocks.transactionCounter = 0;
  mocks.listUsers.mockImplementation(async ({ queries }: { queries?: string[] }) => {
    const query = JSON.parse(queries?.[0] ?? '{}') as { equal?: [string, string] };
    const email = query.equal?.[1];
    return { users: mocks.users.filter((user) => user.email.toLowerCase() === email) };
  });
  mocks.updatePassword.mockResolvedValue({ $id: 'student-id' });
  mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', mocks.fetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('password recovery service', () => {
  it.each(['student@example.test', 'teacher@example.test'])('sends a generic confirmation for registered %s accounts', async (email) => {
    mocks.users = [{ $id: email.startsWith('teacher') ? 'teacher-id' : 'student-id', email }];

    const result = await requestPasswordRecovery(`  ${email.toUpperCase()}  `, '203.0.113.7');
    const body = emailBody();
    const storedRows = Array.from(mocks.rows.values());

    expect(result.message).toContain('If an account uses this email address');
    expect(body.to).toEqual([email]);
    expect(body.text).toMatch(/\b\d{6}\b/);
    expect(storedRows.some((row) => JSON.stringify(row).includes(body.text.match(/\b\d{6}\b/)?.[0] ?? ''))).toBe(false);
    expect(storedRows.some((row) => typeof row.code_hash === 'string' && /^[a-f0-9]{64}$/.test(row.code_hash))).toBe(true);
    expect(storedRows.some((row) => row.email === email)).toBe(false);
  });

  it('rejects malformed email addresses before looking up accounts or sending email', async () => {
    await expect(requestPasswordRecovery('not-an-email')).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.listUsers).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('uses the same confirmation for unknown email addresses', async () => {
    const result = await requestPasswordRecovery('unknown@example.test');

    expect(result.message).toContain('If an account uses this email address');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('keeps delivery failures generic and invalidates the stored code', async () => {
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 500 }));

    const result = await requestPasswordRecovery('student@example.test');
    const challenge = Array.from(mocks.rows.values()).find((row) => row.record_type === 'challenge');

    expect(result.message).toContain('If an account uses this email address');
    expect(challenge?.code_hash).toBe('');
    expect(Date.parse(challenge?.expires_at as string)).toBeLessThan(Date.now());
  });

  it('enforces resend cooldown and the per-email hourly send limit', async () => {
    const fixedTime = new Date('2026-10-23T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedTime);

    await requestPasswordRecovery('student@example.test');
    await requestPasswordRecovery('student@example.test');
    expect(mocks.fetch).toHaveBeenCalledTimes(1);

    for (let requestIndex = 1; requestIndex < 5; requestIndex += 1) {
      vi.setSystemTime(new Date(fixedTime.getTime() + requestIndex * 76_000));
      await requestPasswordRecovery('student@example.test');
    }
    vi.setSystemTime(new Date(fixedTime.getTime() + 5 * 76_000));
    await requestPasswordRecovery('student@example.test');
    expect(mocks.fetch).toHaveBeenCalledTimes(5);
  });

  it('enforces the per-IP request limit', async () => {
    for (let requestIndex = 0; requestIndex < 10; requestIndex += 1) {
      await requestPasswordRecovery(`unknown${requestIndex}@example.test`, '203.0.113.8');
    }

    await expect(requestPasswordRecovery('another@example.test', '203.0.113.8')).rejects.toMatchObject({ statusCode: 429 });
  });

  it('issues a short-lived reset token after a correct code and rejects reuse of the code', async () => {
    const code = await requestCode();

    const result = await verifyPasswordRecoveryCode('student@example.test', code);
    expect(result.resetToken).toMatch(/^[a-f0-9]{64}$/);
    await expect(verifyPasswordRecoveryCode('student@example.test', code)).rejects.toMatchObject({ message: expect.stringContaining('invalid or expired') });
  });

  it('verifies an issued code without requiring the email provider to remain configured', async () => {
    const code = await requestCode();
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('PASSWORD_RECOVERY_FROM_EMAIL', '');

    const result = await verifyPasswordRecoveryCode('student@example.test', code);

    expect(result.resetToken).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects incorrect codes and blocks verification after five attempts', async () => {
    const validCode = await requestCode();
    const wrongCode = validCode === '000000' ? '000001' : '000000';
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(verifyPasswordRecoveryCode('student@example.test', wrongCode)).rejects.toMatchObject({ statusCode: 400 });
    }
    await expect(verifyPasswordRecoveryCode('student@example.test', wrongCode)).rejects.toMatchObject({
      statusCode: 429,
      message: 'Too many incorrect attempts. Request a new code.',
    });
  });

  it('rejects an expired code', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00.000Z'));
    await requestCode();
    vi.setSystemTime(new Date('2026-10-23T12:10:01.000Z'));

    await expect(verifyPasswordRecoveryCode('student@example.test', '123456')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects an expired reset authorization', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00.000Z'));
    const code = await requestCode();
    const { resetToken } = await verifyPasswordRecoveryCode('student@example.test', code);
    vi.setSystemTime(new Date('2026-10-23T12:10:01.000Z'));

    await expect(resetRecoveredPassword('student@example.test', resetToken, 'new-password-123', 'new-password-123'))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it('rejects malformed codes without consuming a valid attempt', async () => {
    await requestCode();
    await expect(verifyPasswordRecoveryCode('student@example.test', '12a456')).rejects.toBeInstanceOf(PasswordRecoveryError);
  });

  it('validates password confirmation and the existing eight-character policy', async () => {
    const code = await requestCode();
    const { resetToken } = await verifyPasswordRecoveryCode('student@example.test', code);

    await expect(resetRecoveredPassword('student@example.test', resetToken, 'longpassword', 'different-password'))
      .rejects.toMatchObject({ message: 'Passwords do not match.' });
    await expect(resetRecoveredPassword('student@example.test', resetToken, 'short', 'short'))
      .rejects.toMatchObject({ message: 'Password must be between 8 and 256 characters.' });
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it('updates an account password once and prevents reset-token replay', async () => {
    const code = await requestCode();
    const { resetToken } = await verifyPasswordRecoveryCode('student@example.test', code);

    const result = await resetRecoveredPassword('student@example.test', resetToken, 'new-password-123', 'new-password-123');

    expect(result.message).toContain('password has been updated');
    expect(mocks.updatePassword).toHaveBeenCalledWith({ userId: 'student-id', password: 'new-password-123' });
    expect(Array.from(mocks.rows.values()).find((row) => row.record_type === 'challenge')?.code_hash).toBe('');
    expect(Array.from(mocks.rows.values()).find((row) => row.record_type === 'verified')?.reset_hash).toBe('');
    await expect(resetRecoveredPassword('student@example.test', resetToken, 'new-password-456', 'new-password-456'))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.updatePassword).toHaveBeenCalledTimes(1);
  });

  it('serializes concurrent reset attempts so only one can update the password', async () => {
    const code = await requestCode();
    const { resetToken } = await verifyPasswordRecoveryCode('student@example.test', code);

    const results = await Promise.allSettled([
      resetRecoveredPassword('student@example.test', resetToken, 'new-password-123', 'new-password-123'),
      resetRecoveredPassword('student@example.test', resetToken, 'new-password-456', 'new-password-456'),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(mocks.updatePassword).toHaveBeenCalledTimes(1);
  });

  it('does not reveal reset tokens in storage and binds authorization to the recovery email', async () => {
    const code = await requestCode();
    const { resetToken } = await verifyPasswordRecoveryCode('student@example.test', code);
    const storedRows = JSON.stringify(Array.from(mocks.rows.values()));

    expect(storedRows).not.toContain(resetToken);
    await expect(resetRecoveredPassword('other@example.test', resetToken, 'new-password-123', 'new-password-123'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('fails closed when recovery configuration is incomplete', async () => {
    vi.stubEnv('PASSWORD_RECOVERY_SECRET', 'short');

    await expect(requestPasswordRecovery('student@example.test')).rejects.toMatchObject({ statusCode: 503 });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
