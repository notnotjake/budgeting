<script lang="ts">
	import { IconX, IconFileDownloadFilled } from '@tabler/icons-svelte'
	import SidebarButton from '$ui/sidebar-button.svelte'

	import { getItems } from './items.remote'

	const sections = await getItems()
</script>

<div class="debug absolute z-0 h-full w-full object-cover blur-md">
	<div class="absolute inset-0 z-10 h-full w-full bg-gradient-to-b from-white to-white/0"></div>
	<img class="relative z-0 object-cover opacity-60" src="/painting.jpeg" alt="none" />
</div>

<div class="relative z-10 flex w-full items-center gap-5 px-5 py-2">
	<button
		class="flex items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-600 p-2"
	>
		<p class="font-semibold tracking-tight text-white/80">SP</p>
	</button>

	<div class="flex flex-col">
		<p class="text-[0.95rem] font-semibold tracking-[-0.018em] text-neutral-500">Date</p>
		<p class="text-[1.1rem] font-medium leading-4 tracking-[-0.018em]">Today, August 30</p>
	</div>
	<div class="flex flex-col">
		<p class="font-semibold tracking-[-0.018em] text-neutral-500">Builder</p>
		<p class="text-[1.1rem] font-medium leading-4 tracking-[-0.018em]">RCI</p>
	</div>
	<div class="flex h-full items-center">
		<button
			class="flex gap-2 rounded-full bg-gradient-to-b from-blue-500 to-sky-400 px-6 py-1.5 pl-3 font-medium text-white"
		>
			<IconFileDownloadFilled />
			<p class="font-semibold">Create Report</p>
		</button>

		<button
			class="flex items-center justify-center gap-2 rounded-full bg-neutral-200 p-2 font-medium text-white"
		>
			<IconX />
		</button>
	</div>
</div>

<div class="relative z-10 h-full w-full overflow-y-auto p-3">
	<div class="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
		{#each sections as section}
			<div class="mb-3 break-inside-avoid rounded-2xl bg-neutral-200/70">
				<div class="flex items-baseline justify-between gap-2 px-3 pt-2">
					<h3 class="text-[1.1rem] font-semibold tracking-[-0.018em]">{section.title}</h3>
				</div>

				{#each section.items as item}
					<div
						class="focus-within:border-blue-vibrant flex w-full items-stretch border-y-[1px] border-neutral-200 focus-within:bg-white"
					>
						<input
							type="text"
							class="w-15 focus:text-blue-vibrant bg-white/30 px-1.5 py-1.5 text-right font-mono text-[0.9rem] font-medium outline-none focus:bg-blue-500/20"
						/>
						<div class="flex w-full items-center justify-between gap-1.5 px-2">
							<p class="grow text-[0.9rem] tracking-tight">{item.name}</p>
							{#if item.quantityType !== 'whole_unit'}
								<p
									class="rounded-full bg-neutral-600/70 px-1.5 font-mono text-xs font-semibold tracking-tight text-white"
								>
									{item.quantityType}
								</p>
							{/if}
							<p class="text-[0.85rem] tabular-nums opacity-60">${item.cost}</p>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<div>"A zen quote" - Author</div>
