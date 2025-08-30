<script lang="ts">
	import '@fontsource-variable/inter'

	import '$tailwind'
	import favicon from '$lib/assets/favicon.svg'

	import { SeoTags } from '@opensky/seo'
	let { children } = $props()
</script>

<SeoTags />
<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
