<script lang="ts">
	import './runde.css'
	import Preload from './preload.svelte'

	type Props = { preload?: boolean }
	let { preload = true }: Props = $props()
</script>

{#if preload}
	<Preload href="/open-runde-bold.woff2" />
{/if}
