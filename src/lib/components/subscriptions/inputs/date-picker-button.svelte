<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconCalendarWeekFilled } from '@tabler/icons-svelte'
	import { Popover } from 'bits-ui'
	import DatePicker from '$lib/components/date-picker.svelte'
	import { today, getLocalTimeZone, isSameDay, type DateValue } from '@internationalized/date'
	import { wipeHorizontal } from '$ui/transition'

	interface Props {
		value: DateValue
	}

	let { value = $bindable() }: Props = $props()

	let datePickerOpen = $state(false)

	let isToday = $derived(isSameDay(value, today(getLocalTimeZone())))
	let dateString = $derived(
		value
			.toDate(getLocalTimeZone())
			.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
	)
</script>

<Popover.Root bind:open={datePickerOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				type="button"
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
	<Popover.Portal>
		<Popover.Content side="top" sideOffset={4} align="start" class="z-100 w-96" trapFocus={false}>
			<DatePicker bind:selectedDate={value} bind:expanded={datePickerOpen} />
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
