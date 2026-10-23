import 'server-only';

import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { Client, ID, Query, TablesDB, Users, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

const RECOVERY_TABLE_ID = 'password_recovery';
const CODE_TTL_MS = 10 * 60 * 1000;
const RESET_TTL_MS = 10 * 60 * 1000;
const EMAIL_COOLDOWN_MS = 60 * 1000;
const RATE_BUCKET_MS = 15 * 1000;
const IP_REQUEST_LIMIT = 10;
const MAX_CODE_ATTEMPTS = 5;
const REQUEST_CONFIRMATION = 'If an account uses this email address, recovery instructions will be sent if delivery is available.';
const INVALID_CODE = 'That code is invalid or expired. Request a new code and try again.';

export class PasswordRecoveryError extends Error {
  statusCode: 400 | 429 | 503;

  constructor(message: string, statusCode: PasswordRecoveryError['statusCode']) {
    super(message);
    this.name = 'PasswordRecoveryError';
    this.statusCode = statusCode;
  }
}

type RecoveryRow = Models.Row & {
  record_type?: string;
  user_id?: string;
  code_hash?: string;
  request_id?: string;
  reset_hash?: string;
  expires_at?: string;
  created_at?: string;
};

type RecoveryServices = { tables: TablesDB; users: Users; secret: string; databaseId: string };

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getServices(requireEmail = false): RecoveryServices {
  const apiKey = process.env.APPWRITE_PASSWORD_RECOVERY_API_KEY?.trim();
  const secret = process.env.PASSWORD_RECOVERY_SECRET?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.PASSWORD_RECOVERY_FROM_EMAIL?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId || !apiKey
    || !secret || Buffer.byteLength(secret) < 32 || (requireEmail && (!resendKey || !fromEmail))) {
    throw new PasswordRecoveryError('Password recovery is not configured. Please try again later.', 503);
  }

  const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey);
  return {
    tables: new TablesDB(client),
    users: new Users(client),
    secret,
    databaseId: appwriteConfig.databaseId,
  };
}

function digest(secret: string, value: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function rowId(secret: string, purpose: string, value: string) {
  return digest(secret, `${purpose}:${value}`).slice(0, 32);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizedEmail(value: unknown) {
  if (typeof value !== 'string') throw new PasswordRecoveryError('Enter a valid email address.', 400);
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PasswordRecoveryError('Enter a valid email address.', 400);
  }
  return email;
}

function ensurePassword(password: unknown, confirmation: unknown) {
  if (typeof password !== 'string' || typeof confirmation !== 'string' || password !== confirmation) {
    throw new PasswordRecoveryError('Passwords do not match.', 400);
  }
  if (password.length < 8 || password.length > 256) {
    throw new PasswordRecoveryError('Password must be between 8 and 256 characters.', 400);
  }
  return password;
}

function createRow(tables: TablesDB, id: string, data: Record<string, string | null>) {
  return tables.createRow({
    databaseId: appwriteConfig.databaseId,
    tableId: RECOVERY_TABLE_ID,
    rowId: id,
    permissions: [],
    data,
  });
}

async function getRow(tables: TablesDB, id: string): Promise<RecoveryRow | null> {
  try {
    return await tables.getRow<RecoveryRow>({ databaseId: appwriteConfig.databaseId, tableId: RECOVERY_TABLE_ID, rowId: id });
  } catch (error) {
    if (getErrorCode(error) === 404) return null;
    throw error;
  }
}

async function pruneExpiredRows(tables: TablesDB) {
  try {
    await tables.deleteRows({
      databaseId: appwriteConfig.databaseId,
      tableId: RECOVERY_TABLE_ID,
      queries: [Query.lessThan('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()), Query.limit(100)],
    });
  } catch {
    // Cleanup is best-effort; recovery must still work if the cleanup index is unavailable.
  }
}

async function reserveIpRequest(tables: TablesDB, secret: string, clientAddress?: string) {
  const address = clientAddress || 'unknown-client';
  const bucket = Math.floor(Date.now() / 60_000);
  for (let slot = 0; slot < IP_REQUEST_LIMIT; slot += 1) {
    const id = rowId(secret, 'ip-rate', `${address}:${bucket}:${slot}`);
    try {
      await createRow(tables, id, { record_type: 'ip_rate', created_at: new Date().toISOString() });
      return;
    } catch (error) {
      if (getErrorCode(error) !== 409) throw error;
    }
  }
  throw new PasswordRecoveryError('Too many recovery requests. Please wait a minute and try again.', 429);
}

async function reserveEmailCooldown(tables: TablesDB, secret: string, email: string) {
  const bucket = Math.floor(Date.now() / RATE_BUCKET_MS);
  for (let offset = 0; offset <= Math.ceil(EMAIL_COOLDOWN_MS / RATE_BUCKET_MS); offset += 1) {
    const recentId = rowId(secret, 'email-rate', `${email}:${bucket - offset}`);
    if (await getRow(tables, recentId)) return false;
  }

  const currentId = rowId(secret, 'email-rate', `${email}:${bucket}`);
  try {
    await createRow(tables, currentId, { record_type: 'email_rate', created_at: new Date().toISOString() });
  } catch (error) {
    if (getErrorCode(error) === 409) return false;
    throw error;
  }

  const hour = Math.floor(Date.now() / (60 * 60 * 1000));
  for (let slot = 0; slot < 5; slot += 1) {
    const hourlyId = rowId(secret, 'email-hourly', `${email}:${hour}:${slot}`);
    try {
      await createRow(tables, hourlyId, { record_type: 'email_hourly', created_at: new Date().toISOString() });
      return true;
    } catch (error) {
      if (getErrorCode(error) !== 409) throw error;
    }
  }
  return false;
}

async function findUserByEmail(users: Users, email: string) {
  const result = await users.list({ queries: [Query.equal('email', email), Query.limit(1)], total: false });
  return result.users.find((user) => user.email.toLowerCase() === email) ?? null;
}

async function sendCode(email: string, code: string) {
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.PASSWORD_RECOVERY_FROM_EMAIL?.trim(),
        to: [email],
        subject: 'Your IP Quest verification code',
        text: `Your IP Quest password recovery code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error('Email delivery failed.');
  }
  if (!response.ok) throw new Error('Email delivery failed.');
}

export async function requestPasswordRecovery(emailInput: unknown, clientAddress?: string) {
  const services = getServices(true);
  await pruneExpiredRows(services.tables);
  await reserveIpRequest(services.tables, services.secret, clientAddress);
  const email = normalizedEmail(emailInput);
  const emailDigest = digest(services.secret, `email:${email}`);
  if (!await reserveEmailCooldown(services.tables, services.secret, emailDigest)) {
    return { message: REQUEST_CONFIRMATION };
  }

  const user = await findUserByEmail(services.users, email);
  if (!user) return { message: REQUEST_CONFIRMATION };

  const id = rowId(services.secret, 'recovery', emailDigest);
  const requestId = ID.unique();
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
  const data = {
    record_type: 'challenge',
    user_id: user.$id,
    code_hash: digest(services.secret, `code:${requestId}:${code}`),
    request_id: requestId,
    reset_hash: '',
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  const current = await getRow(services.tables, id);
  if (current) {
    await services.tables.updateRow({ databaseId: services.databaseId, tableId: RECOVERY_TABLE_ID, rowId: id, data });
  } else {
    try {
      await createRow(services.tables, id, data);
    } catch (error) {
      if (getErrorCode(error) !== 409) throw error;
      await services.tables.updateRow({ databaseId: services.databaseId, tableId: RECOVERY_TABLE_ID, rowId: id, data });
    }
  }

  try {
    await sendCode(user.email, code);
  } catch {
    try {
      await services.tables.updateRow({
        databaseId: services.databaseId,
        tableId: RECOVERY_TABLE_ID,
        rowId: id,
        data: { code_hash: '', expires_at: new Date(0).toISOString() },
      });
    } catch {
      // The expired challenge remains unusable if cleanup fails.
    }
    return { message: REQUEST_CONFIRMATION };
  }

  return { message: REQUEST_CONFIRMATION };
}

async function claimCodeAttempt(tables: TablesDB, secret: string, requestId: string) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const id = rowId(secret, 'code-attempt', `${requestId}:${attempt}`);
    try {
      await createRow(tables, id, { record_type: 'code_attempt', request_id: requestId, created_at: new Date().toISOString() });
      return;
    } catch (error) {
      if (getErrorCode(error) !== 409) throw error;
    }
  }
  throw new PasswordRecoveryError('Too many incorrect attempts. Request a new code.', 429);
}

export async function verifyPasswordRecoveryCode(emailInput: unknown, codeInput: unknown) {
  const email = normalizedEmail(emailInput);
  if (typeof codeInput !== 'string' || !/^\d{6}$/.test(codeInput)) {
    throw new PasswordRecoveryError(INVALID_CODE, 400);
  }
  const services = getServices();
  await pruneExpiredRows(services.tables);
  const emailDigest = digest(services.secret, `email:${email}`);
  const activeId = rowId(services.secret, 'recovery', emailDigest);
  const active = await getRow(services.tables, activeId);
  if (!active?.user_id || !active.request_id || !active.code_hash || !active.expires_at || Date.parse(active.expires_at) <= Date.now()) {
    throw new PasswordRecoveryError(INVALID_CODE, 400);
  }

  const verifiedId = rowId(services.secret, 'verified', active.request_id);
  if (await getRow(services.tables, verifiedId)) throw new PasswordRecoveryError(INVALID_CODE, 400);
  await claimCodeAttempt(services.tables, services.secret, active.request_id);
  const candidateHash = digest(services.secret, `code:${active.request_id}:${codeInput}`);
  if (!safeEqual(active.code_hash, candidateHash)) throw new PasswordRecoveryError(INVALID_CODE, 400);

  const token = randomBytes(32).toString('hex');
  const tokenHash = digest(services.secret, `reset:${active.request_id}:${token}`);
  try {
    await createRow(services.tables, verifiedId, {
      record_type: 'verified',
      user_id: active.user_id,
      request_id: active.request_id,
      reset_hash: tokenHash,
      expires_at: new Date(Date.now() + RESET_TTL_MS).toISOString(),
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    if (getErrorCode(error) === 409) throw new PasswordRecoveryError(INVALID_CODE, 400);
    throw error;
  }

  return { resetToken: token };
}

export async function resetRecoveredPassword(emailInput: unknown, tokenInput: unknown, passwordInput: unknown, confirmationInput: unknown) {
  const email = normalizedEmail(emailInput);
  const password = ensurePassword(passwordInput, confirmationInput);
  if (typeof tokenInput !== 'string' || !/^[a-f0-9]{64}$/.test(tokenInput)) {
    throw new PasswordRecoveryError('Reset authorization is invalid or expired. Start again.', 400);
  }
  const services = getServices();
  await pruneExpiredRows(services.tables);
  const emailDigest = digest(services.secret, `email:${email}`);
  const activeId = rowId(services.secret, 'recovery', emailDigest);
  const active = await getRow(services.tables, activeId);
  if (!active?.user_id || !active.request_id) throw new PasswordRecoveryError('Reset authorization is invalid or expired. Start again.', 400);

  const verifiedId = rowId(services.secret, 'verified', active.request_id);
  const verified = await getRow(services.tables, verifiedId);
  if (!verified?.user_id || verified.user_id !== active.user_id || !verified.reset_hash || !verified.expires_at
    || Date.parse(verified.expires_at) <= Date.now()) {
    throw new PasswordRecoveryError('Reset authorization is invalid or expired. Start again.', 400);
  }
  const tokenHash = digest(services.secret, `reset:${active.request_id}:${tokenInput}`);
  if (!safeEqual(verified.reset_hash, tokenHash)) {
    throw new PasswordRecoveryError('Reset authorization is invalid or expired. Start again.', 400);
  }

  const transaction = await services.tables.createTransaction({ ttl: 30 });
  const claimId = rowId(services.secret, 'reset-claim', tokenHash);
  try {
    await services.tables.createRow({
      databaseId: services.databaseId,
      tableId: RECOVERY_TABLE_ID,
      rowId: claimId,
      permissions: [],
      transactionId: transaction.$id,
      data: { record_type: 'reset_claim', user_id: active.user_id, request_id: active.request_id, created_at: new Date().toISOString() },
    });
    await services.tables.updateRow({
      databaseId: services.databaseId,
      tableId: RECOVERY_TABLE_ID,
      rowId: activeId,
      transactionId: transaction.$id,
      data: { code_hash: '', expires_at: new Date(0).toISOString() },
    });
    await services.tables.updateRow({
      databaseId: services.databaseId,
      tableId: RECOVERY_TABLE_ID,
      rowId: verifiedId,
      transactionId: transaction.$id,
      data: { reset_hash: '', expires_at: new Date(0).toISOString() },
    });
    await services.tables.updateTransaction({ transactionId: transaction.$id, commit: true });
  } catch (error) {
    try {
      await services.tables.updateTransaction({ transactionId: transaction.$id, rollback: true });
    } catch {
      // Appwrite expires uncommitted transactions automatically.
    }
    if (getErrorCode(error) === 409) throw new PasswordRecoveryError('Reset authorization has already been used.', 400);
    throw error;
  }

  try {
    await services.users.updatePassword({ userId: active.user_id, password });
  } catch {
    throw new PasswordRecoveryError('Unable to update the password. Request a new recovery code and try again.', 503);
  }

  return { message: 'Your password has been updated. You can now log in.' };
}
