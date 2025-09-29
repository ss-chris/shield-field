<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ul>
	{#each data.users as user}
		<li><a href={'/users/' + user.id}>{user.name}</a></li>
	{/each}
</ul>
