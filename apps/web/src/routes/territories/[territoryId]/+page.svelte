<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="text-lg">{data.territory?.name}</h1>
<a href={'/territories/' + page.params.territoryId + '/polygon'}>edit polygon</a>
