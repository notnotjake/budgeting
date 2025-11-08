<script lang="ts">
	import { site } from '$lib/site-config'
	import Overscroll from '$ui/color/overscroll.svelte'

	let { children } = $props()
</script>

<Overscroll edge="top" class="bg-blue-200 dark:bg-blue-900" />
<Overscroll edge="bottom" class="bg-[#EDEBED] dark:bg-neutral-950" />

<div
	class="relative flex min-h-screen flex-col bg-linear-to-b from-[#F1F1F3] to-[#EDEBED] dark:bg-neutral-950 dark:from-neutral-950 dark:to-neutral-950"
>
	<div
		class="fixed inset-0 z-0 h-[50vh] w-full bg-linear-to-b from-blue-200 to-neutral-200/0 dark:from-blue-600/30 dark:to-neutral-950/0 dark:opacity-100"
	></div>

	<a
		class="z-50 mx-auto block pt-2 text-center text-base font-medium tracking-tight-md text-black/55 no-underline transition-all duration-300 hover:text-black/85 dark:text-white/55"
		href="/">{site.name}</a
	>

	<div class="z-10 w-full">
		{@render children()}
	</div>
</div>
