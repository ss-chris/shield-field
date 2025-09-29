<script lang="ts">
	import AuthenticationForm from '$lib/components/authenticationForm.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<AuthenticationForm />
