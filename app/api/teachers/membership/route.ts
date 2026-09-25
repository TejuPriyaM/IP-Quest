import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
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