import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyQuizTeacher: vi.fn(),
  verifyAdminIdentity: vi.fn(),
  usersList: vi.fn(),
  usersGet: vi.fn(),
  getRow: vi.fn(),
  listRows: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  LevelQuizError: class extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  AdminAuthorizationError: class extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    endpoint: 'https://appwrite.test/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
  },
}));
vi.mock('@/lib/server/level-quiz', () => ({
  LevelQuizError: mocks.LevelQuizError,
  verifyQuizTeacher: mocks.verifyQuizTeacher,
}));
vi.mock('@/lib/server/admin-auth', () => ({
  AdminAuthorizationError: mocks.AdminAuthorizationError,
  verifyAdminIdentity: mocks.verifyAdminIdentity,
}));
vi.mock('node-appwrite', () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  }
  class MockTablesDB {
    getRow(params: unknown) { return mocks.getRow(params); }
    listRows(params: unknown) { return mocks.listRows(params); }
    createRow(params: unknown) { return mocks.createRow(params); }
    updateRow(params: unknown) { return mocks.updateRow(params); }
  }
  class MockUsers {
    list(params: unknown) { return mocks.usersList(params); }
    get(params: unknown) { return mocks.usersGet(params); }
  }
  return {
    Client: MockClient,
    ID: { unique: () => 'assignment-generated' },
    Query: {
      equal: (key: string, value: unknown) => `equal:${key}:${String(value)}`,
      limit: (value: number) => `limit:${value}`,
      cursorAfter: (value: string) => `cursorAfter:${value}`,
    },
    TablesDB: MockTablesDB,
    Users: MockUsers,
  };
});

import { GET as adminGet, POST as adminPost } from '@/app/api/admin/teacher-assignments/route';
import { POST as teacherPost } from '@/app/api/teacher/assignments/route';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { LevelQuizError } from '@/lib/server/level-quiz';
import {
  decideTeacherAssignment,
  listTeacherAssignmentsForAdmin,
  requestStudentAssignment,
  TeacherAssignmentError,
} from '@/lib/server/teacher-assignments';

const teacher = { $id: 'teacher-authenticated-id', email: 'teacher@example.test' };
const student = { $id: 'student-resolved-id', email: 'student@example.test' };
const admin = { $id: 'admin-authenticated-id', email: 'admin@example.test' };
const assignment = {
  $id: 'assignment-1',
  teacher_id: teacher.$id,
  student_id: student.$id,
  status: 'pending',
  requested_at: '2026-01-01T00:00:00.000Z',
};

function request(url: string, method: string, body?: unknown, authorization = 'Bearer valid-jwt') {
  return new Request(url, {
    method,
    headers: { Authorization: authorization, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APPWRITE_QUIZ_API_KEY', 'test-api-key');
  vi.stubEnv('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID', '6ad8d25c002985fc2093');
  mocks.verifyQuizTeacher.mockResolvedValue(teacher);
  mocks.verifyAdminIdentity.mockResolvedValue(admin);
  mocks.usersList.mockResolvedValue({ users: [student] });
  mocks.usersGet.mockImplementation(async ({ userId }: { userId: string }) => ({
    $id: userId,
    email: userId === teacher.$id ? teacher.email : student.email,
  }));
  mocks.getRow.mockResolvedValue({
    $id: student.$id,
    user_id: student.$id,
    role: 'student',
  });
  mocks.listRows.mockResolvedValue({ rows: [] });
  mocks.createRow.mockImplementation(async (params: { rowId: string; data: Record<string, unknown> }) => ({
    $id: params.rowId,
    ...params.data,
  }));
  mocks.updateRow.mockImplementation(async (params: { rowId: string; data: Record<string, unknown> }) => ({
    $id: params.rowId,
    ...params.data,
  }));
});

describe('teacher assignment requests', () => {
  it('rejects unauthenticated requests before account lookup', async () => {
    const response = await teacherPost(request('http://localhost/api/teacher/assignments', 'POST', { email: student.email }, ''));

    expect(response.status).toBe(401);
    expect(mocks.verifyQuizTeacher).not.toHaveBeenCalled();
    expect(mocks.usersList).not.toHaveBeenCalled();
  });

  it('verifies teacher membership before parsing a malformed request body', async () => {
    mocks.verifyQuizTeacher.mockRejectedValue(new LevelQuizError('Teacher team membership is required.', 403));
    const response = await teacherPost(new Request('http://localhost/api/teacher/assignments', {
      method: 'POST',
      headers: { Authorization: 'Bearer non-teacher-jwt' },
      body: '{invalid-json',
    }));

    expect(response.status).toBe(403);
    expect(mocks.verifyQuizTeacher).toHaveBeenCalledWith('non-teacher-jwt');
    expect(mocks.usersList).not.toHaveBeenCalled();
  });

  it('derives teacher and student IDs server-side and creates only a pending request', async () => {
    const response = await teacherPost(request('http://localhost/api/teacher/assignments', 'POST', {
      email: student.email,
      teacherId: 'forged-teacher',
      studentId: 'forged-student',
      role: 'admin',
    }));
    const payload = await response.json();
    const write = mocks.createRow.mock.calls[0][0] as { tableId: string; rowId: string; data: Record<string, unknown> };

    expect(response.status).toBe(202);
    expect(mocks.verifyQuizTeacher).toHaveBeenCalledWith('valid-jwt');
    expect(write.tableId).toBe('6ad8d25c002985fc2093');
    expect(write.data).toMatchObject({
      teacher_id: teacher.$id,
      student_id: student.$id,
      status: 'pending',
    });
    expect(write.data).not.toHaveProperty('role');
    expect(write.data).not.toHaveProperty('email');
    expect(write.data).not.toHaveProperty('reviewed_by');
    expect(write.data).not.toHaveProperty('reviewed_at');
    expect(Number.isNaN(Date.parse(String(write.data.requested_at)))).toBe(false);
    expect(payload.status).toBe('pending');
  });

  it('creates a pending row that the administrator queue can read', async () => {
    const savedRows: Array<Record<string, unknown>> = [];
    mocks.listRows.mockImplementation(async (rawParams: unknown) => {
      const params = rawParams as { queries: string[] };
      const teacherFilter = params.queries.find((query) => query.startsWith('equal:teacher_id:'))?.slice('equal:teacher_id:'.length);
      const studentFilter = params.queries.find((query) => query.startsWith('equal:student_id:'))?.slice('equal:student_id:'.length);
      const rows = savedRows.filter((row) =>
        (!teacherFilter || row.teacher_id === teacherFilter) &&
        (!studentFilter || row.student_id === studentFilter),
      );
      return { rows };
    });
    mocks.createRow.mockImplementation(async (rawParams: unknown) => {
      const params = rawParams as { rowId: string; data: Record<string, unknown> };
      const row = { $id: params.rowId, ...params.data };
      savedRows.push(row);
      return row;
    });

    const teacherResponse = await teacherPost(request('http://localhost/api/teacher/assignments', 'POST', { email: student.email }));
    const teacherPayload = await teacherResponse.json();
    const queueResponse = await adminGet(request('http://localhost/api/admin/teacher-assignments', 'GET'));
    const queuePayload = await queueResponse.json();

    expect(teacherResponse.status).toBe(202);
    expect(teacherPayload.status).toBe('pending');
    expect(savedRows).toHaveLength(1);
    expect(savedRows[0]).toMatchObject({
      teacher_id: teacher.$id,
      student_id: student.$id,
      status: 'pending',
    });
    expect(queueResponse.status).toBe(200);
    expect(queuePayload.assignments).toHaveLength(1);
    expect(queuePayload.assignments[0]).toMatchObject({
      assignmentId: savedRows[0].$id,
      teacherId: teacher.$id,
      studentId: student.$id,
      status: 'pending',
    });
  });

  it('does not report request success when Appwrite rejects the assignment write', async () => {
    mocks.createRow.mockRejectedValue(Object.assign(new Error('private Appwrite detail'), {
      code: 401,
      type: 'general_unauthorized_scope',
    }));

    const response = await teacherPost(request('http://localhost/api/teacher/assignments', 'POST', { email: student.email }));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toContain('server API key or table permissions');
    expect(payload.error).not.toContain('private Appwrite detail');
    expect(payload).not.toHaveProperty('status', 'pending');
  });

  it('fails closed when the assignment table ID is not configured', async () => {
    vi.stubEnv('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID', '');

    await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID is not configured.',
    });
    expect(mocks.usersList).not.toHaveBeenCalled();
    expect(mocks.listRows).not.toHaveBeenCalled();
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('requires a valid student profile before creating an assignment', async () => {
    mocks.getRow.mockResolvedValueOnce({
      $id: student.$id,
      user_id: student.$id,
      role: 'teacher',
    });

    await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('uses the same safe response for unknown accounts and non-student profiles', async () => {
    mocks.usersList.mockResolvedValueOnce({ users: [] });
    const missingAccount = await requestStudentAssignment('teacher-jwt', student.email).catch((error: unknown) => error);

    mocks.usersList.mockResolvedValueOnce({ users: [student] });
    mocks.getRow.mockResolvedValueOnce({
      $id: student.$id,
      user_id: student.$id,
      role: 'teacher',
    });
    const ineligibleProfile = await requestStudentAssignment('teacher-jwt', student.email).catch((error: unknown) => error);

    expect(missingAccount).toMatchObject({
      statusCode: 404,
      message: 'Unable to process an access request for this email. Check the address and try again.',
    });
    expect(ineligibleProfile).toMatchObject({
      statusCode: 404,
      message: 'Unable to process an access request for this email. Check the address and try again.',
    });
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it('reports the required Users API scope when Appwrite denies user lookup for scope', async () => {
    mocks.usersList.mockRejectedValue(Object.assign(new Error('not exposed'), {
      code: 401,
      type: 'general_unauthorized_scope',
    }));

    await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({
      statusCode: 503,
      message: 'APPWRITE_QUIZ_API_KEY needs the users.read scope to look up a student by email.',
    });
    expect(mocks.getRow).not.toHaveBeenCalled();
    expect(mocks.listRows).not.toHaveBeenCalled();
  });

  it.each(['pending', 'approved'])(
    'does not create another row when the pair is already %s',
    async (status) => {
      mocks.listRows.mockResolvedValueOnce({ rows: [{ ...assignment, status }] });

      await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({ statusCode: 409 });
      expect(mocks.createRow).not.toHaveBeenCalled();
      expect(mocks.updateRow).not.toHaveBeenCalled();
    },
  );

  it.each(['pending', 'approved'] as const)(
    'returns the current %s state for a repeated request',
    async (status) => {
      mocks.listRows.mockResolvedValueOnce({ rows: [{ ...assignment, status }] });
      const response = await teacherPost(request('http://localhost/api/teacher/assignments', 'POST', { email: student.email }));
      const payload = await response.json();

      expect(response.status).toBe(409);
      expect(payload.assignmentStatus).toBe(status);
    },
  );

  it.each(['rejected', 'revoked'])(
    'reopens the existing %s row as pending instead of creating a duplicate',
    async (status) => {
      mocks.listRows.mockResolvedValueOnce({ rows: [{ ...assignment, status }] });

      const result = await requestStudentAssignment('teacher-jwt', student.email);
      const update = mocks.updateRow.mock.calls[0][0] as { rowId: string; tableId: string; data: Record<string, unknown> };

      expect(result.status).toBe('pending');
      expect(update.rowId).toBe(assignment.$id);
      expect(update.tableId).toBe('6ad8d25c002985fc2093');
      expect(update.data.status).toBe('pending');
      expect(update.data).not.toHaveProperty('reviewed_by');
      expect(update.data).not.toHaveProperty('reviewed_at');
      expect(mocks.createRow).not.toHaveBeenCalled();
    },
  );

  it('fails closed on duplicate pair rows or unavailable assignment storage', async () => {
    mocks.listRows.mockResolvedValueOnce({ rows: [assignment, { ...assignment, $id: 'duplicate' }] });
    await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({ statusCode: 503 });

    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      mocks.listRows.mockRejectedValueOnce(Object.assign(new Error('Table missing'), { code: 404, type: 'table_not_found' }));
      await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({ statusCode: 503 });
    } finally {
      logSpy.mockRestore();
    }
  });

  it('distinguishes a missing table from a table that has unreadable schema', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      mocks.listRows.mockRejectedValueOnce(Object.assign(new Error('hidden raw message'), { code: 404, type: 'table_not_found' }));
      await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({
        statusCode: 503,
        message: expect.stringContaining('Verify APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID'),
      });

      mocks.listRows.mockRejectedValueOnce(Object.assign(new Error('hidden raw message'), { code: 400, type: 'attribute_not_found' }));
      await expect(requestStudentAssignment('teacher-jwt', student.email)).rejects.toMatchObject({
        statusCode: 503,
        message: expect.stringContaining('schema or indexes do not support'),
      });

      const logText = JSON.stringify(logSpy.mock.calls);
      expect(logText).toContain('query-pair');
      expect(logText).toContain('table_not_found');
      expect(logText).not.toContain(teacher.$id);
      expect(logText).not.toContain(student.$id);
      expect(logText).not.toContain(teacher.email);
      expect(logText).not.toContain(student.email);
      expect(logText).not.toContain('hidden raw message');
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe('administrator assignment review', () => {
  it('checks the allowlisted administrator on every admin GET', async () => {
    mocks.listRows.mockResolvedValueOnce({ rows: [assignment] });

    const response = await adminGet(request('http://localhost/api/admin/teacher-assignments', 'GET'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.verifyAdminIdentity).toHaveBeenCalledWith('valid-jwt');
    expect((mocks.listRows.mock.calls[0][0] as { tableId: string }).tableId).toBe('6ad8d25c002985fc2093');
    expect(payload.assignments[0]).toMatchObject({
      assignmentId: assignment.$id,
      teacherId: teacher.$id,
      studentId: student.$id,
      teacherEmail: teacher.email,
      studentEmail: student.email,
    });
  });

  it('returns actionable safe diagnostics when assignment listing lacks scope or table storage', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      mocks.listRows.mockRejectedValueOnce(Object.assign(new Error('hidden raw message'), { code: 401, type: 'general_unauthorized_scope' }));
      await expect(listTeacherAssignmentsForAdmin()).rejects.toMatchObject({
        statusCode: 503,
        message: expect.stringContaining('server API key or table permissions'),
      });
      expect(JSON.stringify(logSpy.mock.calls)).not.toContain('hidden raw message');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('denies unauthorized admin GET and POST before reading or changing assignments', async () => {
    mocks.verifyAdminIdentity.mockRejectedValue(new AdminAuthorizationError('Administrator access is required.', 403));

    const getResponse = await adminGet(request('http://localhost/api/admin/teacher-assignments', 'GET'));
    const postResponse = await adminPost(request('http://localhost/api/admin/teacher-assignments', 'POST', {
      assignmentId: assignment.$id,
      decision: 'approve',
    }));

    expect(getResponse.status).toBe(403);
    expect(postResponse.status).toBe(403);
    expect(mocks.verifyAdminIdentity).toHaveBeenCalledTimes(2);
    expect(mocks.getRow).not.toHaveBeenCalled();
    expect(mocks.updateRow).not.toHaveBeenCalled();
  });

  it('verifies admin identity before parsing a malformed admin POST body', async () => {
    mocks.verifyAdminIdentity.mockRejectedValue(new AdminAuthorizationError('Administrator access is required.', 403));
    const response = await adminPost(new Request('http://localhost/api/admin/teacher-assignments', {
      method: 'POST',
      headers: { Authorization: 'Bearer non-admin-jwt' },
      body: '{invalid-json',
    }));

    expect(response.status).toBe(403);
    expect(mocks.verifyAdminIdentity).toHaveBeenCalledWith('non-admin-jwt');
    expect(mocks.getRow).not.toHaveBeenCalled();
    expect(mocks.updateRow).not.toHaveBeenCalled();
  });

  it('records the authenticated admin ID when approving a pending row', async () => {
    mocks.getRow.mockResolvedValueOnce(assignment);

    const response = await adminPost(request('http://localhost/api/admin/teacher-assignments', 'POST', {
      assignmentId: assignment.$id,
      decision: 'approve',
      adminId: 'forged-admin-id',
      teacherId: 'forged-teacher-id',
      studentId: 'forged-student-id',
    }));
    const update = mocks.updateRow.mock.calls[0][0] as { rowId: string; tableId: string; data: Record<string, unknown> };

    expect(response.status).toBe(200);
    expect(mocks.verifyAdminIdentity).toHaveBeenCalledWith('valid-jwt');
    expect((mocks.getRow.mock.calls[0][0] as { tableId: string }).tableId).toBe('6ad8d25c002985fc2093');
    expect(update.rowId).toBe(assignment.$id);
    expect(update.tableId).toBe('6ad8d25c002985fc2093');
    expect(update.data.status).toBe('approved');
    expect(update.data.reviewed_by).toBe(admin.$id);
    expect(update.data.reviewed_by).not.toBe('forged-admin-id');
    expect(update.data).not.toHaveProperty('teacher_id');
    expect(update.data).not.toHaveProperty('student_id');
  });

  it.each([
    ['approve', 'rejected'],
    ['reject', 'approved'],
    ['revoke', 'pending'],
  ] as const)('rejects %s when the current assignment is %s', async (decision, status) => {
    mocks.getRow.mockResolvedValueOnce({ ...assignment, status });

    await expect(decideTeacherAssignment(admin.$id, assignment.$id, decision))
      .rejects.toBeInstanceOf(TeacherAssignmentError);
    expect(mocks.updateRow).not.toHaveBeenCalled();
  });

  it('permits rejection of pending and revocation of approved rows', async () => {
    mocks.getRow.mockResolvedValueOnce(assignment);
    await expect(decideTeacherAssignment(admin.$id, assignment.$id, 'reject'))
      .resolves.toMatchObject({ status: 'rejected' });

    mocks.getRow.mockResolvedValueOnce({ ...assignment, status: 'approved' });
    await expect(decideTeacherAssignment(admin.$id, assignment.$id, 'revoke'))
      .resolves.toMatchObject({ status: 'revoked' });
  });
});
