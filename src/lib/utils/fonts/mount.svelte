<script lang="ts">
	let { Fonts } = $props()
</script>

<svelte:head>
	{@html Fonts.gen()}
</svelte:head>
