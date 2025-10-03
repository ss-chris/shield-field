import { client } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const territoryResponse = await client.territory.$get();

	if (!territoryResponse.ok) {
		return;
	}

	const territories = (await territoryResponse.json()).data;

	return {
		territories
	};
}) satisfies PageServerLoad;
