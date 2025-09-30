<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Sidebar from '$lib/components/sidebar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Shield Field</title>
</svelte:head>

<Sidebar />
<main class="py-10 lg:pl-56">
	<div class="px-4 sm:px-6 lg:px-8">
		{@render children?.()}
	</div>
</main>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		background-color: theme(--color-black);
		color: theme(--color-blue-400);
	}
</style>
