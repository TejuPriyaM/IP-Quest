import { NextResponse } from 'next/server';
import { Account, Client, Permission, Role, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { isAllowlistedAdminId } from '@/lib/server/admin-auth';
import {
	addUserToTeachersTeam,
	isTeacherTeamMember,
	removeTeacherTeamMembership,
} from '@/lib/server/teachers';

type ProfileRow = Models.Row & {
	user_id?: string;
	display_name?: string;
	role?: unknown;
	grade_level?: number;
	total_points?: number;
	created_at?: string;
};

function getBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');
	return authorization?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null;
}

function getPrivilegedTables() {
	const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
	if (!apiKey || !appwriteConfig.endpoint || !appwriteConfig.projectId) return null;
	return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

export async function GET(request: Request) {
	const jwt = getBearerToken(request);
	if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
		return NextResponse.json({ error: 'Appwrite is not configured.' }, { status: 500 });
	}

	const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt);
	try {
		const user = await new Account(client).get();
		const profile = await new TablesDB(client).getRow<ProfileRow>({
			databaseId: appwriteConfig.databaseId,
			tableId: 'profiles',
			rowId: user.$id,
		});
		const isTeacher = await isTeacherTeamMember(jwt);
		const isAdmin = isAllowlistedAdminId(user.$id);
		const accountRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : profile.role === 'teacher' ? 'teacher' : 'student';
		const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';
		return NextResponse.json({
			role,
			accountRole,
			profile: {
				$id: profile.$id,
				user_id: user.$id,
				display_name: profile.display_name,
				grade_level: profile.grade_level,
				total_points: profile.total_points,
				created_at: profile.created_at,
				role: accountRole,
			},
		});
	} catch {
		return NextResponse.json({ error: 'Unable to verify your account profile.' }, { status: 401 });
	}
}

export async function POST(request: Request) {
	const jwt = getBearerToken(request);
	if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
		return NextResponse.json({ error: 'Appwrite is not configured.' }, { status: 500 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid profile details.' }, { status: 400 });
	}
	if (
		typeof body !== 'object' || body === null || Array.isArray(body) ||
		typeof (body as Record<string, unknown>).displayName !== 'string' ||
		!(body as Record<string, unknown>).displayName?.toString().trim() ||
		(body as Record<string, unknown>).displayName!.toString().trim().length > 80 ||
		((body as Record<string, unknown>).role !== 'student' && (body as Record<string, unknown>).role !== 'teacher')
	) {
		return NextResponse.json({ error: 'Choose Student or Teacher and enter a valid display name.' }, { status: 400 });
	}

	const profileInput = body as { displayName: string; role: 'student' | 'teacher' };
	const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt);
	let user: Models.User<Models.Preferences>;
	try {
		user = await new Account(client).get();
	} catch {
		return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
	}

	const tables = getPrivilegedTables();
	if (!tables) return NextResponse.json({ error: 'Server-side profile creation is not configured.' }, { status: 500 });
	try {
		await tables.getRow({ databaseId: appwriteConfig.databaseId, tableId: 'profiles', rowId: user.$id });
		return NextResponse.json({ error: 'A profile already exists for this account.' }, { status: 409 });
	} catch (error) {
		if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 404)) {
			return NextResponse.json({ error: 'Unable to verify the account profile.' }, { status: 500 });
		}
	}

	let teacherMembership: { membershipId: string | null; created: boolean } | null = null;
	try {
		const alreadyTeacher = await isTeacherTeamMember(jwt);
		if (profileInput.role === 'student' && alreadyTeacher) {
			return NextResponse.json({ error: 'This account is already registered for teacher access.' }, { status: 409 });
		}
		if (profileInput.role === 'teacher') teacherMembership = await addUserToTeachersTeam(user.$id);
	} catch {
		return NextResponse.json({ error: 'Unable to set up the selected account role.' }, { status: 500 });
	}

	try {
		const profile = await tables.createRow<Models.DefaultRow>({
			databaseId: appwriteConfig.databaseId,
			tableId: 'profiles',
			rowId: user.$id,
			permissions: [
				Permission.read(Role.user(user.$id)),
				Permission.update(Role.user(user.$id)),
				Permission.delete(Role.user(user.$id)),
			],
			data: {
				user_id: user.$id,
				display_name: profileInput.displayName.trim(),
				role: profileInput.role,
				created_at: new Date().toISOString(),
			},
		});
		return NextResponse.json({ profile: { $id: profile.$id, user_id: user.$id, display_name: profileInput.displayName.trim(), role: profileInput.role } }, { status: 201 });
	} catch (error) {
		if (teacherMembership?.created && teacherMembership.membershipId) {
			try {
				await removeTeacherTeamMembership(teacherMembership.membershipId);
			} catch {
				return NextResponse.json({ error: 'Unable to finish teacher account setup.' }, { status: 500 });
			}
		}
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 409) {
			return NextResponse.json({ error: 'A profile already exists for this account.' }, { status: 409 });
		}
		return NextResponse.json({ error: 'Unable to create your profile.' }, { status: 500 });
	}
}