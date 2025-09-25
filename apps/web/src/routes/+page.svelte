<script lang="ts">
	import { client } from '$lib/api/client';
	import AuthenticationForm from '$lib/components/authenticationForm.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		const res = await client.session.$get();
		console.log(res);
	});
</script>

<h1>welcome to new shield field</h1>
<AuthenticationForm />
