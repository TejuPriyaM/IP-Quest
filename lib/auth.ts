import { Account, ID, type Models } from 'appwrite';
import { getAppwriteClient } from '@/lib/appwrite';
import type { ProfileRow } from '@/lib/profile';

export type AuthCredentials = {
	email: string;
	password: string;
};

export type CreateAccountInput = AuthCredentials & {
	name: string;
};

export type UserRole = 'student' | 'teacher' | 'admin';

export class AuthError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AuthError';
	}
}

function getAccount() {
	const client = getAppwriteClient();

	if (!client) {
		throw new AuthError('Authentication is not configured yet. Please try again later.');
	}

	return new Account(client);
}

function getAuthErrorMessage(error: unknown, fallback: string) {
	if (error instanceof AuthError) {
		return error.message;
	}

	const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

	if (code === 409) {
		return 'An account with this email already exists.';
	}

	if (code === 401) {
		return 'Invalid email or password.';
	}

	return fallback;
}

export async function createAccount({ email, password, name }: CreateAccountInput): Promise<Models.User<Models.Preferences>> {
	try {
		return await getAccount().create(ID.unique(), email, password, name);
	} catch (error) {
		throw new AuthError(getAuthErrorMessage(error, 'Unable to create your account. Please try again.'));
	}
}

export async function login({ email, password }: AuthCredentials): Promise<Models.Session> {
	try {
		return await getAccount().createEmailPasswordSession(email, password);
	} catch (error) {
		throw new AuthError(getAuthErrorMessage(error, 'Unable to sign in. Please try again.'));
	}
}

export async function requestPasswordRecovery(email: string, redirectUrl: string): Promise<void> {
	try {
		await getAccount().createRecovery(email, redirectUrl);
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code === 404) {
			return;
		}

		throw new AuthError(getAuthErrorMessage(error, 'Unable to send a password-reset link. Please try again.'));
	}
}

export async function completePasswordRecovery(userId: string, secret: string, password: string): Promise<void> {
	try {
		await getAccount().updateRecovery(userId, secret, password);
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code === 401 || code === 404) {
			throw new AuthError('This password-reset link is invalid or expired. Please request a new reset link.');
		}

		throw new AuthError(getAuthErrorMessage(error, 'Unable to reset your password. Please request a new reset link and try again.'));
	}
}

export async function createCurrentUserJWT(): Promise<string> {
	try {
		const token = await getAccount().createJWT();
		return token.jwt;
	} catch (error) {
		const fallback = 'Unable to verify your account. Please try again.';
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
		const message = code === 401
			? 'Your session has expired. Please sign in again.'
			: getAuthErrorMessage(error, fallback);
		const details = process.env.NODE_ENV === 'development' && error instanceof Error
			? ` (${code === 401 ? 'Session missing or expired' : 'Appwrite JWT request failed'}${typeof code === 'number' ? `, status ${code}` : ''}: ${error.message})`
			: '';
		throw new AuthError(`${message}${details}`);
	}
}

export async function createQuizJWT(): Promise<string> {
	return createCurrentUserJWT();
}

export async function logout(): Promise<void> {
	try {
		await getAccount().deleteSession('current');
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code !== 401) {
			throw new AuthError(getAuthErrorMessage(error, 'Unable to sign out. Please try again.'));
		}
	}
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
	try {
		return await getAccount().get();
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;

		if (code === 401) {
			return null;
		}

		throw new AuthError(getAuthErrorMessage(error, 'Unable to check your session. Please try again.'));
	}
}

export function getRoleBasedRoute(role: UserRole): string {
	return {
		student: '/dashboard',
		teacher: '/teacher',
		admin: '/admin',
	}[role];
}

export type CurrentProfile = {
	profile: ProfileRow;
	role: UserRole;
	accountRole: UserRole;
};

export function matchesLoginRole(profile: CurrentProfile | null, selectedRole: 'student' | 'teacher' | 'admin') {
	if (!profile) return false;
	if (selectedRole === 'admin') return profile.role === 'admin' && profile.accountRole === 'admin';
	if (profile.role === 'admin' || profile.accountRole === 'admin') return false;
	if (selectedRole === 'teacher') return profile.accountRole === 'teacher' || profile.role === 'teacher';
	return profile.accountRole === 'student' && profile.role === 'student';
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	const jwt = await createCurrentUserJWT();
	const response = await fetch('/api/auth/profile', {
		headers: { Authorization: `Bearer ${jwt}` },
	});
	const payload: unknown = await response.json().catch(() => null);
	if (
		!response.ok || typeof payload !== 'object' || payload === null ||
		!('profile' in payload) || !('role' in payload) || !('accountRole' in payload)
	) {
		throw new AuthError('Unable to verify your account profile. Please try again.');
	}

	return payload as CurrentProfile;
}

export async function getCurrentDestination(): Promise<string | null> {
	const currentProfile = await getCurrentProfile();

	if (!currentProfile) return null;
		if (currentProfile.accountRole === 'teacher' && currentProfile.role !== 'teacher') return '/teacher/setup';
	return getRoleBasedRoute(currentProfile.role);
}
