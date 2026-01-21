<script lang="ts">
	import { fade, slide } from 'svelte/transition'
	import { ContextMenu } from 'bits-ui'
	import {
		IconTrash,
		IconPlayerPause,
		IconX,
		IconTrashFilled,
		IconPlayerPauseFilled,
		IconArrowNarrowRight,
		IconPencil
	} from '@tabler/icons-svelte'
	import PriceHover from './price-hover.svelte'
	import EditRow from './edit-row.svelte'

	interface Subscription {
		id: string
		name: string
		company: string | null
		account: string | null
		tag: string | null
		amount: string
		frequency: 'day' | 'month'
		frequencyInterval: number
		dueDate: Date
		pauseDate: Date | null
		endDate: Date | null
	}

	interface Props {
		subscription: Subscription
		editing?: boolean
		accounts?: string[]
		tags?: string[]
		onEdit: (id: string) => void
		onSave: (data: {
			id: string
			name: string
			company: string | undefined
			account: string | undefined
			tag: string | undefined
			amount: number
			dueDate: string
			frequency: 'day' | 'month'
			frequencyInterval: number
			status: 'active' | 'paused' | 'cancelled'
		}) => void
		onCancelEdit: (id: string) => void
		onPause: (id: string) => void
		onCancel: (id: string) => void
		onDelete: (id: string) => void
	}

	let {
		subscription: sub,
		editing = false,
		accounts = [],
		tags = [],
		onEdit,
		onSave,
		onCancelEdit,
		onPause,
		onCancel,
		onDelete
	}: Props = $props()
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="col-span-4 grid grid-cols-subgrid">
		<div
			class="col-span-4 grid grid-cols-subgrid border-b border-neutral-300 py-4 dark:border-neutral-800"
			transition:fade
		>
			<!-- Row 1: Title, empty, date/status, price -->
			<div class="flex min-w-0 items-baseline gap-1.5">
				<h3 class="truncate font-medium text-neutral-900 dark:text-white">{sub.name}</h3>
				{#if sub.pauseDate}
					<IconPlayerPauseFilled class="shrink-0 text-orange-500" size={16} />
				{:else if sub.endDate}
					<IconTrashFilled class="shrink-0 text-rose-500" size={16} />
				{/if}
			</div>
			<div></div>
			<div class="self-baseline text-right text-sm">
				{#if sub.pauseDate}
					<span class="text-orange-500">Paused</span>
				{:else if sub.endDate}
					<span class="text-rose-500"
						>Cancels {new Date(sub.dueDate).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric'
						})}</span
					>
				{:else}
					<span class="text-neutral-500"
						>{new Date(sub.dueDate).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric'
						})}</span
					>
				{/if}
			</div>
			<!-- Price column: spans both rows -->
			<PriceHover
				amount={Number(sub.amount)}
				frequency={sub.frequency}
				frequencyInterval={sub.frequencyInterval}
			/>
			<!-- Row 2: Subtitle, empty, empty -->
			<div class="min-w-0">
				{#if sub.company || sub.tag || sub.account}
					<p class="flex items-center gap-1 truncate text-sm text-neutral-500">
						{#if sub.company}{sub.company}{/if}
						{#if sub.tag}<span
								class="inline-flex items-center rounded-full border border-neutral-300 px-2 dark:border-neutral-700"
								>{sub.tag}</span
							>{/if}
						{#if sub.account}<IconArrowNarrowRight
								size={16}
								class="-mr-0.5 text-neutral-500"
							/>{sub.account}{/if}
					</p>
				{/if}
			</div>
			<div></div>
			<div></div>

			<!-- Edit Row -->
			{#if editing}
				<div class="col-span-4 pt-3" transition:slide={{ duration: 200 }}>
					<EditRow
						subscription={sub}
						{accounts}
						{tags}
						{onSave}
						onCancel={() => onCancelEdit(sub.id)}
					/>
				</div>
			{/if}
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content
		class="relative z-40 w-44 rounded-[1.15rem] bg-black p-1 shadow-lg outline-none dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
	>
		<ContextMenu.Item class="outline-none" onSelect={() => onEdit(sub.id)}>
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconPencil class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Edit</p>
			</div>
		</ContextMenu.Item>
		<ContextMenu.Item class="outline-none" onSelect={() => onPause(sub.id)}>
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconPlayerPause class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Pause</p>
			</div>
		</ContextMenu.Item>
		<ContextMenu.Item class="outline-none" onSelect={() => onCancel(sub.id)}>
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconX class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Cancel</p>
			</div>
		</ContextMenu.Item>
		<ContextMenu.Item class="outline-none" onSelect={() => onDelete(sub.id)}>
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-rose-500 hover:bg-rose-600/50"
			>
				<IconTrash class="text-rose-500" />
				<p class="px-1.5 font-medium text-rose-500">Delete</p>
			</div>
		</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
