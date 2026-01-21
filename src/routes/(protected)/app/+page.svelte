<script lang="ts">
	import {
		getSubscriptions,
		getAccounts,
		getTags,
		createSubscription,
		updateSubscription,
		deleteSubscription,
		pauseSubscription,
		cancelSubscription
	} from '$remotes/subscriptions.remote'
	import { getUserPrefs, updateUserPrefs } from '$remotes/user-prefs.remote'
	import { subscriptionsToCSV, copyCSVToClipboard, downloadCSV } from '$lib/utils/csv-export'
	import { createClass } from '@opensky/style'
	import { Popover, RadioGroup } from 'bits-ui'
	import {
		IconArrowsDownUp,
		IconArrowNarrowUp,
		IconChevronDown,
		IconDownload,
		IconCopy,
		IconCheck,
		IconFilter2,
		IconChevronRight
	} from '@tabler/icons-svelte'
	import { Adapt } from '$ui/adapt'
	import { scale } from 'svelte/transition'
	import ControlStrip from './control-strip.svelte'
	import SubscriptionRow from '$lib/components/subscriptions/subscription-row.svelte'

	let isSubmitting = $state(false)
	let editingId = $state<string | null>(null)
	let subscriptions = $derived(await getSubscriptions())
	let accounts = $derived(await getAccounts())
	let tags = $derived(await getTags())

	let sortBy = $state<'date' | 'status' | 'price' | 'period'>('date')
	let sortReversed = $state(false)
	let sortPopoverOpen = $state(false)
	let displayPeriod = $state<'weekly' | 'monthly' | 'yearly'>('monthly')
	let prefsLoaded = $state(false)

	// Filter state (not persisted)
	let filterPopoverOpen = $state(false)
	let showPaused = $state(true)
	let showCancelled = $state(true)
	let selectedTags = $state<Set<string | null>>(new Set())
	let selectedAccounts = $state<Set<string | null>>(new Set())
	let filterTagsExpanded = $state(false)
	let filterAccountsExpanded = $state(false)

	// Track known tags/accounts to distinguish new items from deselected ones
	let knownTags = $state<Set<string | null>>(new Set())
	let knownAccounts = $state<Set<string | null>>(new Set())

	// Initialize filter selections and auto-include newly created tags/accounts
	$effect(() => {
		// Include null to represent items with no tag/account
		const allTags = new Set<string | null>([null, ...tags])
		const allAccounts = new Set<string | null>([null, ...accounts])

		// Find truly new tags (ones we haven't seen before)
		const newTags: (string | null)[] = []
		for (const tag of allTags) {
			if (!knownTags.has(tag)) {
				newTags.push(tag)
			}
		}

		// Find truly new accounts (ones we haven't seen before)
		const newAccounts: (string | null)[] = []
		for (const account of allAccounts) {
			if (!knownAccounts.has(account)) {
				newAccounts.push(account)
			}
		}

		// Update known sets
		if (newTags.length > 0) {
			knownTags = new Set([...knownTags, ...newTags])
		}
		if (newAccounts.length > 0) {
			knownAccounts = new Set([...knownAccounts, ...newAccounts])
		}

		// Auto-select new tags (preserving user's deselections of existing tags)
		if (newTags.length > 0) {
			selectedTags = new Set([...selectedTags, ...newTags])
		}

		// Auto-select new accounts (preserving user's deselections of existing accounts)
		if (newAccounts.length > 0) {
			selectedAccounts = new Set([...selectedAccounts, ...newAccounts])
		}
	})

	// Load user preferences
	getUserPrefs().then((prefs) => {
		sortBy = prefs.subscriptionSortBy
		sortReversed = prefs.subscriptionSortReversed
		displayPeriod = prefs.subscriptionDisplayPeriod
		prefsLoaded = true
	})

	function handleDisplayPeriodChange(value: 'weekly' | 'monthly' | 'yearly') {
		displayPeriod = value
		updateUserPrefs({ subscriptionDisplayPeriod: value })
	}

	function calculateTotal(
		subscriptions: { amount: string; frequency: 'day' | 'month'; frequencyInterval: number }[],
		period: 'weekly' | 'monthly' | 'yearly'
	) {
		return subscriptions.reduce((sum, sub) => {
			const amount = Number(sub.amount)
			const isWeekly = sub.frequency === 'day' && sub.frequencyInterval === 7
			const isYearly = sub.frequency === 'month' && sub.frequencyInterval === 12
			// isMonthly is the default case

			// First convert to yearly as common base
			let yearlyAmount: number
			if (isWeekly) {
				yearlyAmount = amount * 52
			} else if (isYearly) {
				yearlyAmount = amount
			} else {
				// Monthly
				yearlyAmount = amount * 12
			}

			// Then convert to target period
			if (period === 'weekly') {
				return sum + yearlyAmount / 52
			} else if (period === 'monthly') {
				return sum + yearlyAmount / 12
			} else {
				// yearly
				return sum + yearlyAmount
			}
		}, 0)
	}

	const periodLabels = {
		weekly: 'weekly',
		monthly: 'monthly',
		yearly: 'yearly'
	}

	let periodSelectorOpen = $state<(() => void) | null>(null)
	let periodSelectorClose = $state<(() => void) | null>(null)
	let periodSelectorActive = $state(false)

	function handleSortByChange(value: 'date' | 'status' | 'price' | 'period') {
		sortBy = value
		updateUserPrefs({ subscriptionSortBy: value })
	}

	function handleSortReversedToggle() {
		sortReversed = !sortReversed
		updateUserPrefs({ subscriptionSortReversed: sortReversed })
	}

	function toggleTag(tag: string | null) {
		const newSet = new Set(selectedTags)
		if (newSet.has(tag)) {
			newSet.delete(tag)
		} else {
			newSet.add(tag)
		}
		selectedTags = newSet
	}

	function toggleAccount(account: string | null) {
		const newSet = new Set(selectedAccounts)
		if (newSet.has(account)) {
			newSet.delete(account)
		} else {
			newSet.add(account)
		}
		selectedAccounts = newSet
	}

	function selectAllTags() {
		selectedTags = new Set<string | null>([null, ...tags])
	}

	function deselectAllTags() {
		selectedTags = new Set<string | null>()
	}

	function selectAllAccounts() {
		selectedAccounts = new Set<string | null>([null, ...accounts])
	}

	function deselectAllAccounts() {
		selectedAccounts = new Set<string | null>()
	}

	// Check if all tags/accounts are selected
	let allTagsSelected = $derived.by(() => {
		const allTags = [null, ...tags]
		return allTags.every((tag) => selectedTags.has(tag))
	})

	let allAccountsSelected = $derived.by(() => {
		const allAccounts = [null, ...accounts]
		return allAccounts.every((account) => selectedAccounts.has(account))
	})

	// Derive total cost for selected period (excluding paused and cancelled)
	let total = $derived.by(() => {
		const activeSubscriptions = subscriptions.filter((sub) => !sub.pauseDate && !sub.endDate)
		return calculateTotal(activeSubscriptions, displayPeriod)
	})

	// Derive filtered and sorted subscriptions
	let filteredSubscriptions = $derived.by(() => {
		return subscriptions.filter((sub) => {
			// Filter by status
			if (sub.pauseDate && !showPaused) return false
			if (sub.endDate && !showCancelled) return false

			// Filter by tag
			if (!selectedTags.has(sub.tag)) return false

			// Filter by account
			if (!selectedAccounts.has(sub.account)) return false

			return true
		})
	})

	let sortedSubscriptions = $derived.by(() => {
		const sorted = [...filteredSubscriptions].sort((a, b) => {
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
				case 'price': {
					// Normalize to yearly amount for fair comparison
					const getYearlyAmount = (sub: typeof a) => {
						const amount = Number(sub.amount)
						const isWeekly = sub.frequency === 'day' && sub.frequencyInterval === 7
						const isYearly = sub.frequency === 'month' && sub.frequencyInterval === 12
						if (isWeekly) return amount * 52
						if (isYearly) return amount
						return amount * 12 // monthly
					}
					return getYearlyAmount(a) - getYearlyAmount(b)
				}
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
	})

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
		} catch (e) {
			console.error('Failed to delete subscription', e)
		}
	}

	async function handlePause(id: string) {
		try {
			await pauseSubscription({ id })
		} catch (e) {
			console.error('Failed to pause subscription', e)
		}
	}

	async function handleCancel(id: string) {
		try {
			await cancelSubscription({ id })
		} catch (e) {
			console.error('Failed to cancel subscription', e)
		}
	}

	function handleEdit(id: string) {
		editingId = id
	}

	async function handleSave(data: {
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
	}) {
		try {
			await updateSubscription(data)
			editingId = null
		} catch (e) {
			console.error('Failed to update subscription', e)
			alert('Failed to update subscription')
		}
	}

	function handleCancelEdit(id: string) {
		editingId = null
	}

	let copySuccess = $state(false)

	async function handleCopyCSV() {
		const csv = subscriptionsToCSV(subscriptions)
		const success = await copyCSVToClipboard(csv)
		if (success) {
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		}
	}

	function handleDownloadCSV() {
		const csv = subscriptionsToCSV(subscriptions)
		downloadCSV(csv)
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
	<div class="flex items-center gap-2 pb-8">
		<p class="text-lg text-neutral-500 tabular-nums dark:text-neutral-400">
			{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
		</p>
		<Adapt.Swap
			adaptSize={true}
			bind:open={periodSelectorOpen}
			bind:close={periodSelectorClose}
			bind:isActive={periodSelectorActive}
		>
			<button
				transition:scale={{ duration: 150 }}
				onclick={() => periodSelectorOpen?.()}
				class="flex cursor-pointer items-center gap-0.5 text-sm whitespace-nowrap text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
			>
				<span>per {periodLabels[displayPeriod].slice(0, -2)}</span>
				<IconChevronDown size={14} class="mt-px" />
			</button>

			{#snippet swapContent()}
				<div
					transition:scale={{ duration: 150 }}
					class="flex rounded-full bg-neutral-200 p-0.5 dark:bg-neutral-800"
				>
					{#each ['weekly', 'monthly', 'yearly'] as const as period (period)}
						<button
							onclick={() => {
								handleDisplayPeriodChange(period)
								periodSelectorClose?.()
							}}
							class={createClass(
								'cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-all',
								displayPeriod === period
									? 'bg-white text-neutral-700 shadow-sm dark:bg-neutral-600 dark:text-neutral-100'
									: 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
							)}
						>
							{periodLabels[period]}
						</button>
					{/each}
				</div>
			{/snippet}
		</Adapt.Swap>
	</div>

	<!-- Toolbar Group -->
	<div
		class="sticky top-0 z-200 flex w-full items-center justify-center bg-linear-to-b from-[#F1F1F3] to-transparent pt-2 pb-8 dark:from-neutral-950"
	>
		<ControlStrip onSubmit={handleSubmit} {isSubmitting} {accounts} {tags} />
	</div>

	<!-- Subscriptions List -->
	<div class="w-full max-w-2xl px-6 py-10">
		{#if subscriptions.length === 0}
			<div class="flex flex-col items-center gap-2 py-20">
				<p class="text-neutral-500">No subscriptions yet.</p>
				<p class="text-sm text-neutral-400">Add your first subscription using the toolbar above.</p>
			</div>
		{:else}
			<!-- Filter & Sort Controls -->
			<div class="mb-4 flex justify-end gap-2">
				<!-- Filter Button -->
				<Popover.Root bind:open={filterPopoverOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								class={createClass(
									'flex size-[30px] cursor-pointer items-center justify-center gap-1 rounded-full select-none',
									'bg-white text-neutral-500 shadow-[0px_1px_1px_rgba(0,0,0,0.08),0px_0px_0px_1px_rgba(0,0,0,0.05)]',
									'transition-all hover:shadow-[0px_1px_1px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.1)]',
									'active:scale-[0.99] active:bg-neutral-100',
									'dark:bg-neutral-800 dark:shadow-[0px_1px_1px_rgba(0,0,0,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.1)]',
									'dark:hover:shadow-[0px_1px_1px_rgba(0,0,0,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.2)]',
									'dark:active:bg-neutral-700',
									filterPopoverOpen && 'bg-neutral-100 dark:bg-neutral-700'
								)}
							>
								<IconFilter2 size={16} stroke={2.5} />
							</button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content
						side="bottom"
						align="end"
						sideOffset={8}
						class="z-100 w-52 rounded-[1.15rem] bg-black p-2 shadow-lg dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
					>
						<div class="mb-2 border-b border-neutral-700 pb-2">
							<span class="pl-2 text-sm font-medium text-neutral-300">Filter by status</span>
						</div>
						<!-- Status Toggles -->
						<div class="mb-2 flex flex-col gap-1">
							<button
								onclick={() => (showPaused = !showPaused)}
								class={createClass(
									'flex cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-sm text-neutral-200 outline-none',
									'hover:bg-neutral-600/80',
									showPaused && 'bg-neutral-600/80'
								)}
							>
								<span>Paused</span>
								<span
									class={createClass(
										'size-3.5 rounded-full transition-colors',
										showPaused ? 'bg-blue-500' : 'bg-neutral-600'
									)}
								/>
							</button>
							<button
								onclick={() => (showCancelled = !showCancelled)}
								class={createClass(
									'flex cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-sm text-neutral-200 outline-none',
									'hover:bg-neutral-600/80',
									showCancelled && 'bg-neutral-600/80'
								)}
							>
								<span>Cancelled</span>
								<span
									class={createClass(
										'size-3.5 rounded-full transition-colors',
										showCancelled ? 'bg-blue-500' : 'bg-neutral-600'
									)}
								/>
							</button>
						</div>

						<!-- Tags Submenu -->
						{#if tags.length > 0}
							<div class="border-t border-neutral-700 pt-2">
								<button
									onclick={() => (filterTagsExpanded = !filterTagsExpanded)}
									class="flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-sm text-neutral-200 outline-none hover:bg-neutral-600/80"
								>
									<span>Tags</span>
									<IconChevronRight
										size={14}
										class={createClass(
											'transition-transform',
											filterTagsExpanded && 'rotate-90'
										)}
									/>
								</button>
								{#if filterTagsExpanded}
									<div class="mt-1 flex flex-col gap-0.5 pl-2">
										<button
											onclick={allTagsSelected ? deselectAllTags : selectAllTags}
											class="flex cursor-pointer items-center rounded-lg px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-600/80 hover:text-neutral-200"
										>
											{allTagsSelected ? 'Deselect all' : 'Select all'}
										</button>
										<button
											onclick={() => toggleTag(null)}
											class={createClass(
												'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-sm text-neutral-300 outline-none',
												'hover:bg-neutral-600/80',
												selectedTags.has(null) && 'bg-neutral-700/50'
											)}
										>
											<span class="italic text-neutral-400">No tag</span>
											<span
												class={createClass(
													'size-3 rounded-full transition-colors',
													selectedTags.has(null) ? 'bg-blue-500' : 'bg-neutral-600'
												)}
											/>
										</button>
										{#each tags as tag (tag)}
											<button
												onclick={() => toggleTag(tag)}
												class={createClass(
													'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-sm text-neutral-300 outline-none',
													'hover:bg-neutral-600/80',
													selectedTags.has(tag) && 'bg-neutral-700/50'
												)}
											>
												<span>{tag}</span>
												<span
													class={createClass(
														'size-3 rounded-full transition-colors',
														selectedTags.has(tag) ? 'bg-blue-500' : 'bg-neutral-600'
													)}
												/>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}

						<!-- Accounts Submenu -->
						{#if accounts.length > 0}
							<div class="border-t border-neutral-700 pt-2">
								<button
									onclick={() => (filterAccountsExpanded = !filterAccountsExpanded)}
									class="flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-sm text-neutral-200 outline-none hover:bg-neutral-600/80"
								>
									<span>Accounts</span>
									<IconChevronRight
										size={14}
										class={createClass(
											'transition-transform',
											filterAccountsExpanded && 'rotate-90'
										)}
									/>
								</button>
								{#if filterAccountsExpanded}
									<div class="mt-1 flex flex-col gap-0.5 pl-2">
										<button
											onclick={allAccountsSelected ? deselectAllAccounts : selectAllAccounts}
											class="flex cursor-pointer items-center rounded-lg px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-600/80 hover:text-neutral-200"
										>
											{allAccountsSelected ? 'Deselect all' : 'Select all'}
										</button>
										<button
											onclick={() => toggleAccount(null)}
											class={createClass(
												'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-sm text-neutral-300 outline-none',
												'hover:bg-neutral-600/80',
												selectedAccounts.has(null) && 'bg-neutral-700/50'
											)}
										>
											<span class="italic text-neutral-400">No account</span>
											<span
												class={createClass(
													'size-3 rounded-full transition-colors',
													selectedAccounts.has(null) ? 'bg-blue-500' : 'bg-neutral-600'
												)}
											/>
										</button>
										{#each accounts as account (account)}
											<button
												onclick={() => toggleAccount(account)}
												class={createClass(
													'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-sm text-neutral-300 outline-none',
													'hover:bg-neutral-600/80',
													selectedAccounts.has(account) && 'bg-neutral-700/50'
												)}
											>
												<span>{account}</span>
												<span
													class={createClass(
														'size-3 rounded-full transition-colors',
														selectedAccounts.has(account) ? 'bg-blue-500' : 'bg-neutral-600'
													)}
												/>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</Popover.Content>
				</Popover.Root>

				<!-- Sort Button -->
				<Popover.Root bind:open={sortPopoverOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								class={createClass(
									'flex size-[30px] cursor-pointer items-center justify-center gap-1 rounded-full select-none',
									'bg-white text-neutral-500 shadow-[0px_1px_1px_rgba(0,0,0,0.08),0px_0px_0px_1px_rgba(0,0,0,0.05)]',
									'transition-all hover:shadow-[0px_1px_1px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.1)]',
									'active:scale-[0.99] active:bg-neutral-100',
									'dark:bg-neutral-800 dark:shadow-[0px_1px_1px_rgba(0,0,0,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.1)]',
									'dark:hover:shadow-[0px_1px_1px_rgba(0,0,0,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.2)]',
									'dark:active:bg-neutral-700',
									sortPopoverOpen && 'bg-neutral-100 dark:bg-neutral-700'
								)}
							>
								<IconArrowsDownUp size={16} stroke={2.5} />
							</button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content
						side="bottom"
						align="end"
						sideOffset={8}
						class="z-100 w-48 rounded-[1.15rem] bg-black p-2 shadow-lg dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
					>
						<div class="mb-2 flex items-center justify-between border-b border-neutral-700 pb-2">
							<span class="pl-2 text-sm font-medium text-neutral-300">Sort by</span>
							<button
								onclick={handleSortReversedToggle}
								class={createClass(
									'flex size-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-700',
									sortReversed && 'rotate-180'
								)}
							>
								<IconArrowNarrowUp size={16} />
							</button>
						</div>
						<RadioGroup.Root
							value={sortBy}
							onValueChange={(v) => handleSortByChange(v as 'date' | 'status' | 'price' | 'period')}
							class="flex flex-col gap-1"
						>
							{#each [{ value: 'date', label: 'Renew Date' }, { value: 'status', label: 'Status' }, { value: 'price', label: 'Price' }, { value: 'period', label: 'Period' }] as option (option.value)}
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
			<div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-6">
				{#each sortedSubscriptions as sub (sub.id)}
					<SubscriptionRow
						subscription={sub}
						editing={editingId === sub.id}
						{accounts}
						{tags}
						onEdit={handleEdit}
						onSave={handleSave}
						onCancelEdit={handleCancelEdit}
						onPause={handlePause}
						onCancel={handleCancel}
						onDelete={handleDelete}
					/>
				{/each}
			</div>
			<!-- Export CSV Buttons -->
			<div class="mt-16 flex justify-center gap-3">
				<button
					onclick={handleCopyCSV}
					class={createClass(
						'flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
						'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
						'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
					)}
				>
					{#if copySuccess}
						<IconCheck size={16} class="text-green-500" />
						<span>Copied</span>
					{:else}
						<IconCopy size={16} />
						<span>Copy CSV</span>
					{/if}
				</button>
				<button
					onclick={handleDownloadCSV}
					class={createClass(
						'flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
						'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
						'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
					)}
				>
					<IconDownload size={16} />
					<span>Download CSV</span>
				</button>
			</div>
		{/if}
	</div>
</div>
