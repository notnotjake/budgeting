<script lang="ts">
	interface Props {
		amount: number
		frequency: 'day' | 'month'
		frequencyInterval: number
	}

	let { amount, frequency, frequencyInterval }: Props = $props()

	const isYearly = $derived(frequency === 'month' && frequencyInterval === 12)
	const isWeekly = $derived(frequency === 'day' && frequencyInterval === 7)

	const hoverAmount = $derived(
		isYearly ? amount / 12 : isWeekly ? amount * 52 : amount * 12
	)

	const currentLabel = $derived(isYearly ? 'Yearly' : isWeekly ? 'Weekly' : 'Monthly')
	const hoverLabel = $derived(isYearly ? 'Monthly' : 'Yearly')

	const formatCurrency = (value: number) =>
		value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

	const displayAmount = $derived(formatCurrency(amount))
	const displayHoverAmount = $derived(formatCurrency(hoverAmount))
	const widthAmount = $derived(
		displayAmount.length > displayHoverAmount.length ? displayAmount : displayHoverAmount
	)
</script>

<div class="group row-span-2 flex flex-col justify-center text-right">
	<p class="relative h-6 tabular-nums font-medium text-neutral-900 dark:text-white">
		<span class="invisible">${widthAmount}</span>
		<span
			class="absolute inset-0 text-right transition-all duration-300 ease-out group-hover:translate-y-full group-hover:opacity-0 group-hover:blur-[2px]"
		>
			${displayAmount}
		</span>
		<span
			class="absolute inset-0 -translate-y-full text-right opacity-0 blur-[2px] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none"
		>
			${displayHoverAmount}
		</span>
	</p>
	<p class="relative text-xs text-neutral-400">
		<span class="inline-block transition-opacity duration-300 group-hover:opacity-0"
			>{currentLabel}</span
		>
		<span
			class="absolute inset-0 text-right opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>{hoverLabel}</span
		>
	</p>
</div>
