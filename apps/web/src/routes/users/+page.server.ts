import type { PageServerLoad } from './$types';
import { client } from '$lib/api/client';

export const load = (async () => {
	const res = await client.user.$get();
	if (res.ok) {
		const data = await res.json();
		return { users: data.data };
	}
	return { users: [] };
}) satisfies PageServerLoad;
