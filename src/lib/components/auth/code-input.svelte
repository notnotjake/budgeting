<script lang="ts">
	import { verifyLoginCode } from '$remotes/auth/authenticate.remote'
	import { createEnhancedForm } from '@opensky/remotes'
	// import { goto } from '$app/navigation'
	// import { resolve } from '$app/paths'
	import { onMount } from 'svelte'

	import { createClass } from '@opensky/style'
	import { delay } from '$utils/timing'
	import { createShake } from '$lib/components/adapt/shake-behavior'
	import { IconCircleCheck } from '@tabler/icons-svelte'

	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui'
	import { Suspense } from '$ui/feedback'

	const verifyLoginCodeForm = createEnhancedForm(verifyLoginCode, {
		delayMs: 150,
		timeoutMs: 5000
	})

	const { translateX, triggerShake } = createShake({
		amplitude: 14,
		shakes: 3,
		duration: 350
	})

	type CellProps = PinInputRootSnippetProps['cells'][0]
	let form = $state<HTMLFormElement>()

	let codeValue = $state('')

	onMount(() => {
		console.log('t')
		codeValue = ''
		verifyLoginCodeForm.reset()
	})

	let resultSuccess = $derived(verifyLoginCodeForm.result && verifyLoginCode?.result?.success)
	let resultError = $derived(verifyLoginCode?.result?.success === false && codeValue === '')
</script>

<form
	{...verifyLoginCode.enhance(async (opts) =>
		verifyLoginCodeForm.enhance(opts, {
			onReturn: async ({ result }) => {
				if (result?.success === true && result?.redirectUrl) {
					console.log('success')
					await delay(2000)
					console.log('redirecting')
				} else {
					codeValue = ''
					triggerShake()
					await delay(1300)
					verifyLoginCodeForm.reset()
				}
			},
			onError: async () => {
				codeValue = ''
				triggerShake()
				await delay(1300)
				verifyLoginCodeForm.reset()
			}
		})
	)}
	bind:this={form}
>
	<input
		{...verifyLoginCode.fields.code.as('text')}
		autocomplete="one-time-code"
		inputmode="numeric"
		maxlength="6"
		value={codeValue}
	/>
</form>

<div class="flex flex-col items-center">
	{#if resultError}
		<p class="py-1 text-[0.9rem] font-[450] text-rose-600">Code invalid, try again</p>
	{:else}
		<p class="pb-1 text-[1.02rem]">Enter Code</p>
	{/if}

	<div style:transform="translateX({$translateX}px)">
		<PinInput.Root
			onComplete={() => form?.requestSubmit()}
			bind:value={codeValue}
			maxlength={6}
			pattern={REGEXP_ONLY_DIGITS}
			class={createClass(
				'group flex w-fit cursor-pointer items-center overflow-hidden rounded-[1.2rem] bg-gray-100 px-3.5 py-0.5 has-[:disabled]:opacity-70',
				'focus-within:outline-2 focus-within:outline-blue-500',
				verifyLoginCodeForm.pending && 'bg-blue-200/30 focus-within:outline-none',
				resultSuccess && 'outline-2 outline-green-500 focus-within:outline-green-500',
				resultError && 'outline-2 outline-rose-500 focus-within:outline-rose-500'
			)}
		>
			{#snippet children({ cells })}
				<!-- Pending State -->
				<div
					class={createClass(
						'absolute inset-0 flex h-full w-full items-center justify-center transition-all delay-100 duration-300',
						verifyLoginCodeForm.pending ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
					)}
				>
					<Suspense.Text class="text-[1.1rem] font-medium">Trying Code...</Suspense.Text>
				</div>
				<!-- Success State -->
				<div
					class={createClass(
						'absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-xl transition-all duration-150',
						resultSuccess
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
			cell.char !== null && 'data-[active]:bg-sky-400/10',
			verifyLoginCodeForm.pending
				? 'scale-110 opacity-0 blur-md'
				: 'scale-100 opacity-100 blur-none'
		)}
	>
		<div class="absolute left-0 top-0 flex h-full w-full items-center justify-center">
			<div
				style:opacity={cell.char === null ? '1.0' : '0.0'}
				style:transform={cell.char === null ? 'translateY(0%)' : 'translateY(150%)'}
				style:scaleY={cell.char === null ? '1.0' : '3.0'}
				class={createClass(
					`h-2 w-2 rounded-full transition-all duration-200`,
					cell.hasFakeCaret
						? 'bg-blue-vibrant-light h-3.5'
						: 'bg-neutral-400 group-hover:bg-neutral-600 group-hover:group-focus-within:bg-neutral-400'
				)}
			></div>
		</div>
		<div
			style:opacity={cell.char !== null ? '1.0' : '0.0'}
			style:transform={cell.char !== null ? 'translateY(0%)' : 'translateY(-50%)'}
			style:filter={cell.char !== null ? 'blur(0px)' : 'blur(5px)'}
			class="text-xl font-medium transition-all duration-300 group-data-[active]/cell:text-blue-500"
		>
			{cell.char}
		</div>
	</PinInput.Cell>
{/snippet}
