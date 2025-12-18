<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import { IconChevronRight, IconPencil, IconPlus, IconListDetails } from '@tabler/icons-svelte'
	import IconSelection from './icons.svelte'
	import ItemRow from './item-row.svelte'
	import { createClass } from '@opensky/style'

	type Item = {
		id: number
		name: string
		cost: string
		quantityType: string
	}

	type Props = {
		title: string
		items: Item[]
	}

	let { title, items }: Props = $props()

	let isCollapsed = $state(false)
</script>

<div class="flex w-fit flex-col">
	<!-- Section Header Row -->
	<div class="relative z-30">
		<ContextMenu.Root>
			<ContextMenu.Trigger class="group relative z-30 flex w-full items-center">
				<IconSelection />

				<div class="flex grow items-baseline">
					<p class="text-[1.1rem] font-semibold tracking-tight-md">{title}</p>

					<div class="grow"></div>

					<p
						class={createClass(
							'tracking-tight-sm text-neutral-700 opacity-0 transition-opacity delay-75 duration-150 group-hover:opacity-100',
							isCollapsed && 'opacity-100'
						)}
					>
						{items.length} Items
					</p>
				</div>

				<button
					onclick={() => {
						isCollapsed = !isCollapsed
					}}
					class="h-full px-1"
				>
					<div
						class="h-fit w-fit origin-center transition-transform"
						class:rotate-90={!isCollapsed}
					>
						<IconChevronRight size={21} class="text-neutral-500 hover:text-neutral-900" />
					</div>
				</button>
			</ContextMenu.Trigger>

			<ContextMenu.Content
				class="relative z-40 w-44 rounded-[1.15rem] bg-black p-1 shadow-lg outline-none"
			>
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
	</div>

	<!-- Section Contents -->
	{#if !isCollapsed}
		<div class="relative z-10 w-fit rounded-xl bg-white/50 shadow-2xs">
			{#each items as item (item.id)}
				<ItemRow name={item.name} cost={item.cost} quantityType={item.quantityType} />
			{/each}
		</div>
	{/if}
</div>
