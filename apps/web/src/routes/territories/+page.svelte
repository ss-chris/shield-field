<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$inspect(data);
</script>

<ul>
	{#each data.territories as territory}
		<li><a href={'/territories/' + territory.id}>{territory.name}</a></li>
	{/each}
</ul>
