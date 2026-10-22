import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createEmailPasswordSession: vi.fn(),
  createJWT: vi.fn(),
  get: vi.fn(),
  deleteSession: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('appwrite', () => ({
  Account: class {
    createEmailPasswordSession(...args: unknown[]) { return mocks.createEmailPasswordSession(...args); }
    createJWT() { return mocks.createJWT(); }
    get() { return mocks.get(); }
    deleteSession(...args: unknown[]) { return mocks.deleteSession(...args); }
  },
  ID: { unique: () => 'generated-user-id' },
}));
vi.mock('@/lib/appwrite', () => ({
  getAppwriteClient: () => ({}),
}));

import { getCurrentDestination, getCurrentProfile, login, matchesLoginRole } from '@/lib/auth';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createEmailPasswordSession.mockResolvedValue({ $id: 'session-1' });
  mocks.createJWT.mockResolvedValue({ jwt: 'current-user-jwt' });
  mocks.get.mockResolvedValue({ $id: 'user-1', email: 'student@example.test' });
  mocks.fetch.mockResolvedValue(new Response(JSON.stringify({
    role: 'student',
    accountRole: 'student',
    profile: { $id: 'user-1', user_id: 'user-1', display_name: 'Student', role: 'student' },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', mocks.fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('authentication regressions', () => {
  it('continues to create an Appwrite email/password session', async () => {
    await expect(login({ email: 'student@example.test', password: 'password123' })).resolves.toEqual({ $id: 'session-1' });
    expect(mocks.createEmailPasswordSession).toHaveBeenCalledWith('student@example.test', 'password123');
  });

  it('uses the JWT-validated server profile role instead of a client profile role', async () => {
    await expect(getCurrentProfile()).resolves.toMatchObject({ role: 'student', profile: { user_id: 'user-1' } });
    expect(mocks.fetch).toHaveBeenCalledWith('/api/auth/profile', {
      headers: { Authorization: 'Bearer current-user-jwt' },
    });
  });

  it('routes an approved teacher based on the server response', async () => {
    const payload = JSON.stringify({
      role: 'teacher',
      accountRole: 'teacher',
      profile: { $id: 'user-1', user_id: 'user-1', display_name: 'Teacher', role: 'teacher' },
    });
    mocks.fetch.mockImplementation(async () => new Response(payload, { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const profile = await getCurrentProfile();
    expect(profile).toMatchObject({ role: 'teacher', accountRole: 'teacher', profile: { role: 'teacher' } });
    expect(matchesLoginRole(profile, 'teacher')).toBe(true);
    expect(matchesLoginRole(profile, 'student')).toBe(false);
    await expect(getCurrentDestination()).resolves.toBe('/teacher');
  });

  it('routes a server-allowlisted administrator to the admin hub', async () => {
    const payload = JSON.stringify({
      role: 'admin',
      accountRole: 'admin',
      profile: { $id: 'user-1', user_id: 'user-1', display_name: 'Admin', role: 'admin' },
    });
    mocks.fetch.mockImplementation(async () => new Response(payload, { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const profile = await getCurrentProfile();
    expect(matchesLoginRole(profile, 'admin')).toBe(true);
    expect(matchesLoginRole(profile, 'student')).toBe(false);
    expect(matchesLoginRole(profile, 'teacher')).toBe(false);
    await expect(getCurrentDestination()).resolves.toBe('/admin');
  });

  it('preserves an unprovisioned teacher account role and routes to setup', async () => {
    const payload = JSON.stringify({
      role: 'student',
      accountRole: 'teacher',
      profile: { $id: 'user-1', user_id: 'user-1', display_name: 'Teacher', role: 'teacher' },
    });
    mocks.fetch.mockImplementation(async () => new Response(payload, { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const profile = await getCurrentProfile();
    expect(profile).toMatchObject({ role: 'student', accountRole: 'teacher', profile: { role: 'teacher' } });
    expect(matchesLoginRole(profile, 'teacher')).toBe(true);
    expect(matchesLoginRole(profile, 'student')).toBe(false);
    await expect(getCurrentDestination()).resolves.toBe('/teacher/setup');
  });
});
