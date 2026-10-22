import { TablesDB, type Models } from 'appwrite';
import { createCurrentUserJWT } from '@/lib/auth';
import { getAppwriteClient, getAppwriteDatabaseId } from '@/lib/appwrite';

const profilesTableId = 'profiles';

export type CreateProfileInput = {
	displayName: string;
	role: 'student' | 'teacher';
};

export type ProfileRow = Models.Row & {
	display_name?: unknown;
	role?: unknown;
};

export type UpdateProfileInput = {
	userId: string;
	displayName: string;
};

export class ProfileError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProfileError';
	}
}

function getTablesDb() {
	const client = getAppwriteClient();
	const databaseId = getAppwriteDatabaseId();

	if (!client || !databaseId) {
		throw new ProfileError('Profile storage is not configured yet. Please try again later.');
	}

	return { databaseId, tablesDb: new TablesDB(client) };
}

export async function createProfile({ displayName, role }: CreateProfileInput): Promise<Models.Row> {
	try {
		const jwt = await createCurrentUserJWT();
		const response = await fetch('/api/auth/profile', {
			method: 'POST',
			headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ displayName, role }),
		});
		const payload: unknown = await response.json().catch(() => null);
		if (!response.ok) {
			const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
				? payload.error
				: 'Unable to create your profile. Please try again.';
			throw new ProfileError(message);
		}
		if (typeof payload !== 'object' || payload === null || !('profile' in payload)) {
			throw new ProfileError('The profile creation response was invalid.');
		}
		return payload.profile as Models.Row;
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code === 409) {
			throw new ProfileError('A profile already exists for this account.');
		}

		if (error instanceof ProfileError) {
			throw error;
		}

		throw new ProfileError('Unable to create your profile. Please try again.');
	}
}

export async function getProfile(userId: string): Promise<ProfileRow> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.getRow<ProfileRow>({
			databaseId,
			tableId: profilesTableId,
			rowId: userId,
		});
	} catch (error) {
		if (error instanceof ProfileError) {
			throw error;
		}

		throw new ProfileError('Unable to load your profile. Please try again.');
	}
}

export async function updateProfile({ userId, displayName }: UpdateProfileInput): Promise<ProfileRow> {
	try {
		const { databaseId, tablesDb } = getTablesDb();

		return await tablesDb.updateRow<ProfileRow>({
			databaseId,
			tableId: profilesTableId,
			rowId: userId,
			data: { display_name: displayName },
		});
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code === 401 || code === 403) {
			throw new ProfileError('Profile editing is unavailable because the profiles table does not allow updates. Enable the appropriate Update permission in Appwrite.');
		}

		if (error instanceof ProfileError) {
			throw error;
		}

		throw new ProfileError('Unable to update your profile. Please try again.');
	}
}