import { initAuth } from '@safestreets/auth';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import {
	AUTH_SECRET,
	MICROSOFT_CLIENT_ID,
	MICROSOFT_CLIENT_SECRET,
	MICROSOFT_TENANT_ID
} from '$env/static/private';

const auth = initAuth({
	baseUrl: 'http://localhost:5173',
	productionUrl: 'http://localhost:5173',
	microsoftClientId: MICROSOFT_CLIENT_ID,
	microsoftClientSecret: MICROSOFT_CLIENT_SECRET,
	microsoftTenantId: MICROSOFT_TENANT_ID,
	secret: AUTH_SECRET
});

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
