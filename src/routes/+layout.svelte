<script lang="ts">
	import '$tailwind'
	import { SeoTags } from '@opensky/seo'

	import '@fontsource-variable/inter'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<!-- SEO Tags Mount -->
<SeoTags debug={false} />

<!-- Favicon from imports -->
<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
