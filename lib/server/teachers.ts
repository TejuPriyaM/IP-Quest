import 'server-only';

import { Client, Teams, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

const teachersTeamId = 'teachers';

export class TeacherTeamError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TeacherTeamError';
	}
}

function getAuthenticatedTeams(jwt: string) {
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !jwt.trim()) {
		throw new TeacherTeamError('Teacher account verification is not configured.');
	}
	const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt.trim());
	return new Teams(client);
}

function getPrivilegedTeams() {
	const apiKey = process.env.APPWRITE_API_KEY?.trim();
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
		throw new TeacherTeamError('Server-side teacher enrollment is not configured.');
	}
	const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey);
	return new Teams(client);
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

export async function isTeacherTeamMember(jwt: string) {
	try {
		await getAuthenticatedTeams(jwt).get({ teamId: teachersTeamId });
		return true;
	} catch (error) {
		const code = getErrorCode(error);
		if (code === 403 || code === 404) return false;
		throw new TeacherTeamError('Unable to verify teacher team membership.');
	}
}

export async function addUserToTeachersTeam(userId: string): Promise<{ membershipId: string | null; created: boolean }> {
	if (!userId.trim()) throw new TeacherTeamError('A valid authenticated user is required.');
	try {
		const membership: Models.Membership = await getPrivilegedTeams().createMembership({
			teamId: teachersTeamId,
			roles: ['teacher'],
			userId: userId.trim(),
		});
		return { membershipId: membership.$id, created: true };
	} catch (error) {
		if (getErrorCode(error) === 409) return { membershipId: null, created: false };
		throw new TeacherTeamError('Unable to enroll this teacher account.');
	}
}

export async function removeTeacherTeamMembership(membershipId: string) {
	if (!membershipId.trim()) return;
	try {
		await getPrivilegedTeams().deleteMembership({ teamId: teachersTeamId, membershipId: membershipId.trim() });
	} catch {
		throw new TeacherTeamError('Unable to roll back incomplete teacher enrollment.');
	}
}
