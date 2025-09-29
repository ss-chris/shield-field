<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

	interface Crumb {
		label: string;
		url?: string | null;
	}

	interface Props {
		crumbs: Crumb[];
	}

	let { crumbs }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="flex dark:text-white">
	<ol role="list" class="flex items-center space-x-4">
		{#each crumbs as crumb, index}
			<li>
				<div class="flex items-center">
					{#if index > 0}
						<ChevronRight size={16} />
					{/if}
					<a href={crumb.url || ''} class="text-sm font-medium" class:ml-4={index > 0}>
						{crumb.label}
					</a>
				</div>
			</li>
		{/each}
	</ol>
</nav>
