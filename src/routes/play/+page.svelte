<script lang="ts">
	import { IconPackage } from '@tabler/icons-svelte'

	const items = [
		{ name: 'GC3 panel', price: '$20.37' },
		{ name: 'DW contact', price: '$20.37' },
		{ name: 'Edge Panel', price: '$20.37' }
	]
</script>

<div class="debug absolute z-0 h-full w-full object-cover blur-md">
	<div class="absolute inset-0 z-10 h-full w-full bg-gradient-to-b from-white to-white/0"></div>
	<img class="relative z-0 object-cover opacity-60" src="/painting.jpeg" alt="none" />
</div>

<div class="relative z-10 flex w-full items-center gap-5 px-5 py-2">
	<div class="flex flex-col">
		<p class="text-[0.95rem] font-semibold tracking-[-0.018em] text-neutral-500">Date</p>
		<p class="text-[1.1rem] font-medium leading-4 tracking-[-0.018em]">Today, August 30</p>
	</div>
	<div class="flex flex-col">
		<p class="font-semibold tracking-[-0.018em] text-neutral-500">Builder</p>
		<p class="text-[1.1rem] font-medium leading-4 tracking-[-0.018em]">RCI</p>
	</div>
	<div class="h-full items-center">
		<button
			class="rounded-full bg-gradient-to-b from-blue-500 to-sky-400 px-6 py-1.5 font-medium text-white"
			>Print Report</button
		>
	</div>
</div>

<div class="relative z-10 h-full w-full max-w-md p-3">
	<div class="rounded-2xl bg-neutral-200/70">
		<div class="flex items-baseline justify-between gap-2 px-3 pt-2">
			<h3 class="text-[1.1rem] font-semibold tracking-[-0.018em]">Prewire & Cable</h3>
		</div>

		{#each items as item}
			<div
				class="focus-within:border-blue-vibrant flex w-full items-stretch border-y-[1px] border-neutral-200 py-1.5"
			>
				<input
					type="text"
					class="w-15 focus:text-blue-vibrant rounded-lg bg-neutral-200/70 px-1.5 text-right font-mono text-[0.9rem] font-medium outline-none focus:bg-blue-500/20"
				/>
				<div class="flex w-full items-center justify-between gap-1.5 px-2">
					<p class="grow tracking-tight">{item.name}</p>
					<p class="tabular-nums opacity-60">{item.price}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<div>"A zen quote" - Author</div>
