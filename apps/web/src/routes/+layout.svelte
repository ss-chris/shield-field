<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Shield Field</title>
</svelte:head>

{@render children?.()}

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		background-color: theme(--color-black);
		color: theme(--color-blue-400);
	}
</style>
