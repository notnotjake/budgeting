<script lang="ts">
	import { createClass } from '@opensky/style'
	import {
		IconPlus,
		IconCalendarWeekFilled,
		IconArrowBackUp,
		IconRepeat,
		IconReceiptDollarFilled,
		IconFileDescriptionFilled,
		IconChevronDown
	} from '@tabler/icons-svelte'
	import { Tooltip, Popover } from 'bits-ui'
	import InputAdapting from '$ui/input/input-adapting.svelte'
	import ControlStripInfo from './control-strip-info.svelte'
	import { today, getLocalTimeZone, isSameDay } from '@internationalized/date'
	import { wipeHorizontal } from '$ui/transition'
	import { tick } from 'svelte'
	import DatePicker from '$lib/components/date-picker.svelte'
	import { z } from 'zod'
	import { slide } from 'svelte/transition'

	// Currency validation: allows numbers with optional commas and up to 2 decimal places
	const currencySchema = z
		.string()
		.regex(/^-?\d{1,3}(,\d{3})*(\.\d{0,2})?$|^-?\d+(\.\d{0,2})?$/, 'Invalid currency format')

	type Props = {
		onSubmit: (data: {
			name: string
			company: string | undefined
			account: string | undefined
			tag: string | undefined
			amount: number
			dueDate: string
			frequency: 'day' | 'month'
			frequencyInterval: number
		}) => Promise<void>
		isSubmitting?: boolean
		accounts?: string[]
		tags?: string[]
	}
	let { onSubmit, isSubmitting = false, accounts = [], tags = [] }: Props = $props()

	let datePickerOpen = $state(false)
	let mobileExpanded = $state(false)

	let date = $state(today(getLocalTimeZone()))
	let name = $state('')
	let company = $state('')
	let account = $state('')
	let tag = $state('')
	let amount = $state('')
	let frequencyOption = $state<'weekly' | 'monthly' | 'yearly'>('monthly')
	let frequencyDropdownOpen = $state(false)

	// Amount is valid if empty (not yet entered) or passes currency validation
	let isAmountValid = $derived(
		amount.trim() === '' || currencySchema.safeParse(amount).success
	)

	let isSubmitAvailable = $derived(
		name.trim() !== '' &&
			amount.trim() !== '' &&
			isAmountValid &&
			parseFloat(amount.replace(/,/g, '')) > 0
	)

	let isToday = $derived(isSameDay(date, today(getLocalTimeZone())))
	let dateString = $derived(
		date
			.toDate(getLocalTimeZone())
			.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
	)

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	function formatCurrency(value: string): string {
		// Strip existing commas and parse
		const num = parseFloat(value.replace(/,/g, ''))
		if (isNaN(num)) return value
		// Format with commas and exactly 2 decimal places
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	}

	async function handleAmountFocus(e: FocusEvent): Promise<void> {
		const input = e.currentTarget as HTMLInputElement
		await tick()
		input.select()
	}

	function handleAmountBlur(): void {
		if (amount.trim() && isAmountValid) {
			amount = formatCurrency(amount)
		}
	}

	let frequencyLabel = $derived(capitalize(frequencyOption))

	const frequencyMap = {
		weekly: { frequency: 'day' as const, frequencyInterval: 7 },
		monthly: { frequency: 'month' as const, frequencyInterval: 1 },
		yearly: { frequency: 'month' as const, frequencyInterval: 12 }
	}

	function clearForm(): void {
		name = ''
		company = ''
		account = ''
		tag = ''
		amount = ''
		date = today(getLocalTimeZone())
		frequencyOption = 'monthly'
	}

	async function handleSubmit(): Promise<void> {
		if (!isSubmitAvailable || isSubmitting) return

		const { frequency, frequencyInterval } = frequencyMap[frequencyOption]

		await onSubmit({
			name: name.trim(),
			company: company.trim() || undefined,
			account: account.trim() || undefined,
			tag: tag.trim() || undefined,
			amount: parseFloat(amount.replace(/,/g, '')),
			dueDate: date.toString(),
			frequency,
			frequencyInterval
		})

		clearForm()
	}
</script>

<!-- Desktop Layout (md and above) -->
<div
	class="pointer-events-auto hidden h-fit w-fit items-center gap-1 rounded-4xl bg-[#FAF8FB] px-2 py-1 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_1px_1.5px_0px_rgba(0,0,0,0.08),0_2px_30px_11px_rgba(0,0,0,0.04)] dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)] md:flex"
>
	<Tooltip.Provider delayDuration={600}>
		<!-- Clear Form -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						tabindex="-1"
						onclick={clearForm}
						class="mr-1 ml-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
					>
						<IconArrowBackUp />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Clear Form')}
		</Tooltip.Root>

		<div class="h-full min-h-8 w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

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
						<IconFileDescriptionFilled size={22} class="shrink-0 grow text-blue-500" />
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

		<!-- Company/Tag/Account Info -->
		<ControlStripInfo bind:company bind:tag bind:account {accounts} {tags} />

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
								'dark:selection:bg-sky-500 dark:selection:text-white',
								'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
								'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400',
								isAmountValid
									? 'dark:text-white'
									: 'text-red-500 dark:text-red-400'
							)}
							type="text"
							placeholderIsMinWidth={true}
							maxWidth="var(--container-4xs)"
							bind:value={amount}
							placeholder="0.00"
							onfocus={handleAmountFocus}
							onblur={handleAmountBlur}
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
								{frequencyLabel}
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
										{capitalize(option)}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent('Frequency')}
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
						<IconPlus stroke={3} size={26} />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			{@render tooltipContent(isSubmitting ? 'Adding...' : 'Add Subscription')}
		</Tooltip.Root>
	</Tooltip.Provider>
</div>

<!-- Mobile Layout (below md) -->
<div
	class={createClass(
		'pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm flex-col rounded-4xl bg-[#FAF8FB] px-3 py-2 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_1px_1.5px_0px_rgba(0,0,0,0.08),0_2px_30px_11px_rgba(0,0,0,0.04)] dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)] md:hidden'
	)}
>
	<!-- Row 1: Name + Amount (always visible) -->
	<button
		type="button"
		onclick={() => (mobileExpanded = !mobileExpanded)}
		class="flex w-full cursor-pointer items-center gap-2"
	>
		<!-- Name Input -->
		<label
			onclick={(e) => e.stopPropagation()}
			class={createClass(
				'flex min-h-10 flex-1 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
				'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
			)}
		>
			<IconFileDescriptionFilled size={22} class="shrink-0 text-blue-500" />
			<InputAdapting
				class={createClass(
					'w-full outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
					'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
					'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
					'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
				)}
				type="text"
				placeholderIsMinWidth={true}
				maxWidth="100%"
				bind:value={name}
				placeholder="Name"
			/>
		</label>

		<div class="h-8 w-0.5 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

		<!-- Amount Input -->
		<label
			onclick={(e) => e.stopPropagation()}
			class={createClass(
				'flex min-h-10 w-24 shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
				'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
			)}
		>
			<IconReceiptDollarFilled size={22} class="shrink-0 text-green-600" />
			<InputAdapting
				class={createClass(
					'w-full outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
					'dark:selection:bg-sky-500 dark:selection:text-white',
					'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
					'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400',
					isAmountValid ? 'dark:text-white' : 'text-red-500 dark:text-red-400'
				)}
				type="text"
				placeholderIsMinWidth={true}
				maxWidth="100%"
				bind:value={amount}
				placeholder="0.00"
				onfocus={handleAmountFocus}
				onblur={handleAmountBlur}
			/>
		</label>

		<!-- Expand/Collapse Indicator -->
		<div
			class={createClass(
				'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform',
				mobileExpanded && 'rotate-180'
			)}
		>
			<IconChevronDown size={20} class="text-neutral-400" />
		</div>
	</button>

	<!-- Expanded Content -->
	{#if mobileExpanded}
		<div transition:slide={{ duration: 200 }} class="flex flex-col gap-2 pt-2">
			<!-- Row 2: Company/Tag/Account Info -->
			<div class="flex items-center">
				<ControlStripInfo bind:company bind:tag bind:account {accounts} {tags} />
			</div>

			<!-- Row 3: Date + Frequency -->
			<div class="flex items-center gap-2">
				<!-- Date -->
				<Popover.Root bind:open={datePickerOpen}>
					<Popover.Trigger>
						{#snippet child({ props: popoverProps })}
							<button
								{...popoverProps}
								class={createClass(
									'flex min-h-10 w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full bg-neutral-300/0 px-3 will-change-transform hover:bg-neutral-200/80 active:scale-95 dark:bg-neutral-700/0 dark:hover:bg-neutral-700/80',
									datePickerOpen && 'bg-neutral-200/80'
								)}
							>
								<IconCalendarWeekFilled size={22} class="shrink-0 text-rose-600" />
								{#if isToday}
									<p
										transition:wipeHorizontal={{ duration: 125 }}
										class="w-fit shrink-0 font-normal whitespace-nowrap text-neutral-500 dark:text-neutral-400"
									>
										Today
									</p>
								{/if}
								<p
									class="w-fit shrink-0 font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200"
								>
									{dateString}
								</p>
							</button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							side="top"
							sideOffset={4}
							align="start"
							class="z-100 w-[calc(100vw-2rem)] max-w-sm"
							trapFocus={false}
						>
							<DatePicker bind:selectedDate={date} bind:expanded={datePickerOpen} />
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>

				<!-- Frequency Dropdown -->
				<div class="relative">
					<button
						tabindex="-1"
						onclick={() => (frequencyDropdownOpen = !frequencyDropdownOpen)}
						onblur={() => setTimeout(() => (frequencyDropdownOpen = false), 150)}
						class={createClass(
							'flex min-h-10 w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 will-change-transform hover:bg-neutral-200/80 active:scale-95',
							'dark:hover:bg-neutral-700/80',
							frequencyDropdownOpen && 'bg-neutral-200/80 dark:bg-neutral-700/80'
						)}
					>
						<IconRepeat size={20} class="shrink-0 text-neutral-500" />
						<p class="font-medium text-neutral-800 dark:text-neutral-200">
							{frequencyLabel}
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
									{capitalize(option)}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Row 4: Clear + Add buttons -->
			<div class="flex items-center justify-between pt-1">
				<button
					type="button"
					onclick={clearForm}
					class={createClass(
						'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 transition-all',
						'active:scale-95',
						'bg-neutral-300/70 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
					)}
				>
					<IconArrowBackUp size={22} />
				</button>
				<button
					type="button"
					disabled={!isSubmitAvailable || isSubmitting}
					onclick={handleSubmit}
					class={createClass(
						'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 shadow-md transition-all',
						'active:scale-95 disabled:cursor-not-allowed',
						isSubmitAvailable && !isSubmitting
							? 'bg-neutral-800 text-white shadow-md dark:bg-neutral-300 dark:text-neutral-900'
							: 'bg-neutral-300/70 text-neutral-400 shadow-none dark:bg-neutral-700 dark:text-neutral-500'
					)}
				>
					<IconPlus stroke={3} size={26} />
				</button>
			</div>
		</div>
	{/if}
</div>

{#snippet tooltipContent(text: string)}
	<Tooltip.Content side="bottom" sideOffset={5} align="center" class="z-200">
		<div class="rounded-2xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50">
			{text}
		</div>
	</Tooltip.Content>
{/snippet}
