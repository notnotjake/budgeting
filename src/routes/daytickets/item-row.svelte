<script lang="ts">
	type Props = {
		name: string
		cost: string
		quantityType?: string
	}

	let { name, cost, quantityType }: Props = $props()

	let quantity = $state('')
</script>

<div
	class="flex w-full items-stretch border-y-[1px] border-neutral-200 focus-within:border-blue-vibrant focus-within:bg-white"
>
	<input
		type="text"
		bind:value={quantity}
		class="w-15 bg-white/30 px-1.5 py-1.5 text-right font-mono text-[0.9rem] font-medium outline-none focus:bg-blue-500/20 focus:text-blue-vibrant"
	/>
	<div class="flex w-full items-center justify-between gap-1.5 px-2">
		<p class="grow text-[0.9rem] tracking-tight">{name}</p>
		{#if quantityType && quantityType !== 'whole_unit'}
			<p
				class="rounded-full bg-neutral-300 px-1.5 text-xs font-medium tracking-tight text-neutral-600"
			>
				{quantityType}
			</p>
		{/if}
		<p class="text-[0.85rem] tabular-nums opacity-60">${cost}</p>
	</div>
</div>
