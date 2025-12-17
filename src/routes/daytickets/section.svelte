<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import { IconChevronRight, IconPencil, IconPlus, IconListDetails } from '@tabler/icons-svelte'
	import IconSelection from './icons.svelte'
	import ItemRow from './item-row.svelte'
	import { createClass } from '@opensky/style'

	let isCollapsed = $state(false)
	let name = $state('Prewire')
</script>

<div class="flex flex-col">
	<!-- Section Header Row -->
	<ContextMenu.Root>
		<ContextMenu.Trigger class="group flex items-center">
			<IconSelection />

			<div class="flex items-baseline">
				<p class="text-[1.1rem] font-semibold tracking-tight-md">{name}</p>

				<p
					class={createClass(
						'tracking-tight-sm text-neutral-700 opacity-0 transition-opacity delay-75 duration-150 group-hover:opacity-100',
						isCollapsed && 'opacity-100'
					)}
				>
					13 Items
				</p>
			</div>

			<button
				onclick={() => {
					isCollapsed = !isCollapsed
				}}
				class="h-full px-1"
			>
				<div class="h-fit w-fit origin-center transition-transform" class:rotate-90={!isCollapsed}>
					<IconChevronRight size={21} class="text-neutral-500 hover:text-neutral-900" />
				</div>
			</button>
		</ContextMenu.Trigger>

		<ContextMenu.Content class="w-44 rounded-[1.15rem] bg-black p-1 shadow-lg outline-none">
			<ContextMenu.Item class="outline-none">
				<div
					class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
				>
					<IconPencil class="text-neutral-200" />
					<p class="px-1.5 font-medium text-neutral-200">Edit Name</p>
				</div>
			</ContextMenu.Item>
			<ContextMenu.Item class="outline-none">
				<div
					class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
				>
					<IconPlus class="text-neutral-200" />
					<p class="px-1.5 font-medium text-neutral-200">Add Item</p>
				</div>
			</ContextMenu.Item>
			<ContextMenu.Item class="outline-none">
				<div
					class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
				>
					<IconListDetails class="text-neutral-200" />
					<p class="px-1.5 font-medium text-neutral-200">Edit Items</p>
				</div>
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>

	<!-- Section Contents -->
	{#if !isCollapsed}
		<div class="rounded-xl bg-white/80">
			<ItemRow name="Cat 6 Cable" cost="1.25" quantityType="linear_ft" />
			<ItemRow name="Outlet Box" cost="3.50" />
			<ItemRow name="Low Voltage Ring" cost="2.75" />
		</div>
	{/if}
</div>
