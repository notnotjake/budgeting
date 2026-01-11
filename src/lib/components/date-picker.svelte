<script lang="ts">
	import { IconChevronLeft, IconCheck, IconChevronRight, IconRestore } from '@tabler/icons-svelte'
	import {
		CalendarDate,
		startOfWeek,
		getLocalTimeZone,
		today,
		isSameDay
	} from '@internationalized/date'
	import { createClass } from '@opensky/style'
	import { Combobox } from 'bits-ui'

	let {
		selectedDate = $bindable(today(getLocalTimeZone())),
		onSelectedDateChange,
		expanded = $bindable(true)
	}: {
		selectedDate?: CalendarDate
		onSelectedDateChange?: (date: CalendarDate) => void
		expanded?: boolean
	} = $props()

	// Local state
	let currentVisibleMonth = $state(formatMonthYear(today(getLocalTimeZone())))
	let scrollElement: HTMLDivElement

	const todayDate = today(getLocalTimeZone())
	const todayWeekStart = startOfWeek(todayDate, 'en-US')

	// Month and day input states
	const months = [
		{ value: '1', label: 'Jan' },
		{ value: '2', label: 'Feb' },
		{ value: '3', label: 'Mar' },
		{ value: '4', label: 'Apr' },
		{ value: '5', label: 'May' },
		{ value: '6', label: 'Jun' },
		{ value: '7', label: 'Jul' },
		{ value: '8', label: 'Aug' },
		{ value: '9', label: 'Sep' },
		{ value: '10', label: 'Oct' },
		{ value: '11', label: 'Nov' },
		{ value: '12', label: 'Dec' }
	]

	let monthComboboxOpen = $state(false)
	let monthInputValue = $state('')
	let dayInputFocused = $state(false)
	let dayInputValue = $state('')

	// Derive values from the single source of truth: selectedDate
	const selectedMonthValue = $derived(String(selectedDate.month))
	const selectedMonthLabel = $derived(
		months.find((m) => m.value === selectedMonthValue)?.label ?? ''
	)
	const selectedDayValue = $derived(String(selectedDate.day))

	// The displayed month text: show search input when typing, otherwise show the selected month
	const monthDisplayValue = $derived(
		monthComboboxOpen && monthInputValue ? monthInputValue : selectedMonthLabel
	)

	// The displayed day text: show typed input when focused, otherwise show the selected day
	const dayDisplayValue = $derived(
		dayInputFocused && dayInputValue ? dayInputValue : selectedDayValue
	)

	// Filter months based on what user is typing
	const filteredMonths = $derived(
		monthInputValue === ''
			? months
			: months.filter((month) => month.label.toLowerCase().includes(monthInputValue.toLowerCase()))
	)

	// Get days in a given month
	function getDaysInMonth(year: number, month: number): number {
		return new CalendarDate(year, month, 1).add({ months: 1 }).add({ days: -1 }).day
	}

	const daysInSelectedMonth = $derived(getDaysInMonth(selectedDate.year, selectedDate.month))

	function handleMonthSelect(value: string | undefined) {
		if (!value) return
		const newMonth = parseInt(value)
		const maxDay = getDaysInMonth(selectedDate.year, newMonth)
		const newDay = Math.min(selectedDate.day, maxDay)
		const newDate = new CalendarDate(selectedDate.year, newMonth, newDay)
		selectedDate = newDate
		onSelectedDateChange?.(newDate)
	}

	function handleMonthInputChange(e: Event) {
		monthInputValue = (e.target as HTMLInputElement).value
	}

	function handleMonthComboboxClose() {
		monthInputValue = ''
	}

	function handleDayFocus() {
		dayInputFocused = true
		dayInputValue = ''
	}

	function handleDayInput(e: Event) {
		const input = e.target as HTMLInputElement
		const value = input.value.replace(/\D/g, '')
		dayInputValue = value

		if (value === '') return

		const dayNum = parseInt(value)
		if (dayNum >= 1 && dayNum <= daysInSelectedMonth) {
			const newDate = new CalendarDate(selectedDate.year, selectedDate.month, dayNum)
			selectedDate = newDate
			onSelectedDateChange?.(newDate)
		}
	}

	function handleDayBlur() {
		dayInputFocused = false
		dayInputValue = ''
	}

	function generateTwoWeekPeriod(weeksOffset: number) {
		// For today to appear in the second week of a period,
		// the period must start one week before today's week
		const periodStart = todayWeekStart.add({ weeks: weeksOffset })

		const weeks = []
		for (let week = 0; week < 2; week++) {
			const weekStartDate = periodStart.add({ weeks: week })
			const weekDates = []

			for (let day = 0; day < 7; day++) {
				weekDates.push(weekStartDate.add({ days: day }))
			}
			weeks.push(weekDates)
		}

		return {
			startDate: periodStart,
			endDate: periodStart.add({ days: 13 }),
			weeks,
			weeksOffset
		}
	}

	// Generate periods where today appears in the second week of the "current" period
	// The current period should start 1 week before today's week (offset -1)
	const allPeriods = [-9, -7, -5, -3, -1, 1].map((offset) => generateTwoWeekPeriod(offset))

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	function formatWeekday(date: CalendarDate) {
		return date.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
			weekday: 'short'
		})
	}

	function formatMonthYear(date: CalendarDate) {
		return date.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		})
	}

	// Update visible month based on scroll position
	function handleScroll() {
		if (!scrollElement) return

		const scrollLeft = scrollElement.scrollLeft
		const containerWidth = scrollElement.offsetWidth
		const currentPeriodIndex = Math.round(scrollLeft / containerWidth)

		if (currentPeriodIndex >= 0 && currentPeriodIndex < allPeriods.length) {
			const currentPeriod = allPeriods[currentPeriodIndex]
			currentVisibleMonth = formatMonthYear(currentPeriod.startDate)
		}
	}

	function goToPrevious() {
		if (scrollElement) {
			const containerWidth = scrollElement.offsetWidth
			scrollElement.scrollBy({
				left: -containerWidth,
				behavior: 'smooth'
			})
		}
	}

	function goToNext() {
		if (scrollElement) {
			const containerWidth = scrollElement.offsetWidth
			scrollElement.scrollBy({
				left: containerWidth,
				behavior: 'smooth'
			})
		}
	}

	function goToToday() {
		selectedDate = todayDate
		onSelectedDateChange?.(todayDate)

		if (scrollElement) {
			// Today appears in the period with offset -1, which is at index 4
			const todayPeriodIndex = 4
			const containerWidth = scrollElement.offsetWidth
			scrollElement.scrollTo({
				left: todayPeriodIndex * containerWidth,
				behavior: 'smooth'
			})
		}
	}

	function selectDate(date: CalendarDate) {
		selectedDate = date
		onSelectedDateChange?.(date)
	}

	function getDateClasses(date: CalendarDate) {
		const isToday = isSameDay(date, todayDate)
		const isSelected = isSameDay(date, selectedDate)
		const isFuture = date.compare(todayDate) > 0

		return createClass(
			'relative h-12 w-full flex items-center justify-center text-[1.1rem] font-medium rounded-full transition-all cursor-pointer active:scale-95',
			'text-neutral-200 bg-transparent hover:bg-neutral-700',
			isToday && 'text-rose-600 font-bold',
			isFuture && 'text-neutral-400',
			isSelected && 'text-sky-100'
		)
	}

	// Initialize scroll position to today's period
	$effect(() => {
		if (scrollElement) {
			// Today appears in the period with offset -1, which is at index 4
			const todayPeriodIndex = 4
			const containerWidth = scrollElement.offsetWidth
			scrollElement.scrollLeft = todayPeriodIndex * containerWidth
		}
	})
</script>

<div
	class="w-full overflow-hidden rounded-3xl bg-neutral-800 py-2 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
>
	<!-- Header -->
	<div class="border-b border-neutral-600 px-2 pb-2">
		<div class="flex items-center gap-3">
			<!-- Left side - Weekday, Month Combobox, Day Input -->
			<div class="flex items-center gap-1 pl-3">
				<p class="text-xl font-medium tracking-tight-sm text-neutral-100">
					{formatWeekday(selectedDate)},
				</p>

				<!-- Month Combobox -->
				<Combobox.Root
					type="single"
					value={selectedMonthValue}
					onValueChange={handleMonthSelect}
					bind:open={monthComboboxOpen}
					onOpenChangeComplete={(o) => {
						if (!o) handleMonthComboboxClose()
					}}
					inputValue={monthDisplayValue}
				>
					<Combobox.Input
						oninput={handleMonthInputChange}
						onfocus={() => (monthComboboxOpen = true)}
						tabindex={-1}
						class="w-12 bg-transparent text-xl font-medium tracking-tight-sm text-neutral-100 focus:outline-none"
						aria-label="Select month"
					/>
					<Combobox.Content
						class="z-50 max-h-48 overflow-y-auto rounded-xl border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
						sideOffset={4}
					>
						{#each filteredMonths as month (month.value)}
							<Combobox.Item
								class="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-neutral-200 outline-none data-[highlighted]:bg-neutral-700"
								value={month.value}
								label={month.label}
							>
								{#snippet children({ selected })}
									{month.label}
									{#if selected}
										<IconCheck size={16} class="ml-auto text-sky-400" />
									{/if}
								{/snippet}
							</Combobox.Item>
						{:else}
							<span class="block px-3 py-2 text-sm text-neutral-500">No results</span>
						{/each}
					</Combobox.Content>
				</Combobox.Root>

				<!-- Day Number Input -->
				<input
					type="text"
					inputmode="numeric"
					tabindex={-1}
					class="w-8 bg-transparent text-xl font-medium tracking-tight-sm text-neutral-100 focus:outline-none"
					value={dayDisplayValue}
					onfocus={handleDayFocus}
					oninput={handleDayInput}
					onblur={handleDayBlur}
					maxlength="2"
					aria-label="Enter day"
				/>
			</div>

			<div class="w-full grow"></div>

			<!-- Right side - Navigation -->
			<div class="flex items-center gap-2">
				{#if !isSameDay(selectedDate, todayDate)}
					<button
						onclick={goToToday}
						class="flex items-center gap-1.5 rounded-full bg-linear-to-b from-red-500/15 to-rose-500/15 px-4 py-2 pl-3 active:scale-95"
						aria-label="Go to today"
					>
						<IconRestore size={16} stroke={2.5} class="text-rose-500" />
						<p class="font-mono text-sm font-semibold tracking-tight text-rose-500">Today</p>
					</button>
				{/if}

				<button
					onclick={goToPrevious}
					class="rounded-full p-2 text-neutral-300 transition-colors hover:bg-neutral-700"
					aria-label="Previous period"
				>
					<IconChevronLeft size={21} stroke={2.5} />
				</button>

				<button
					onclick={goToNext}
					class="rounded-full p-2 text-neutral-300 transition-colors hover:bg-neutral-700"
					aria-label="Next period"
				>
					<IconChevronRight size={21} stroke={2.5} />
				</button>
			</div>
		</div>
	</div>

	<!-- Scrollable Calendar Container -->
	<div
		bind:this={scrollElement}
		onscroll={handleScroll}
		class="flex overflow-x-auto"
		style="scroll-snap-type: x mandatory; -ms-overflow-style: none; scrollbar-width: none;"
	>
		{#each allPeriods as period (period.weeksOffset)}
			<div class="min-w-full shrink-0 px-4" style="scroll-snap-align: start;">
				<div class="h-full w-full">
					<!-- Weekday Headers -->
					<div class="grid grid-cols-7 gap-1">
						{#each weekdays as day (day)}
							<div
								class={createClass(
									'py-2 text-center text-[0.85rem] font-medium text-neutral-400 uppercase',
									(day === 'Sun' || day === 'Sat') && 'text-neutral-500'
								)}
							>
								{day}
							</div>
						{/each}
					</div>

					<!-- Date Grid -->
					<div class="space-y-1">
						{#each period.weeks as week (week)}
							<div class="grid grid-cols-7 gap-1">
								{#each week as date (date)}
									<button onclick={() => selectDate(date)} class={getDateClasses(date)}>
										<div
											class={createClass(
												'absolute inset-0 z-0 h-full w-full rounded-full bg-linear-to-b from-blue-500 to-sky-500 transition-opacity',
												isSameDay(date, selectedDate) ? 'opacity-100' : 'opacity-0'
											)}
										></div>
										<div class="z-10">
											{date.day}
										</div>
									</button>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.overflow-x-auto::-webkit-scrollbar {
		display: none;
	}
</style>
