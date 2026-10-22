import 'server-only';

import { Client, ID, Query, TablesDB, Users, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { LevelQuizError, verifyQuizTeacher } from '@/lib/server/level-quiz';

const profilesTableId = 'profiles';

export type AssignmentStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
export type AssignmentDecision = 'approve' | 'reject' | 'revoke';

type AssignmentRow = Models.Row & {
  teacher_id?: string;
  student_id?: string;
  status?: string;
  requested_at?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

type StudentProfile = Models.Row & {
  user_id?: string;
  role?: unknown;
};

export class TeacherAssignmentError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 409 | 500 | 503;
  assignmentStatus?: AssignmentStatus;

  constructor(message: string, statusCode: TeacherAssignmentError['statusCode'], assignmentStatus?: AssignmentStatus) {
    super(message);
    this.name = 'TeacherAssignmentError';
    this.statusCode = statusCode;
    this.assignmentStatus = assignmentStatus;
  }
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function getErrorType(error: unknown) {
  return typeof error === 'object' && error !== null && 'type' in error && typeof error.type === 'string'
    ? error.type
    : 'unknown';
}

function mapAssignmentStorageError(error: unknown, operation: string, fallback: string) {
  const code = getErrorCode(error);
  const type = getErrorType(error);
  console.error('[teacher-assignments] Appwrite operation failed', { operation, code, type });

  if (type === 'table_not_found') {
    return new TeacherAssignmentError(
      'The configured assignment table was not found. Verify APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID and the database.',
      503,
    );
  }
  if (code === 401 || code === 403 || type === 'general_unauthorized_scope') {
    return new TeacherAssignmentError(
      'The server API key or table permissions do not allow this assignment operation. Check the required TablesDB scopes and closed-table server access.',
      503,
    );
  }
  if (code === 400 || type === 'attribute_not_found' || type === 'general_query_invalid' || type === 'index_not_found') {
    return new TeacherAssignmentError(
      'The assignment table schema or indexes do not support this operation. Verify the required columns, types, and indexes.',
      503,
    );
  }
  return new TeacherAssignmentError(fallback, 500);
}

function getAssignmentsTableId() {
  const tableId = process.env.APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID?.trim();
  if (!tableId) {
    throw new TeacherAssignmentError('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID is not configured.', 503);
  }
  return tableId;
}

function getPrivilegedClient() {
  getAssignmentsTableId();
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!apiKey || !appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
    throw new TeacherAssignmentError('Assignment storage is not configured.', 503);
  }
  return new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey);
}

function unavailableAssignmentStorage() {
  return new TeacherAssignmentError('Assignment storage is unavailable. Configure teacher_student_assignments before using this feature.', 503);
}

async function verifyTeacher(jwt: string) {
  try {
    return await verifyQuizTeacher(jwt);
  } catch (error) {
    if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
      throw new TeacherAssignmentError(error.message, error.statusCode);
    }
    throw new TeacherAssignmentError('Unable to verify teacher access.', 500);
  }
}

async function findStudent(emailInput: string, users: Users, tablesDb: TablesDB) {
  const email = emailInput.trim().toLocaleLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TeacherAssignmentError('Enter a valid student email address.', 400);
  }

  let user: Models.User<Models.Preferences> | undefined;
  try {
    const response = await users.list({ queries: [Query.equal('email', email), Query.limit(2)], total: false });
    const matches = response.users.filter((candidate) => candidate.email.toLocaleLowerCase() === email);
    if (matches.length === 1) user = matches[0];
  } catch (error) {
    const code = getErrorCode(error);
    if (getErrorType(error) === 'general_unauthorized_scope') {
      throw new TeacherAssignmentError('APPWRITE_QUIZ_API_KEY needs the users.read scope to look up a student by email.', 503);
    }
    if (code === 401 || code === 403) {
      throw new TeacherAssignmentError('Appwrite denied the server-side Users lookup. Verify APPWRITE_QUIZ_API_KEY and its users.read scope.', 503);
    }
    throw new TeacherAssignmentError('Unable to look up the student account.', 500);
  }

  if (!user) throw new TeacherAssignmentError('Unable to process an access request for this email. Check the address and try again.', 404);

  let profile: StudentProfile;
  try {
    profile = await tablesDb.getRow<StudentProfile>({
      databaseId: appwriteConfig.databaseId,
      tableId: profilesTableId,
      rowId: user.$id,
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 404) {
      throw new TeacherAssignmentError('Unable to process an access request for this email. Check the address and try again.', 404);
    }
    if (code === 401 || code === 403) {
      throw new TeacherAssignmentError('Student profile access is not configured.', 503);
    }
    throw new TeacherAssignmentError('Unable to verify the student profile.', 500);
  }

  if (profile.$id !== user.$id || profile.user_id !== user.$id || profile.role !== 'student') {
    throw new TeacherAssignmentError('Unable to process an access request for this email. Check the address and try again.', 404);
  }
  return { user, email };
}

async function listPairRows(teacherId: string, studentId: string, tablesDb: TablesDB) {
  const rows: AssignmentRow[] = [];
  let cursor: string | undefined;
  try {
    while (true) {
      const response = await tablesDb.listRows<AssignmentRow>({
        databaseId: appwriteConfig.databaseId,
        tableId: getAssignmentsTableId(),
        queries: [
          Query.equal('teacher_id', teacherId),
          Query.equal('student_id', studentId),
          Query.limit(100),
          ...(cursor ? [Query.cursorAfter(cursor)] : []),
        ],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch (error) {
    if (getErrorCode(error) === 404 && getErrorType(error) !== 'table_not_found') {
      console.error('[teacher-assignments] Appwrite operation failed', {
        operation: 'query-pair',
        code: getErrorCode(error),
        type: getErrorType(error),
      });
      throw unavailableAssignmentStorage();
    }
    throw mapAssignmentStorageError(error, 'query-pair', 'Unable to check the existing assignment.');
  }
  return rows.filter((row) => row.teacher_id === teacherId && row.student_id === studentId);
}

export async function requestStudentAssignment(jwt: string, emailInput: string) {
  const teacher = await verifyTeacher(jwt);
  const client = getPrivilegedClient();
  const tablesDb = new TablesDB(client);
  const { user: student } = await findStudent(emailInput, new Users(client), tablesDb);
  const matches = await listPairRows(teacher.$id, student.$id, tablesDb);

  if (matches.length > 1) {
    throw new TeacherAssignmentError('Assignment records are ambiguous. An administrator must resolve them before a new request.', 503);
  }

  const existing = matches[0];
  if (existing?.status === 'pending' || existing?.status === 'approved') {
    throw new TeacherAssignmentError(`An assignment is already ${existing.status}.`, 409, existing.status);
  }
  if (existing && existing.status !== 'rejected' && existing.status !== 'revoked') {
    throw new TeacherAssignmentError('The existing assignment has an unsupported status.', 503);
  }

  const data = {
    teacher_id: teacher.$id,
    student_id: student.$id,
    status: 'pending',
    requested_at: new Date().toISOString(),
  };

  try {
    const assignment = existing
      ? await tablesDb.updateRow<AssignmentRow>({
          databaseId: appwriteConfig.databaseId,
          tableId: getAssignmentsTableId(),
          rowId: existing.$id,
          data,
        })
      : await tablesDb.createRow<AssignmentRow>({
          databaseId: appwriteConfig.databaseId,
          tableId: getAssignmentsTableId(),
          rowId: ID.unique(),
          data,
        });
    return { assignmentId: assignment.$id, status: 'pending' as const };
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 409) throw new TeacherAssignmentError('An assignment request already exists for this pair.', 409);
    throw mapAssignmentStorageError(error, existing ? 'reopen-request' : 'create-request', 'Unable to save the assignment request.');
  }
}

async function resolveAccountEmail(users: Users, userId: string) {
  try {
    return (await users.get({ userId })).email;
  } catch {
    return null;
  }
}

export async function listTeacherAssignmentsForAdmin() {
  const client = getPrivilegedClient();
  const tablesDb = new TablesDB(client);
  const users = new Users(client);
  const rows: AssignmentRow[] = [];
  let cursor: string | undefined;

  try {
    while (true) {
      const response = await tablesDb.listRows<AssignmentRow>({
        databaseId: appwriteConfig.databaseId,
        tableId: getAssignmentsTableId(),
        queries: [Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch (error) {
    throw mapAssignmentStorageError(error, 'list-assignments', 'Unable to list teacher-student assignments.');
  }

  const validRows = rows.filter((row) =>
    typeof row.teacher_id === 'string' &&
    typeof row.student_id === 'string' &&
    typeof row.status === 'string',
  );
  const emails = await Promise.all(validRows.map(async (row) => ({
    teacherEmail: await resolveAccountEmail(users, row.teacher_id as string),
    studentEmail: await resolveAccountEmail(users, row.student_id as string),
  })));

  return validRows.map((row, index) => ({
    assignmentId: row.$id,
    teacherId: row.teacher_id as string,
    studentId: row.student_id as string,
    teacherEmail: emails[index].teacherEmail,
    studentEmail: emails[index].studentEmail,
    status: row.status as AssignmentStatus,
    requestedAt: row.requested_at ?? null,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
  }));
}

export async function decideTeacherAssignment(adminId: string, assignmentId: string, decision: AssignmentDecision) {
  if (!assignmentId.trim()) throw new TeacherAssignmentError('A valid assignment is required.', 400);
  if (!['approve', 'reject', 'revoke'].includes(decision)) {
    throw new TeacherAssignmentError('Choose approve, reject, or revoke.', 400);
  }

  const client = getPrivilegedClient();
  const tablesDb = new TablesDB(client);
  let assignment: AssignmentRow;
  try {
    assignment = await tablesDb.getRow<AssignmentRow>({
      databaseId: appwriteConfig.databaseId,
      tableId: getAssignmentsTableId(),
      rowId: assignmentId.trim(),
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (getErrorType(error) === 'table_not_found') {
      throw mapAssignmentStorageError(error, 'get-assignment', 'Unable to load the assignment.');
    }
    if (code === 404) {
      console.error('[teacher-assignments] Appwrite operation failed', {
        operation: 'get-assignment',
        code,
        type: getErrorType(error),
      });
      throw new TeacherAssignmentError('Assignment record not found.', 404);
    }
    if (code === 401 || code === 403) {
      throw mapAssignmentStorageError(error, 'get-assignment', 'Unable to load the assignment.');
    }
    throw new TeacherAssignmentError('Unable to load the assignment.', 500);
  }

  if (!assignment.teacher_id || !assignment.student_id) {
    throw new TeacherAssignmentError('The assignment record is invalid.', 503);
  }
  if ((decision === 'approve' || decision === 'reject') && assignment.status !== 'pending') {
    throw new TeacherAssignmentError('Only pending assignments can be approved or rejected.', 409);
  }
  if (decision === 'revoke' && assignment.status !== 'approved') {
    throw new TeacherAssignmentError('Only approved assignments can be revoked.', 409);
  }

  const status: AssignmentStatus = decision === 'approve'
    ? 'approved'
    : decision === 'reject'
      ? 'rejected'
      : 'revoked';
  try {
    const updated = await tablesDb.updateRow<AssignmentRow>({
      databaseId: appwriteConfig.databaseId,
      tableId: getAssignmentsTableId(),
      rowId: assignment.$id,
      data: { status, reviewed_by: adminId, reviewed_at: new Date().toISOString() },
    });
    return { assignmentId: updated.$id, status };
  } catch (error) {
    throw mapAssignmentStorageError(error, 'update-assignment', 'Unable to update the assignment.');
  }
}