import 'server-only';

import { Client, Query, TablesDB, Users, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import {
  getQuizPerformanceHistoryForUserId,
  LevelQuizError,
  verifyQuizTeacher,
} from '@/lib/server/level-quiz';

const profilesTableId = 'profiles';

type ProfileRow = Models.Row & {
  user_id?: string;
  display_name?: string;
  role?: unknown;
};

type TeacherStudentAssignment = Models.Row & {
  teacher_id?: string;
  student_id?: string;
  status?: string;
};

export class TeacherProgressError extends Error {
  statusCode: 400 | 401 | 403 | 404 | 500 | 503;

  constructor(message: string, statusCode: TeacherProgressError['statusCode']) {
    super(message);
    this.name = 'TeacherProgressError';
    this.statusCode = statusCode;
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

function getAssignmentsTableId() {
  const tableId = process.env.APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID?.trim();
  if (!tableId) {
    throw new TeacherProgressError('APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID is not configured.', 503);
  }
  return tableId;
}

function getPrivilegedClient() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  getAssignmentsTableId();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
    throw new TeacherProgressError('Appwrite endpoint, project, or database configuration is missing.', 503);
  }
  if (!apiKey) {
    throw new TeacherProgressError('APPWRITE_QUIZ_API_KEY is not configured for server-side student lookup and progress reads.', 503);
  }

  return new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey);
}

function unavailableAssignmentStorage() {
  return new TeacherProgressError('Teacher progress is unavailable because assignment storage is not configured.', 503);
}

function mapAuthenticationError(error: unknown): TeacherProgressError {
  if (error instanceof LevelQuizError && (error.statusCode === 401 || error.statusCode === 403)) {
    return new TeacherProgressError(error.message, error.statusCode);
  }
  return new TeacherProgressError('Unable to verify teacher access.', 500);
}

async function findStudentByEmail(email: string, users: Users) {
  try {
    const response = await users.list({
      queries: [Query.equal('email', email), Query.limit(2)],
      total: false,
    });
    const exactMatches = response.users.filter((user) => user.email.toLocaleLowerCase() === email);
    return exactMatches.length === 1 ? exactMatches[0] : null;
  } catch (error) {
    const code = getErrorCode(error);
    if (getErrorType(error) === 'general_unauthorized_scope') {
      throw new TeacherProgressError('APPWRITE_QUIZ_API_KEY needs the users.read scope to look up a student by email.', 503);
    }
    if (code === 401 || code === 403) {
      throw new TeacherProgressError('Appwrite denied the server-side Users lookup. Verify APPWRITE_QUIZ_API_KEY and its users.read scope.', 503);
    }
    throw new TeacherProgressError('Unable to look up the student account.', 500);
  }
}

async function getStudentProfile(studentId: string, tablesDb: TablesDB) {
  let profile: ProfileRow;
  try {
    profile = await tablesDb.getRow<ProfileRow>({
      databaseId: appwriteConfig.databaseId,
      tableId: profilesTableId,
      rowId: studentId,
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 404) return null;
    if (code === 401 || code === 403) {
      throw new TeacherProgressError('Teacher progress is unavailable because profile access is not configured.', 503);
    }
    throw new TeacherProgressError('Unable to verify the student profile.', 500);
  }

  if (profile.$id !== studentId || profile.user_id !== studentId || profile.role !== 'student') return null;
  return profile;
}

async function hasApprovedAssignment(teacherId: string, studentId: string, tablesDb: TablesDB) {
  const assignments: TeacherStudentAssignment[] = [];
  let cursor: string | undefined;

  try {
    while (true) {
      const response = await tablesDb.listRows<TeacherStudentAssignment>({
        databaseId: appwriteConfig.databaseId,
        tableId: getAssignmentsTableId(),
        queries: [
          Query.equal('teacher_id', teacherId),
          Query.equal('student_id', studentId),
          Query.limit(100),
          ...(cursor ? [Query.cursorAfter(cursor)] : []),
        ],
      });
      assignments.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }
  } catch (error) {
    const code = getErrorCode(error);
    if (getErrorType(error) === 'table_not_found') {
      throw new TeacherProgressError(
        'The configured assignment table was not found. Verify APPWRITE_TEACHER_ASSIGNMENTS_TABLE_ID and the database.',
        503,
      );
    }
    if (getErrorType(error) === 'general_unauthorized_scope') {
      throw new TeacherProgressError('The server API key lacks TablesDB row-read access for assignments.', 503);
    }
    if (code === 401 || code === 403 || code === 404) throw unavailableAssignmentStorage();
    throw new TeacherProgressError('Unable to verify the teacher-student assignment.', 500);
  }

  const matchingAssignments = assignments.filter((assignment) =>
    assignment.teacher_id === teacherId &&
    assignment.student_id === studentId,
  );
  if (matchingAssignments.length > 1) {
    throw new TeacherProgressError(
      'Teacher progress is unavailable because multiple assignment records make the authoritative status ambiguous.',
      503,
    );
  }

  return matchingAssignments[0]?.status === 'approved';
}

export async function getTeacherStudentProgress(jwt: string, rawEmail: string) {
  const email = rawEmail.trim().toLocaleLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TeacherProgressError('Enter a valid student email address.', 400);
  }

  let teacher: Models.User<Models.Preferences>;
  try {
    teacher = await verifyQuizTeacher(jwt);
  } catch (error) {
    throw mapAuthenticationError(error);
  }

  const client = getPrivilegedClient();
  const users = new Users(client);
  const tablesDb = new TablesDB(client);
  const student = await findStudentByEmail(email, users);
  if (!student) {
    throw new TeacherProgressError('No authorized student record was found for this teacher.', 404);
  }

  const profile = await getStudentProfile(student.$id, tablesDb);
  if (!profile || !(await hasApprovedAssignment(teacher.$id, student.$id, tablesDb))) {
    throw new TeacherProgressError('No authorized student record was found for this teacher.', 404);
  }

  let history;
  try {
    history = await getQuizPerformanceHistoryForUserId(student.$id);
  } catch (error) {
    if (error instanceof LevelQuizError && error.statusCode === 403) {
      throw unavailableAssignmentStorage();
    }
    throw new TeacherProgressError('Unable to load the student progress report.', 500);
  }

  return {
    student: {
      displayName: typeof profile.display_name === 'string' && profile.display_name.trim()
        ? profile.display_name
        : 'Student',
    },
    levelAttempts: history.levelAttempts.map((attempt) => ({
      attemptId: attempt.attemptId,
      topicId: attempt.topicId,
      topicTitle: attempt.topicTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt,
      kind: 'level' as const,
      level: attempt.level,
      passed: attempt.passed,
    })),
    teacherQuizAttempts: history.teacherQuizAttempts.map((attempt) => ({
      attemptId: attempt.attemptId,
      topicId: attempt.topicId,
      topicTitle: attempt.topicTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt,
      kind: 'teacher' as const,
      passed: attempt.passed,
    })),
    lessonAssessments: history.lessonAssessments.map((attempt) => ({
      attemptId: attempt.attemptId,
      topicId: attempt.topicId,
      topicTitle: attempt.topicTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt,
      kind: 'assessment' as const,
      lessonId: attempt.lessonId,
      lessonTitle: attempt.lessonTitle,
    })),
  };
}