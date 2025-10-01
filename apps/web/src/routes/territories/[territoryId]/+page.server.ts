import { client } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const { territoryId } = params;

	const territoryResponse = await client.territory[':id'].$get({
		param: {
			id: territoryId
		}
	});

	if (!territoryResponse.ok) {
		return;
	}

	const territory = (await territoryResponse.json()).data;

	return {
		territory
	};
}) satisfies PageServerLoad;
