import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	accountGet: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/appwrite', () => ({
	appwriteConfig: {
		endpoint: 'https://appwrite.test/v1',
		projectId: 'test-project',
		databaseId: 'test-database',
	},
}));
vi.mock('node-appwrite', () => ({
	Account: class {
		get() { return mocks.accountGet(); }
	},
	Client: class {
		setEndpoint() { return this; }
		setProject() { return this; }
		setJWT() { return this; }
	},
}));

import { AdminAuthorizationError, verifyAdminIdentity } from '@/lib/server/admin-auth';

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv('APPWRITE_ADMIN_USER_ID', 'admin-account-id');
	mocks.accountGet.mockResolvedValue({ $id: 'admin-account-id', email: 'admin@example.test' });
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('server-side administrator authorization', () => {
	it('allows the authenticated account whose ID matches the server allowlist', async () => {
		await expect(verifyAdminIdentity('valid-admin-jwt')).resolves.toMatchObject({ $id: 'admin-account-id' });
	});

	it('denies an authenticated account that does not match the allowlist', async () => {
		mocks.accountGet.mockResolvedValue({ $id: 'different-account-id' });

		await expect(verifyAdminIdentity('valid-user-jwt')).rejects.toMatchObject({ statusCode: 403 });
	});

	it('rejects invalid authentication', async () => {
		mocks.accountGet.mockRejectedValue(Object.assign(new Error('Invalid JWT'), { code: 401 }));

		await expect(verifyAdminIdentity('invalid-jwt')).rejects.toMatchObject({ statusCode: 401 });
	});

	it('denies access when the server allowlist is missing', async () => {
		vi.stubEnv('APPWRITE_ADMIN_USER_ID', '');

		await expect(verifyAdminIdentity('valid-admin-jwt')).rejects.toMatchObject({ statusCode: 503 });
	});

	it('rejects an empty JWT', async () => {
		await expect(verifyAdminIdentity('')).rejects.toBeInstanceOf(AdminAuthorizationError);
		expect(mocks.accountGet).not.toHaveBeenCalled();
	});
});