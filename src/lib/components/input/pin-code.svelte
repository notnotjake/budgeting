<script lang="ts">
	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { delay } from '$utils/timing'
	import { Suspense } from '$ui/feedback'
	import { IconCircleCheck } from '@tabler/icons-svelte'
	import { createShake } from '$lib/components/adapt/shake-behavior'

	import { verifyLoginCode } from '$lib/remotes/auth.remote'

	let value = $state('')
	let pending = $state(false)
	let success = $state(false)
	let error = $state(false)
	let stickyError = $state(false)
	$effect(() => {
		if (error) {
			stickyError = true
		}
	})
	$effect(() => {
		if (value !== '') {
			stickyError = false
		}
	})

	let completed = $derived.by(() => {
		return value.length === 6
	})
	$effect(async () => {
		if (success) {
			await delay(2000)
			value = ''
			success = false
		}
	})
	$effect(async () => {
		if (error) {
			value = ''
			incorrectShake()
			await delay(1100)
			error = false
		}
	})

	const pinState = {
		idle: 'idle',
		pending: 'pending',
		success: 'success',
		error: 'error'
	}

	type CellProps = PinInputRootSnippetProps['cells'][0]

	// Create shake behavior
	const {
		translateX,
		triggerShake: incorrectShake,
		reset
	} = createShake({
		amplitude: 14,
		shakes: 3,
		duration: 350
	})

	let form = $state<HTMLFormElement>()

	async function onComplete() {
		pending = true

		verifyLoginCode.fields.code.set(value)

		form?.requestSubmit()

		// await delay(2000)
		// pending = false

		// Simulate incorrect code - trigger shake
		// if (value.includes('8')) {
		// 	error = true
		// } else {
		// 	success = true
		// }
	}

	$inspect(verifyLoginCode.result)
</script>

<form {...verifyLoginCode} bind:this={form}>
	<input
		{...verifyLoginCode.fields.code.as('text')}
		autocomplete="one-time-code"
		inputmode="numeric"
		maxlength="6"
		{value}
	/>
</form>

<div class="flex flex-col items-center">
	{#if stickyError}
		<p class="py-1 text-[0.9rem] font-[450] text-rose-600">Code invalid, try again</p>
	{:else}
		<p class="pb-1 text-[1.02rem]">Enter Code</p>
	{/if}

	<div style:transform="translateX({$translateX}px)">
		<PinInput.Root
			bind:value
			class={createClass(
				'group flex w-fit cursor-pointer items-center overflow-hidden rounded-[1.2rem] border-2 border-gray-100 bg-gray-100 px-3.5 py-0.5 focus-within:border-blue-500 has-disabled:opacity-70',
				completed && 'border-blue-200/20 bg-blue-200/20 focus-within:border-blue-200/20',
				success && 'border-green-500 focus-within:border-green-500',
				error && 'border-rose-500 focus-within:border-rose-500'
			)}
			maxlength={6}
			{onComplete}
			pattern={REGEXP_ONLY_DIGITS}
		>
			{#snippet children({ cells })}
				<!-- Pending -->
				<div
					class={createClass(
						'absolute inset-0 flex h-full w-full items-center justify-center transition-all delay-100 duration-300',
						pending ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
					)}
				>
					<Suspense.Text class="text-[1.1rem] font-medium">Trying Code...</Suspense.Text>
				</div>
				<!-- Success -->
				<div
					class={createClass(
						'absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-xl transition-all duration-150',
						success
							? 'translate-y-0 bg-green-200/20 opacity-100 backdrop-blur'
							: 'tbackdrop-blur-none translate-y-full bg-transparent opacity-0'
					)}
				>
					<div class={createClass('flex h-full w-full items-center justify-center')}>
						<IconCircleCheck class="text-green-600" />
					</div>
				</div>
				<!-- Pin Input -->
				<div class="flex gap-1">
					{#each cells.slice(0, 3) as cell}
						{@render Cell(cell)}
					{/each}
				</div>

				<div class="flex w-5 items-center justify-center"></div>

				<div class="flex gap-[0.1rem]">
					{#each cells.slice(3, 6) as cell}
						{@render Cell(cell)}
					{/each}
				</div>
			{/snippet}
		</PinInput.Root>
	</div>
</div>

{#snippet Cell(cell: CellProps)}
	<PinInput.Cell
		{cell}
		class={createClass(
			'group/cell relative flex h-10 w-5 cursor-pointer items-center justify-center rounded-xl transition-all duration-500',
			cell.char !== null && 'data-active:bg-sky-400/10',
			pending ? 'scale-110 opacity-0 blur-md' : 'scale-100 opacity-100 blur-none'
		)}
	>
		<div class="absolute top-0 left-0 flex h-full w-full items-center justify-center">
			<div
				style:opacity={cell.char === null ? '1.0' : '0.0'}
				style:transform={cell.char === null ? 'translateY(0%)' : 'translateY(150%)'}
				style:scaleY={cell.char === null ? '1.0' : '3.0'}
				class={createClass(
					`h-2 w-2 rounded-full transition-all duration-200`,
					cell.hasFakeCaret
						? 'h-3.5 bg-blue-vibrant-light'
						: 'bg-neutral-400 group-hover:bg-neutral-600 group-hover:group-focus-within:bg-neutral-400'
				)}
			></div>
		</div>
		<div
			style:opacity={cell.char !== null ? '1.0' : '0.0'}
			style:transform={cell.char !== null ? 'translateY(0%)' : 'translateY(-50%)'}
			style:filter={cell.char !== null ? 'blur(0px)' : 'blur(5px)'}
			class="text-xl font-medium transition-all duration-300 group-data-active/cell:text-blue-500"
		>
			{cell.char}
		</div>
	</PinInput.Cell>
{/snippet}
