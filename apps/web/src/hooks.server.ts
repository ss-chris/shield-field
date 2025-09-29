import { initAuth } from '@safestreets/auth';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building, dev } from '$app/environment';
import {
	AUTH_SECRET,
	MICROSOFT_CLIENT_ID,
	MICROSOFT_CLIENT_SECRET,
	MICROSOFT_TENANT_ID,
	NO_WEB_AUTH
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

	// todo
	if (dev && NO_WEB_AUTH && !session) {
		event.locals.user = {
			id: 'NO_WEB_AUTH',
			email: 'devops@safestreets.com',
			name: 'devops'
		};
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
