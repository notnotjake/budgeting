<script lang="ts">
	import { createClass } from '@opensky/style'
	import {
		IconArrowUp,
		IconCalendarWeekFilled,
		IconBuildingStore,
		IconCurrencyDollar,
		IconTagFilled,
		IconArrowBackUp,
		IconRepeat,
		IconArrowLeft,
		IconCreditCard,
		IconReceiptDollarFilled
	} from '@tabler/icons-svelte'
	import { Tooltip, Popover } from 'bits-ui'
	import InputAdapting from '$ui/input/input-adapting.svelte'
	import {
		today,
		getLocalTimeZone,
		isSameDay,
		parseDate,
		CalendarDate
	} from '@internationalized/date'
	import { wipeHorizontal } from '$ui/transition'
	import DatePicker from './date.svelte'
	import { goto } from '$app/navigation'

	type Props = {
		onSubmit: (data: {
			name: string
			company: string | undefined
			account: string | undefined
			amount: number
			dueDate: string
			frequency: 'day' | 'month'
			frequencyInterval: number
		}) => Promise<void>
		isSubmitting?: boolean
		accounts?: string[]
	}
	let { onSubmit, isSubmitting = false, accounts = [] }: Props = $props()

	let datePickerOpen = $state(false)
	let accountPopoverOpen = $state(false)

	let date = $state(today(getLocalTimeZone()))
	let name = $state('')
	let company = $state('')
	let account = $state('')
	let amount = $state('')
	let frequencyOption = $state<'weekly' | 'monthly' | 'yearly'>('monthly')
	let frequencyDropdownOpen = $state(false)

	// Filter accounts based on input
	let filteredAccounts = $derived.by(() => {
		const trimmedInput = account.trim().toLowerCase()
		if (!trimmedInput) return accounts
		return accounts.filter((a) => a.toLowerCase().includes(trimmedInput))
	})

	// Check if current input exactly matches an existing account
	let isExactMatch = $derived(
		accounts.some((a) => a.toLowerCase() === account.trim().toLowerCase())
	)

	let isSubmitAvailable = $derived(
		name.trim() !== '' && amount.trim() !== '' && parseFloat(amount) > 0
	)

	let isToday = $derived(isSameDay(date, today(getLocalTimeZone())))
	let dateString = $derived(
		date
			.toDate(getLocalTimeZone())
			.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
	)

	// Convert frequency option to db values
	function getFrequencyValues(option: 'weekly' | 'monthly' | 'yearly') {
		switch (option) {
			case 'weekly':
				return { frequency: 'day' as const, frequencyInterval: 7 }
			case 'monthly':
				return { frequency: 'month' as const, frequencyInterval: 1 }
			case 'yearly':
				return { frequency: 'month' as const, frequencyInterval: 12 }
		}
	}

	const handleSubmit = async () => {
		if (!isSubmitAvailable || isSubmitting) return

		const { frequency, frequencyInterval } = getFrequencyValues(frequencyOption)

		await onSubmit({
			name: name.trim(),
			company: company.trim() || undefined,
			account: account.trim() || undefined,
			amount: parseFloat(amount),
			dueDate: date.toString(),
			frequency,
			frequencyInterval
		})

		// Reset form
		name = ''
		company = ''
		account = ''
		amount = ''
		date = today(getLocalTimeZone())
		frequencyOption = 'monthly'
	}

	const clearForm = () => {
		name = ''
		company = ''
		account = ''
		amount = ''
		date = today(getLocalTimeZone())
		frequencyOption = 'monthly'
	}
</script>

<div
	class="pointer-events-auto flex h-fit w-fit items-center gap-1 rounded-4xl bg-[#FAF8FB] px-2 py-1 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_1px_1.5px_0px_rgba(0,0,0,0.08),0_2px_30px_11px_rgba(0,0,0,0.04)] dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
>
	<Tooltip.Provider delayDuration={600}>
		<!-- Back to App -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						tabindex="-1"
						onclick={() => goto('/app')}
						class="flex aspect-square h-8 w-8 items-center justify-center rounded-full bg-linear-to-b from-blue-400 to-blue-600 p-2 transition-transform active:scale-95"
					>
						<IconArrowLeft size={18} class="text-white/90" stroke={2.5} />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Back to App')}
		</Tooltip.Root>

		<div class="ml-1 h-full min-h-8 w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

		<!-- Subscription Name -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<label
						{...props}
						tabindex="-1"
						class={createClass(
							'flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
							'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
						)}
					>
						<IconTagFilled size={22} class="shrink-0 grow text-blue-500" />
						<InputAdapting
							class={createClass(
								'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
								'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
								'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
								'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
							)}
							type="text"
							placeholderIsMinWidth={true}
							maxWidth="var(--container-3xs)"
							bind:value={name}
							placeholder="Name"
						/>
					</label>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Subscription Name')}
		</Tooltip.Root>

		<!-- Company -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<label
						{...props}
						tabindex="-1"
						class={createClass(
							'flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
							'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
						)}
					>
						<IconBuildingStore size={22} class="shrink-0 grow text-neutral-500" />
						<InputAdapting
							class={createClass(
								'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
								'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
								'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
								'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
							)}
							type="text"
							placeholderIsMinWidth={true}
							maxWidth="var(--container-3xs)"
							bind:value={company}
							placeholder="Company"
						/>
					</label>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Company (Optional)')}
		</Tooltip.Root>

		<!-- Account -->
		<Tooltip.Root disabled={accountPopoverOpen}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<label
						{...props}
						tabindex="-1"
						class={createClass(
							'relative flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
							'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
						)}
					>
						<IconCreditCard size={22} class="shrink-0 text-neutral-500" />
						<input
							type="text"
							bind:value={account}
							class={createClass(
								'w-20 bg-transparent outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
								'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
								'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
								'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
							)}
							placeholder="Account"
							onfocus={() => (accountPopoverOpen = true)}
							onblur={() => setTimeout(() => (accountPopoverOpen = false), 150)}
						/>
						{#if accountPopoverOpen && (filteredAccounts.length > 0 || accounts.length > 0)}
							<div
								class="absolute top-full left-0 z-300 mt-1 max-h-60 w-48 overflow-y-auto rounded-xl bg-white p-1 shadow-lg dark:bg-neutral-800"
							>
								{#if filteredAccounts.length > 0}
									{#each filteredAccounts as acc (acc)}
										<button
											type="button"
											class="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
											onmousedown={() => {
												account = acc
												accountPopoverOpen = false
											}}
										>
											{acc}
										</button>
									{/each}
								{:else}
									<div class="px-3 py-2 text-sm text-neutral-500">No matches</div>
								{/if}
							</div>
						{/if}
					</label>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Account/Card (Optional)')}
		</Tooltip.Root>

		<div class="h-full min-h-8 w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

		<!-- Amount -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<label
						{...props}
						tabindex="-1"
						class={createClass(
							'flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
							'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
						)}
					>
						<IconReceiptDollarFilled size={22} class="shrink-0 grow text-green-600" />
						<InputAdapting
							class={createClass(
								'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
								'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
								'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
								'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
							)}
							type="text"
							placeholderIsMinWidth={true}
							maxWidth="var(--container-4xs)"
							bind:value={amount}
							placeholder="0.00"
						/>
					</label>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Amount')}
		</Tooltip.Root>

		<!-- Date -->
		<Popover.Root bind:open={datePickerOpen}>
			<Tooltip.Root disabled={datePickerOpen}>
				<Tooltip.Trigger>
					{#snippet child({ props: tooltipProps })}
						<Popover.Trigger>
							{#snippet child({ props: popoverProps })}
								<button
									{...tooltipProps}
									{...popoverProps}
									class={createClass(
										'flex min-h-8 w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full bg-neutral-300/0 px-3 will-change-transform hover:bg-neutral-200/80 active:scale-95 dark:bg-neutral-700/0 dark:hover:bg-neutral-700/80',
										datePickerOpen && 'bg-neutral-200/80'
									)}
								>
									<IconCalendarWeekFilled size={22} class="shrink-0 grow text-rose-600" />
									{#if isToday}
										<p
											transition:wipeHorizontal={{ duration: 125 }}
											class="w-fit shrink-0 grow font-normal whitespace-nowrap text-neutral-500 dark:text-neutral-400"
										>
											Today
										</p>
									{/if}
									<p
										class="w-fit shrink-0 grow font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200"
									>
										{dateString}
									</p>
								</button>
							{/snippet}
						</Popover.Trigger>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Due Date')}
			</Tooltip.Root>
			<Popover.Portal>
				<Popover.Content
					side="top"
					sideOffset={4}
					align="start"
					class="z-100 w-96"
					trapFocus={false}
				>
					<DatePicker bind:selectedDate={date} bind:expanded={datePickerOpen} />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>

		<!-- Frequency Dropdown -->
		<Tooltip.Root disabled={frequencyDropdownOpen}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<div {...props} class="relative">
						<button
							tabindex="-1"
							onclick={() => (frequencyDropdownOpen = !frequencyDropdownOpen)}
							onblur={() => setTimeout(() => (frequencyDropdownOpen = false), 150)}
							class={createClass(
								'flex min-h-8 w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 will-change-transform hover:bg-neutral-200/80 active:scale-95',
								'dark:hover:bg-neutral-700/80',
								frequencyDropdownOpen && 'bg-neutral-200/80 dark:bg-neutral-700/80'
							)}
						>
							<IconRepeat size={20} class="shrink-0 text-neutral-500" />
							<p class="font-medium text-neutral-800 dark:text-neutral-200">
								{frequencyOption === 'weekly' ? 'Weekly' : frequencyOption === 'monthly' ? 'Monthly' : 'Yearly'}
							</p>
						</button>
						{#if frequencyDropdownOpen}
							<div
								class="absolute top-full left-0 z-300 mt-1 w-32 overflow-hidden rounded-xl bg-white p-1 shadow-lg dark:bg-neutral-800"
							>
								{#each ['weekly', 'monthly', 'yearly'] as option (option)}
									<button
										type="button"
										class={createClass(
											'w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-neutral-100 dark:hover:bg-neutral-700',
											frequencyOption === option
												? 'font-medium text-neutral-900 dark:text-white'
												: 'text-neutral-700 dark:text-neutral-200'
										)}
										onmousedown={() => {
											frequencyOption = option as 'weekly' | 'monthly' | 'yearly'
											frequencyDropdownOpen = false
										}}
									>
										{option.charAt(0).toUpperCase() + option.slice(1)}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Frequency')}
		</Tooltip.Root>

		<div class="h-full min-h-8 w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						tabindex="-1"
						onclick={clearForm}
						class="mr-2 ml-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
					>
						<IconArrowBackUp />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Clear Form')}
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						tabindex="-1"
						disabled={!isSubmitAvailable || isSubmitting}
						onclick={handleSubmit}
						class={createClass(
							'z-50 -mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-500 p-1.5 shadow-md transition-all',
							'active:scale-95 disabled:cursor-not-allowed',
							isSubmitAvailable && !isSubmitting
								? 'bg-neutral-800 text-white shadow-md dark:bg-neutral-300 dark:text-neutral-900'
								: 'bg-neutral-300/70 text-neutral-400 shadow-none dark:bg-neutral-700 dark:text-neutral-500'
						)}
					>
						<IconArrowUp stroke={3} size={26} />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent(isSubmitting ? 'Adding...' : 'Add Subscription')}
		</Tooltip.Root>
	</Tooltip.Provider>
</div>

{#snippet tooltipContent(text: string)}
	<Tooltip.Content side="bottom" sideOffset={5} align="center" class="z-200">
		<div class="rounded-2xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50">
			{text}
		</div>
	</Tooltip.Content>
{/snippet}
