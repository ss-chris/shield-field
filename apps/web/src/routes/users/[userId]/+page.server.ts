import type { PageServerLoad } from './$types';
import { client } from '$lib/api/client';

export const load = (async ({ params }) => {
	const res = await client.user[':id'].$get({ param: { id: params.userId } });
	if (res.ok) {
		const data = await res.json();
		return { profile: data.data };
	}
	return { profile: {} };
}) satisfies PageServerLoad;
