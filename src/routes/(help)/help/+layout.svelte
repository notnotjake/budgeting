<script lang="ts">
	import Overscroll from '$ui/color/overscroll.svelte'

	let { children } = $props()
</script>

<Overscroll edge="top" class="bg-blue-200" />
<Overscroll edge="bottom" class="bg-[#EDEBED]" />

<div
	class="relative flex min-h-screen bg-linear-to-b from-[#F1F1F3] to-[#EDEBED] dark:bg-neutral-950 dark:from-neutral-950 dark:to-neutral-950"
>
	<div
		class="fixed inset-0 z-0 h-[50vh] w-full bg-linear-to-b from-blue-200 to-neutral-200/0 dark:to-neutral-950/0 dark:opacity-100"
	></div>

	<div class="z-10 w-full">
		{@render children()}
	</div>
</div>
