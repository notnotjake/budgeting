<script lang="ts">
	import { type Snippet } from 'svelte'
	let { children, title }: { children: Snippet; title: string } = $props()
</script>

<div class="flex w-full items-baseline px-3 pb-3">
	<p class="text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400 capitalize">
		{title}
	</p>
</div>

<div class="flex w-full flex-col gap-2">
	{@render children?.()}
</div>
