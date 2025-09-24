<script lang="ts">
	import { authClient } from '$lib/api/client';

	async function authenticate() {
		authClient.signIn.social({
			provider: 'microsoft'
		});
	}
</script>

<div>
	<button onclick={authenticate}>sign in with microsoft</button>
</div>
