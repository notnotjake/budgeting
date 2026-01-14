<script lang="ts">
	import {
		getSubscriptions,
		getAccounts,
		getTags,
		createSubscription,
		deleteSubscription,
		pauseSubscription,
		cancelSubscription
	} from '$remotes/subscriptions.remote'
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { ContextMenu, Popover, RadioGroup } from 'bits-ui'
	import { IconTrash, IconPlayerPause, IconX, IconTrashFilled, IconPlayerPauseFilled, IconArrowNarrowRight, IconFilter2, IconArrowNarrowUp } from '@tabler/icons-svelte'
	import ControlStrip from './control-strip.svelte'

	let isSubmitting = $state(false)
	let subscriptionsPromise = $state(getSubscriptions())
	let accountsPromise = $state(getAccounts())
	let tagsPromise = $state(getTags())

	let sortBy = $state<'date' | 'status' | 'price' | 'period'>('date')
	let sortReversed = $state(false)
	let sortPopoverOpen = $state(false)

	function sortSubscriptions(subs: typeof subscriptionsPromise extends Promise<infer T> ? T : never) {
		const sorted = [...subs].sort((a, b) => {
			switch (sortBy) {
				case 'date':
					return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
				case 'status': {
					const getStatusOrder = (sub: typeof a) => {
						if (sub.pauseDate) return 2
						if (sub.endDate) return 3
						return 1
					}
					return getStatusOrder(a) - getStatusOrder(b)
				}
				case 'price':
					return Number(a.amount) - Number(b.amount)
				case 'period': {
					const getPeriodOrder = (sub: typeof a) => {
						if (sub.frequency === 'day' && sub.frequencyInterval === 7) return 1
						if (sub.frequency === 'month' && sub.frequencyInterval === 1) return 2
						return 3
					}
					return getPeriodOrder(a) - getPeriodOrder(b)
				}
				default:
					return 0
			}
		})
		return sortReversed ? sorted.reverse() : sorted
	}

	async function handleSubmit(data: {
		name: string
		company: string | undefined
		account: string | undefined
		tag: string | undefined
		amount: number
		dueDate: string
		frequency: 'day' | 'month'
		frequencyInterval: number
	}) {
		isSubmitting = true
		try {
			await createSubscription(data)
			// Refresh subscriptions and accounts/tags lists
			subscriptionsPromise = getSubscriptions()
			accountsPromise = getAccounts()
			tagsPromise = getTags()
		} catch (e) {
			console.error('Failed to create subscription', e)
			alert('Failed to create subscription')
		} finally {
			isSubmitting = false
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteSubscription({ id })
			subscriptionsPromise = getSubscriptions()
			accountsPromise = getAccounts()
			tagsPromise = getTags()
		} catch (e) {
			console.error('Failed to delete subscription', e)
		}
	}

	async function handlePause(id: string) {
		try {
			await pauseSubscription({ id })
			subscriptionsPromise = getSubscriptions()
		} catch (e) {
			console.error('Failed to pause subscription', e)
		}
	}

	async function handleCancel(id: string) {
		try {
			await cancelSubscription({ id })
			subscriptionsPromise = getSubscriptions()
		} catch (e) {
			console.error('Failed to cancel subscription', e)
		}
	}
</script>

<div
	class={createClass(
		'relative z-10 flex h-full min-h-screen w-full flex-col items-center',
		'transition-transform duration-300 will-change-transform'
	)}
>
	<h1
		class={createClass(
			'pt-18 text-center text-xl text-black transition-all duration-150 dark:text-white'
		)}
	>
		Subscriptions
	</h1>
	{#await subscriptionsPromise then subscriptions}
		{@const total = subscriptions.reduce((sum, sub) => {
			const amount = Number(sub.amount)
			// Convert to monthly equivalent
			if (sub.frequency === 'day' && sub.frequencyInterval === 7) {
				return sum + amount * 4.33 // Weekly to monthly
			} else if (sub.frequency === 'month' && sub.frequencyInterval === 12) {
				return sum + amount / 12 // Yearly to monthly
			}
			return sum + amount // Already monthly
		}, 0)}
		<p class="pb-8 text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
			${total.toFixed(2)}/mo
		</p>
	{/await}

	<!-- Toolbar Group -->
	<div
		class="sticky top-0 z-200 flex w-full items-center justify-center bg-linear-to-b from-[#F1F1F3] to-transparent pt-2 pb-8 dark:from-neutral-950"
	>
		{#await Promise.all([accountsPromise, tagsPromise]) then [accounts, tags]}
			<ControlStrip onSubmit={handleSubmit} {isSubmitting} {accounts} {tags} />
		{/await}
	</div>

	<!-- Subscriptions List -->
	<div class="w-full max-w-2xl px-6 py-10">
		{#await subscriptionsPromise}
			<p class="text-center text-neutral-500">Loading subscriptions...</p>
		{:then subscriptions}
			{#if subscriptions.length === 0}
				<div class="flex flex-col items-center gap-2 py-20">
					<p class="text-neutral-500">No subscriptions yet.</p>
					<p class="text-sm text-neutral-400">Add your first subscription using the toolbar above.</p>
				</div>
			{:else}
				<!-- Sort Controls -->
				<div class="mb-4 flex justify-end">
					<Popover.Root bind:open={sortPopoverOpen}>
						<Popover.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									class={createClass(
										'flex size-[30px] cursor-pointer select-none items-center justify-center gap-1 rounded-full',
										'bg-white text-neutral-500 shadow-[0px_1px_1px_rgba(0,0,0,0.08),0px_0px_0px_1px_rgba(0,0,0,0.05)]',
										'transition-all hover:shadow-[0px_1px_1px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.1)]',
										'active:scale-[0.99] active:bg-neutral-100',
										'dark:bg-neutral-800 dark:shadow-[0px_1px_1px_rgba(0,0,0,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.1)]',
										'dark:hover:shadow-[0px_1px_1px_rgba(0,0,0,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.2)]',
										'dark:active:bg-neutral-700',
										sortPopoverOpen && 'bg-neutral-100 dark:bg-neutral-700'
									)}
								>
									<IconFilter2 size={16} />
								</button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content
							side="bottom"
							align="end"
							sideOffset={8}
							class="z-100 w-48 rounded-[1.15rem] bg-black p-2 shadow-lg dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
						>
							<div class="flex items-center justify-between border-b border-neutral-700 pb-2 mb-2">
								<span class="pl-2 text-xs font-medium text-neutral-400">Sort by</span>
								<button
									onclick={() => (sortReversed = !sortReversed)}
									class={createClass(
										'flex size-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-700',
										sortReversed && 'rotate-180'
									)}
								>
									<IconArrowNarrowUp size={16} />
								</button>
							</div>
							<RadioGroup.Root bind:value={sortBy} class="flex flex-col gap-1">
								{#each [
									{ value: 'date', label: 'Renew Date' },
									{ value: 'status', label: 'Status' },
									{ value: 'price', label: 'Price' },
									{ value: 'period', label: 'Period' }
								] as option (option.value)}
									<RadioGroup.Item
										value={option.value}
										class={createClass(
											'flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-neutral-200 outline-none',
											'hover:bg-neutral-600/80',
											'data-[state=checked]:bg-neutral-600/80 data-[state=checked]:font-medium'
										)}
									>
										{option.label}
									</RadioGroup.Item>
								{/each}
							</RadioGroup.Root>
						</Popover.Content>
					</Popover.Root>
				</div>
				{@const sortedSubscriptions = sortSubscriptions(subscriptions)}
				<div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-6">
					{#each sortedSubscriptions as sub (sub.id)}
						<ContextMenu.Root>
							<ContextMenu.Trigger class="col-span-4 grid grid-cols-subgrid">
								{@const isYearly = sub.frequency === 'month' && sub.frequencyInterval === 12}
								<div
									class="col-span-4 grid grid-cols-subgrid border-b border-neutral-300 py-4 dark:border-neutral-800"
									class:group={isYearly}
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
											<span class="text-rose-500">Cancels {new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
										{:else}
											<span class="text-neutral-500">{new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
										{/if}
									</div>
									<div class="self-baseline text-right">
										{#if isYearly}
											<p class="relative h-6 overflow-hidden tabular-nums font-medium text-neutral-900 dark:text-white">
												<span class="absolute inset-0 transition-all duration-300 ease-out group-hover:translate-y-full group-hover:opacity-0 group-hover:blur-[2px]">
													${Number(sub.amount).toFixed(2)}
												</span>
												<span class="absolute inset-0 -translate-y-full opacity-0 blur-[2px] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none">
													${(Number(sub.amount) / 12).toFixed(2)}
												</span>
											</p>
										{:else}
											<p class="tabular-nums font-medium text-neutral-900 dark:text-white">
												${Number(sub.amount).toFixed(2)}
											</p>
										{/if}
									</div>
									<!-- Row 2: Subtitle, empty, empty, frequency label -->
									<div class="min-w-0">
										{#if sub.company || sub.tag || sub.account}
											<p class="flex items-center gap-1 truncate text-sm text-neutral-500">
												{#if sub.company}{sub.company}{/if}{#if sub.company && (sub.tag || sub.account)} &bull; {/if}{#if sub.tag}{sub.tag}{/if}{#if sub.tag && sub.account} &bull; {/if}{#if sub.account}<IconArrowNarrowRight size={16} class="-mr-0.5 text-neutral-500" />{sub.account}{/if}
											</p>
										{/if}
									</div>
									<div></div>
									<div></div>
									<div class="text-right">
										<p class="relative text-xs text-neutral-400">
											{#if isYearly}
												<span class="inline-block transition-opacity duration-300 group-hover:opacity-0">Yearly</span>
												<span class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">Monthly</span>
											{:else if sub.frequency === 'day' && sub.frequencyInterval === 7}
												Weekly
											{:else}
												Monthly
											{/if}
										</p>
									</div>
								</div>
							</ContextMenu.Trigger>
							<ContextMenu.Content
								class="relative z-40 w-44 rounded-[1.15rem] bg-black p-1 shadow-lg outline-none dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
							>
								<ContextMenu.Item class="outline-none" onSelect={() => handlePause(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
									>
										<IconPlayerPause class="text-neutral-200" />
										<p class="px-1.5 font-medium text-neutral-200">Pause</p>
									</div>
								</ContextMenu.Item>
								<ContextMenu.Item class="outline-none" onSelect={() => handleCancel(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
									>
										<IconX class="text-neutral-200" />
										<p class="px-1.5 font-medium text-neutral-200">Cancel</p>
									</div>
								</ContextMenu.Item>
								<ContextMenu.Item class="outline-none" onSelect={() => handleDelete(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-rose-500 hover:bg-rose-600/50"
									>
										<IconTrash class="text-rose-500" />
										<p class="px-1.5 font-medium text-rose-500">Delete</p>
									</div>
								</ContextMenu.Item>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{/each}
				</div>
			{/if}
		{:catch error}
			<p class="text-center text-red-500">Error loading subscriptions</p>
		{/await}
	</div>
</div>
