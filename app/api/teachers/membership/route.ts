import { NextResponse } from 'next/server';
import { Account, Client } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { addUserToTeachersTeam, TeacherTeamError } from '@/lib/server/teachers';

type MembershipRequest = {
	userId?: unknown;
	role?: unknown;
};

function isMembershipRequest(body: unknown): body is MembershipRequest {
	return typeof body === 'object' && body !== null;
}

function isValidUserId(userId: unknown): userId is string {
	return typeof userId === 'string' && userId.trim().length > 0 && userId.length <= 36;
}

function getBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');
	const match = authorization?.match(/^Bearer ([^\s]+)$/i);
	return match?.[1] ?? null;
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

export async function POST(request: Request) {
	const jwt = getBearerToken(request);
	if (!jwt) {
		return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
	}

	let body: MembershipRequest;

	try {
		const parsedBody: unknown = await request.json();

		if (!isMembershipRequest(parsedBody)) {
			return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
		}

		body = parsedBody;
	} catch {
		return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
	}

	if (!isValidUserId(body.userId) || (body.role !== 'teacher' && body.role !== 'student')) {
		return NextResponse.json({ error: 'A valid user ID and role are required.' }, { status: 400 });
	}

	if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
		return NextResponse.json({ error: 'Teacher account setup could not be completed.' }, { status: 500 });
	}

	let authenticatedUserId: string;
	try {
		const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt);
		authenticatedUserId = (await new Account(client).get()).$id;
	} catch (error) {
		const code = getErrorCode(error);
		const status = code === 401 || code === 403 ? 401 : 500;
		return NextResponse.json({ error: status === 401 ? 'Authentication failed.' : 'Teacher account setup could not be completed.' }, { status });
	}

	if (authenticatedUserId !== body.userId) {
		return NextResponse.json({ error: 'You can only update your own teacher membership.' }, { status: 403 });
	}

	if (body.role === 'student') {
		return NextResponse.json({ status: 'not_required' });
	}

	try {
		const result = await addUserToTeachersTeam(body.userId);

		return NextResponse.json({ status: result.status });
	} catch (error) {
		if (error instanceof TeacherTeamError) {
			return NextResponse.json({ error: 'Teacher account setup could not be completed.' }, { status: 502 });
		}

		return NextResponse.json({ error: 'Teacher account setup could not be completed.' }, { status: 500 });
	}
}