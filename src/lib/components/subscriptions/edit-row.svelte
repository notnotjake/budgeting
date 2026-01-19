<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconCheck, IconArrowBackUp } from '@tabler/icons-svelte'
	import { today, getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date'
	import NameInput from './inputs/name-input.svelte'
	import AmountInput from './inputs/amount-input.svelte'
	import FrequencyPicker from './inputs/frequency-picker.svelte'
	import DatePickerButton from './inputs/date-picker-button.svelte'
	import InfoInputs from './inputs/info-inputs.svelte'
	import StatusControl from './inputs/status-control.svelte'

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
		accounts?: string[]
		tags?: string[]
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
		onCancel: () => void
	}

	let { subscription, accounts = [], tags = [], onSave, onCancel }: Props = $props()

	// Convert frequency to simple option
	function getFrequencyOption(
		freq: 'day' | 'month',
		interval: number
	): 'weekly' | 'monthly' | 'yearly' {
		if (freq === 'day' && interval === 7) return 'weekly'
		if (freq === 'month' && interval === 12) return 'yearly'
		return 'monthly'
	}

	// Convert simple option back to frequency
	const frequencyMap = {
		weekly: { frequency: 'day' as const, frequencyInterval: 7 },
		monthly: { frequency: 'month' as const, frequencyInterval: 1 },
		yearly: { frequency: 'month' as const, frequencyInterval: 12 }
	}

	// Derive status from subscription
	function getStatus(sub: Subscription): 'active' | 'paused' | 'cancelled' {
		if (sub.pauseDate) return 'paused'
		if (sub.endDate) return 'cancelled'
		return 'active'
	}

	// Parse date to DateValue
	function parseDateValue(date: Date): DateValue {
		const d = new Date(date)
		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return parseDate(`${year}-${month}-${day}`)
	}

	// Form state
	let name = $state(subscription.name)
	let company = $state(subscription.company ?? '')
	let account = $state(subscription.account ?? '')
	let tag = $state(subscription.tag ?? '')
	let amount = $state(subscription.amount)
	let frequencyOption = $state<'weekly' | 'monthly' | 'yearly'>(
		getFrequencyOption(subscription.frequency, subscription.frequencyInterval)
	)
	let date = $state<DateValue>(parseDateValue(subscription.dueDate))
	let status = $state<'active' | 'paused' | 'cancelled'>(getStatus(subscription))

	// Original values for change detection
	const originalName = subscription.name
	const originalCompany = subscription.company ?? ''
	const originalAccount = subscription.account ?? ''
	const originalTag = subscription.tag ?? ''
	const originalAmount = subscription.amount
	const originalFrequencyOption = getFrequencyOption(
		subscription.frequency,
		subscription.frequencyInterval
	)
	const originalDate = parseDateValue(subscription.dueDate).toString()
	const originalStatus = getStatus(subscription)

	let isValid = $derived(name.trim() !== '' && amount.trim() !== '' && parseFloat(amount) > 0)

	let hasChanges = $derived(
		name !== originalName ||
			company !== originalCompany ||
			account !== originalAccount ||
			tag !== originalTag ||
			amount !== originalAmount ||
			frequencyOption !== originalFrequencyOption ||
			date.toString() !== originalDate ||
			status !== originalStatus
	)

	function handleSave() {
		if (!isValid) return

		const { frequency, frequencyInterval } = frequencyMap[frequencyOption]

		onSave({
			id: subscription.id,
			name: name.trim(),
			company: company.trim() || undefined,
			account: account.trim() || undefined,
			tag: tag.trim() || undefined,
			amount: parseFloat(amount),
			dueDate: date.toString(),
			frequency,
			frequencyInterval,
			status
		})
	}
</script>

<div
	class={createClass(
		'col-span-4 flex flex-col gap-2 rounded-4xl px-3 pt-4 pb-2',
		'bg-[#FAF8FB] shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_1px_1.5px_0px_rgba(0,0,0,0.08),0_2px_30px_11px_rgba(0,0,0,0.04)]',
		'dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]'
	)}
>
	<!-- Row 1: Title, spacer, status, price -->
	<div class="flex items-center gap-2">
		<NameInput bind:value={name} />

		<div class="flex-1"></div>

		<StatusControl bind:value={status} />

		<div class="h-full min-h-8 w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

		<AmountInput bind:value={amount} />
	</div>

	<!-- Row 2: Company, tags, account, spacer, date, period -->
	<div class="flex items-center gap-2">
		<InfoInputs bind:company bind:tag bind:account {accounts} {tags} />

		<div class="flex-1"></div>

		<FrequencyPicker bind:value={frequencyOption} />

		<DatePickerButton bind:value={date} />
	</div>

	<!-- Row 3: Actions -->
	<div class="flex items-center justify-between pt-2">
		<button
			type="button"
			onclick={onCancel}
			class={createClass(
				'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 transition-all',
				'active:scale-95',
				'bg-neutral-300/70 text-neutral-600 shadow-none dark:bg-neutral-700 dark:text-neutral-300'
			)}
		>
			<IconArrowBackUp size={22} />
		</button>
		<button
			type="button"
			disabled={!isValid}
			onclick={handleSave}
			class={createClass(
				'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 transition-all',
				'active:scale-95 disabled:cursor-not-allowed',
				'bg-blue-vibrant-light text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.3),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.15)]'
			)}
		>
			<IconCheck size={22} />
		</button>
	</div>
</div>
