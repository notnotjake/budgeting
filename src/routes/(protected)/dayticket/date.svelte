<script lang="ts">
	import {
		IconChevronLeft,
		IconCheck,
		IconChevronRight,
		IconArrowBack,
		IconCircleCaretRightFilled,
		IconRestore
	} from '@tabler/icons-svelte'
	import {
		CalendarDate,
		startOfWeek,
		getLocalTimeZone,
		today,
		isSameDay
	} from '@internationalized/date'
	import { createClass } from '@opensky/style'

	let {
		selectedDate = $bindable(today(getLocalTimeZone())),
		onSelectedDateChange,
		expanded = $bindable(true)
	}: {
		selectedDate?: CalendarDate
		onSelectedDateChange?: (date: CalendarDate) => void
		expanded: Boolean
	} = $props()

	// Local state
	let currentVisibleMonth = $state(formatMonthYear(today(getLocalTimeZone())))
	let scrollElement: HTMLDivElement

	const todayDate = today(getLocalTimeZone())
	const todayWeekStart = startOfWeek(todayDate, 'en-US')

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

	function formatDate(date: CalendarDate) {
		return date.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
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
			'relative h-12 w-full flex items-center justify-center text-[1.1rem] font-medium rounded-full transition-all cursor-pointer dark:text-neutral-300 text-neutral-700 active:scale-95 bg-transparent hover:bg-neutral-400/50 dark:hover:bg-neutral-700/50',
			isToday && 'text-rose-500 font-bold',
			isFuture && 'text-neutral-500/80',
			isSelected && 'text-white/80'
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

<div class="w-full overflow-hidden rounded-4xl bg-neutral-300 px-4 py-4 dark:bg-neutral-700/25">
	<!-- Header -->
	<div class="pb-2">
		<div class="flex items-center gap-3">
			<!-- Left side - Month and Date -->
			<button
				onclick={() => {
					expanded = false
				}}
				class="flex aspect-square h-9 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-sky-500 active:scale-95"
			>
				<IconCheck class="text-white/80" stroke={3} />
			</button>

			<div>
				<p
					class="shrink-0 text-xl font-medium tracking-tight-sm whitespace-nowrap text-neutral-800 dark:text-neutral-300"
				>
					{formatDate(selectedDate)}
				</p>
			</div>

			<div class="w-full grow"></div>

			<!-- Right side - Navigation -->
			<div class="flex items-center gap-2">
				{#if !isSameDay(selectedDate, todayDate)}
					<button
						onclick={goToToday}
						class="flex gap-2 rounded-full bg-gradient-to-b from-red-500/15 to-rose-500/15 px-4 py-2 pl-3 active:scale-95"
						aria-label="Go to today"
					>
						<IconRestore size={18} stroke={2.5} class="text-rose-600" />
						<p class="font-mono text-sm font-medium tracking-tight text-rose-600">Today</p>
					</button>
				{/if}

				<button
					onclick={goToPrevious}
					class="rounded-full p-2 transition-colors hover:bg-neutral-400/50 dark:hover:bg-neutral-700"
					aria-label="Previous period"
				>
					<IconChevronLeft size={21} stroke={2.5} class="text-neutral-700 dark:text-neutral-300" />
				</button>

				<button
					onclick={goToNext}
					class="rounded-full p-2 transition-colors hover:bg-neutral-400/50 dark:hover:bg-neutral-700"
					aria-label="Next period"
				>
					<IconChevronRight size={21} stroke={2.5} class="text-neutral-700 dark:text-neutral-300" />
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
			<div class="min-w-full flex-shrink-0" style="scroll-snap-align: start;">
				<div class="h-full w-full">
					<!-- Weekday Headers -->
					<div class="grid grid-cols-7 gap-1">
						{#each weekdays as day}
							<div class="py-2 text-center text-[0.85rem] font-medium text-neutral-500 uppercase">
								{day}
							</div>
						{/each}
					</div>

					<!-- Date Grid -->
					<div class="space-y-1">
						{#each period.weeks as week, weekIndex}
							<div class="grid grid-cols-7 gap-1">
								{#each week as date}
									<button onclick={() => selectDate(date)} class={getDateClasses(date)}>
										<div
											class={createClass(
												'absolute inset-0 z-0 h-full w-full rounded-full bg-gradient-to-b from-blue-500/80 to-sky-500/80 transition-opacity',
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
