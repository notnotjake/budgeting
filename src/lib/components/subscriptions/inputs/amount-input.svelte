<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconReceiptDollarFilled } from '@tabler/icons-svelte'
	import InputAdapting from '$ui/input/input-adapting.svelte'
	import { tick } from 'svelte'
	import { z } from 'zod'

	// Currency validation: allows numbers with optional commas and up to 2 decimal places
	const currencySchema = z
		.string()
		.regex(/^-?\d{1,3}(,\d{3})*(\.\d{0,2})?$|^-?\d+(\.\d{0,2})?$/, 'Invalid currency format')

	interface Props {
		value: string
	}

	let { value = $bindable() }: Props = $props()

	let isValid = $derived(value.trim() === '' || currencySchema.safeParse(value).success)

	function formatCurrency(val: string): string {
		const num = parseFloat(val.replace(/,/g, ''))
		if (isNaN(num)) return val
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	}

	async function handleFocus(e: FocusEvent): Promise<void> {
		const input = e.currentTarget as HTMLInputElement
		await tick()
		input.select()
	}

	function handleBlur(): void {
		if (value.trim() && isValid) {
			value = formatCurrency(value)
		}
	}
</script>

<label
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
			'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400',
			!isValid && 'text-rose-500'
		)}
		type="text"
		placeholderIsMinWidth={true}
		maxWidth="var(--container-4xs)"
		bind:value
		placeholder="0.00"
		onfocus={handleFocus}
		onblur={handleBlur}
	/>
</label>
