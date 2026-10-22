import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  accountGet: vi.fn(),
  getRow: vi.fn(),
  createRow: vi.fn(),
  profileRole: 'teacher',
  isTeamMember: vi.fn(),
  addTeamMember: vi.fn(),
  removeTeamMember: vi.fn(),
}));

vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'project-test',
    databaseId: 'database-test',
  },
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/server/teachers', () => ({
  isTeacherTeamMember: mocks.isTeamMember,
  addUserToTeachersTeam: mocks.addTeamMember,
  removeTeacherTeamMembership: mocks.removeTeamMember,
}));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setJWT() { return this; }
    setKey() { return this; }
  }
  class MockAccount {
    constructor() {}
    get() { return mocks.accountGet(); }
  }
  class MockTablesDB {
    getRow(params: unknown) { return mocks.getRow(params); }
    createRow(params: unknown) { return mocks.createRow(params); }
  }
  return {
    Account: MockAccount,
    Client: MockClient,
    ID: { unique: () => 'generated-id' },
    Permission: {
      read: (role: string) => `read(${role})`,
      update: (role: string) => `update(${role})`,
      delete: (role: string) => `delete(${role})`,
    },
    Role: { user: (userId: string) => `user:${userId}` },
    TablesDB: MockTablesDB,
  };
});

import { GET, POST } from '@/app/api/auth/profile/route';

function request(method: 'GET' | 'POST', body?: unknown, authorization = 'Bearer valid-jwt') {
  return new Request('http://localhost/api/auth/profile', {
    method,
    headers: { Authorization: authorization, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'test-api-key');
  vi.stubEnv('APPWRITE_ADMIN_USER_ID', '');
  mocks.isTeamMember.mockResolvedValue(false);
  mocks.addTeamMember.mockResolvedValue({ membershipId: 'membership-1', created: true });
  mocks.removeTeamMember.mockResolvedValue(undefined);
  mocks.accountGet.mockResolvedValue({ $id: 'authenticated-user', email: 'user@example.test' });
  mocks.getRow.mockImplementation(async () => {
    throw Object.assign(new Error('Profile not found'), { code: 404 });
  });
  mocks.createRow.mockImplementation(async (params: { rowId: string; data: Record<string, unknown> }) => ({
    $id: params.rowId,
    ...params.data,
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('server-side profile roles', () => {
  it('creates student profiles using the authenticated user ID', async () => {
    const response = await POST(request('POST', { displayName: 'Learner', role: 'student', userId: 'forged-user' }));
    const result = await response.json();
    const params = mocks.createRow.mock.calls[0][0] as { rowId: string; data: Record<string, unknown>; permissions: string[] };

    expect(response.status).toBe(201);
    expect(result.profile.role).toBe('student');
    expect(params.rowId).toBe('authenticated-user');
    expect(params.data.user_id).toBe('authenticated-user');
    expect(params.data.role).toBe('student');
    expect(mocks.addTeamMember).not.toHaveBeenCalled();
    expect(params.permissions).toEqual([
      'read(user:authenticated-user)',
      'update(user:authenticated-user)',
      'delete(user:authenticated-user)',
    ]);
  });

  it('stores teacher signup without adding the account to the approval allowlist', async () => {
    const response = await POST(request('POST', { displayName: 'Teacher Applicant', role: 'teacher' }));
    const params = mocks.createRow.mock.calls[0][0] as { data: Record<string, unknown> };

    expect(response.status).toBe(201);
    expect(params.data.role).toBe('teacher');
    expect(mocks.addTeamMember).toHaveBeenCalledWith('authenticated-user');
    expect(mocks.isTeamMember).toHaveBeenCalledWith('valid-jwt');
  });

  it('rejects a missing role and roles outside Student or Teacher', async () => {
    const missing = await POST(request('POST', { displayName: 'No Role' }));
    const invalid = await POST(request('POST', { displayName: 'Admin', role: 'admin' }));

    expect(missing.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('requires an authenticated Appwrite account for profile creation', async () => {
    const response = await POST(request('POST', { displayName: 'Learner', role: 'student' }, ''));

    expect(response.status).toBe(401);
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('does not enroll an account with an existing profile by replaying signup', async () => {
    mocks.getRow.mockResolvedValueOnce({ $id: 'authenticated-user', role: 'student' });

    const response = await POST(request('POST', { displayName: 'Promote me', role: 'teacher' }));

    expect(response.status).toBe(409);
    expect(mocks.addTeamMember).not.toHaveBeenCalled();
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('removes newly created teacher membership if profile creation fails', async () => {
    mocks.createRow.mockRejectedValue(new Error('profile write failed'));

    const response = await POST(request('POST', { displayName: 'Teacher Applicant', role: 'teacher' }));

    expect(response.status).toBe(500);
    expect(mocks.addTeamMember).toHaveBeenCalledWith('authenticated-user');
    expect(mocks.removeTeamMember).toHaveBeenCalledWith('membership-1');
  });

  it('preserves a stored teacher role while withholding effective teacher access', async () => {
    mocks.profileRole = 'teacher';
    mocks.getRow.mockResolvedValueOnce({
      $id: 'authenticated-user',
      user_id: 'authenticated-user',
      display_name: 'Existing User',
      role: mocks.profileRole,
    });

    const response = await GET(request('GET'));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.accountRole).toBe('teacher');
    expect(result.profile.role).toBe('teacher');
    expect(result.role).toBe('student');
  });

  it('grants effective teacher role only when authenticated team membership exists', async () => {
    mocks.isTeamMember.mockResolvedValue(true);
    mocks.profileRole = 'student';
    mocks.getRow.mockResolvedValueOnce({
      $id: 'authenticated-user',
      user_id: 'authenticated-user',
      display_name: 'Existing User',
      role: mocks.profileRole,
    });

    const response = await GET(request('GET'));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.accountRole).toBe('teacher');
    expect(result.role).toBe('teacher');
  });

  it('grants admin role only when the authenticated account ID matches the server allowlist', async () => {
  vi.stubEnv('APPWRITE_ADMIN_USER_ID', 'authenticated-user');
  mocks.profileRole = 'student';
  mocks.getRow.mockResolvedValueOnce({
    $id: 'authenticated-user',
    user_id: 'authenticated-user',
    display_name: 'Allowlisted Admin',
    role: 'student',
  });

  const response = await GET(request('GET'));
  const result = await response.json();

  expect(response.status).toBe(200);
  expect(result.role).toBe('admin');
  expect(result.accountRole).toBe('admin');
  expect(result.profile.role).toBe('admin');
  });

  it('does not grant admin role from an editable profile role alone', async () => {
  mocks.profileRole = 'admin';
  mocks.getRow.mockResolvedValueOnce({
    $id: 'authenticated-user',
    user_id: 'authenticated-user',
    display_name: 'Untrusted Admin Role',
    role: 'admin',
  });

  const response = await GET(request('GET'));
  const result = await response.json();

  expect(response.status).toBe(200);
  expect(result.role).toBe('student');
  expect(result.accountRole).toBe('student');
  });
});
