<script lang="ts">
	let { children } = $props()
</script>

<svelte:boundary>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}

	{@render children()}
</svelte:boundary>
