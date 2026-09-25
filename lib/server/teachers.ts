import 'server-only';

import { Client, Teams, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

const teachersTeamId = 'teachers';
const appwriteApiKeyEnvironmentVariable = 'APPWRITE_API_KEY';

export class TeacherTeamError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TeacherTeamError';
	}
}

export type TeacherTeamMembershipResult = {
	status: 'added' | 'already_member';
	membership: Models.Membership | null;
};

function getServerAppwriteClient() {
	const apiKey = process.env[appwriteApiKeyEnvironmentVariable]?.trim();

	if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !apiKey) {
		throw new TeacherTeamError('Server-side Appwrite team access is not configured. Set APPWRITE_API_KEY in the server environment.');
	}

	return new Client()
		.setEndpoint(appwriteConfig.endpoint)
		.setProject(appwriteConfig.projectId)
		.setKey(apiKey);
}

export async function addUserToTeachersTeam(userId: string): Promise<TeacherTeamMembershipResult> {
	if (!userId.trim()) {
		throw new TeacherTeamError('A valid Appwrite user ID is required to add a teacher to the team.');
	}

	try {
		const teams = new Teams(getServerAppwriteClient());

		const membership = await teams.createMembership({
			teamId: teachersTeamId,
			roles: ['teacher'],
			userId: userId.trim(),
		});

		return { status: 'added', membership };
	} catch (error) {
		if (error instanceof TeacherTeamError) {
			throw error;
		}

		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 409) {
			return { status: 'already_member', membership: null };
		}

		throw new TeacherTeamError('Unable to add the user to the Teachers team. Verify the server API key and team membership permissions.');
	}
}
