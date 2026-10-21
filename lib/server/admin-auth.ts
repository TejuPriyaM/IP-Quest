import 'server-only';

import { Account, Client, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';

export class AdminAuthorizationError extends Error {
	statusCode: 401 | 403 | 500 | 503;

	constructor(message: string, statusCode: AdminAuthorizationError['statusCode']) {
		super(message);
		this.name = 'AdminAuthorizationError';
		this.statusCode = statusCode;
	}
}

function getErrorCode(error: unknown) {
	return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

export function isAllowlistedAdminId(userId: string) {
	const adminUserId = process.env.APPWRITE_ADMIN_USER_ID?.trim();
	return Boolean(adminUserId && userId && userId === adminUserId);
}

export async function verifyAdminIdentity(jwt: string): Promise<Models.User<Models.Preferences>> {
	if (!jwt.trim()) throw new AdminAuthorizationError('Authentication is required.', 401);
	if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
		throw new AdminAuthorizationError('Administrator authentication is not configured.', 503);
	}

	let user: Models.User<Models.Preferences>;
	try {
		const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setJWT(jwt.trim());
		user = await new Account(client).get();
	} catch (error) {
		const code = getErrorCode(error);
		if (code === 401 || code === 403) {
			throw new AdminAuthorizationError('Authentication is invalid or expired.', 401);
		}
		throw new AdminAuthorizationError('Unable to verify administrator identity.', 500);
	}

	if (!process.env.APPWRITE_ADMIN_USER_ID?.trim()) {
		throw new AdminAuthorizationError('Administrator access is not configured.', 503);
	}
	if (!isAllowlistedAdminId(user.$id)) {
		throw new AdminAuthorizationError('Administrator access is required.', 403);
	}

	return user;
}