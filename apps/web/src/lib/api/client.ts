import { hcWithType } from '@safestreets/api/client';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { ssoClient } from '@better-auth/sso/client';

export const client = hcWithType('http://localhost:3000', {
	init: {
		credentials: 'include'
	}
});

export const authClient = createAuthClient({
	baseURL: 'http://localhost:3000',
	plugins: [organizationClient(), ssoClient()]
});

export type Session = typeof authClient.$Infer.Session;
