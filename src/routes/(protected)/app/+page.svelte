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
		IconFilter2,
		IconArrowNarrowUp,
		IconChevronDown,
		IconDownload,
		IconCopy,
		IconCheck
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

	// Derive total cost for selected period
	let total = $derived.by(() => calculateTotal(subscriptions, displayPeriod))

	// Derive sorted subscriptions
	let sortedSubscriptions = $derived.by(() => {
		const sorted = [...subscriptions].sort((a, b) => {
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
			<!-- Sort Controls -->
			<div class="mb-4 flex justify-end">
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
						<div class="mb-2 flex items-center justify-between border-b border-neutral-700 pb-2">
							<span class="pl-2 text-xs font-medium text-neutral-400">Sort by</span>
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
