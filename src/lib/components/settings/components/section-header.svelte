<script lang="ts">
	let { children } = $props()
</script>

<div class="flex w-full items-baseline gap-2 px-3">
	<p class="text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400 capitalize">
		{@render children?.()}
	</p>
</div>
