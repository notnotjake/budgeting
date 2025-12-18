<script lang="ts">
	type Props = { href: string; type?: string }
	let { href, type }: Props = $props()

	function inferType(url: string): string {
		const ext = url.split('.').pop()?.toLowerCase()
		switch (ext) {
			case 'woff2':
				return 'font/woff2'
			case 'woff':
				return 'font/woff'
			case 'ttf':
				return 'font/ttf'
			case 'otf':
				return 'font/otf'
			default:
				return 'font/woff2'
		}
	}

	const fontType = $derived(type ?? inferType(href))
</script>

<svelte:head>
	<link rel="preload" as="font" {href} type={fontType} crossorigin="anonymous" />
</svelte:head>
