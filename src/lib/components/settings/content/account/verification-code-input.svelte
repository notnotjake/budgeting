<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { verifyEmailChange } from '$remotes/auth/user.remote'
	import { createEnhancedForm } from '@opensky/remotes'

	import { delay } from '$utils/timing'
	import { createClass } from '@opensky/style'
	import { createShake } from '$lib/components/adapt/shake-behavior'
	import { scale } from 'svelte/transition'
	import { IconCircleCheck } from '@tabler/icons-svelte'
	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui'
	import { AdaptReveal } from '$ui/adapt'

	import { Suspense } from '$ui/feedback'

	type Props = {
		newEmail: string
		onSuccess?: () => void
	}
	let { newEmail, onSuccess }: Props = $props()

	// Verify Email Change Form
	const verifyEmailChangeForm = createEnhancedForm(verifyEmailChange, {
		delayMs: 150,
		timeoutMs: 9000
	})
	let verifyEmailChangeFormElement = $state<HTMLFormElement>()
	let codeValue = $state('')

	type CellProps = PinInputRootSnippetProps['cells'][0]

	const { translateX, triggerShake } = createShake({
		amplitude: 14,
		shakes: 3,
		duration: 350
	})

	let resultSuccess = $derived(verifyEmailChangeForm.result && verifyEmailChange?.result?.success)
	let resultError = $derived(verifyEmailChange?.result?.error && codeValue === '')

	let triggerErrorToast = $state<(() => void) | null>(null)
	let triggerSentToast = $state<(() => void) | null>(null)

	onMount(async () => {
		await tick()
		codeValue = ''
		verifyEmailChangeForm.reset()
	})
</script>

<div class="flex gap-2">
	<p class="shrink-0 text-[1.05rem] font-medium">Verify Email</p>
	<AdaptReveal bind:trigger={triggerErrorToast}>
		<p transition:scale class="text-rose-600">Code invalid</p>
	</AdaptReveal>
	<AdaptReveal bind:trigger={triggerSentToast}>
		<p transition:scale class="font-medium text-green-600">Code Sent</p>
	</AdaptReveal>
</div>

<!-- Hidden form element for the code input validation -->
<form
	bind:this={verifyEmailChangeFormElement}
	class="hidden"
	aria-hidden="true"
	{...verifyEmailChange.enhance(async (opts) =>
		verifyEmailChangeForm.enhance(opts, {
			onReturn: async ({ result }) => {
				if (result.success === false || result.error) {
					codeValue = ''
					triggerShake()
					await delay(1300)
					verifyEmailChangeForm.reset()
				} else if (result.success === true) {
					onSuccess?.()
				}
			},
			onError: async () => {
				codeValue = ''
				triggerShake()
				await delay(1300)
				verifyEmailChangeForm.reset()
			}
		})
	)}
>
	<input
		{...verifyEmailChange.fields.code.as('text')}
		autocomplete="one-time-code"
		inputmode="numeric"
		maxlength="6"
		value={codeValue}
	/>
</form>

<div class="flex flex-col items-center" in:scale={{ start: 0.7 }}>
	<div style:transform="translateX({$translateX}px)">
		<PinInput.Root
			onComplete={() => verifyEmailChangeFormElement?.requestSubmit()}
			bind:value={codeValue}
			maxlength={6}
			pattern={REGEXP_ONLY_DIGITS}
			class={createClass(
				'group flex w-fit cursor-pointer items-center justify-start overflow-hidden py-1 pr-2 has-disabled:opacity-70',
				verifyEmailChangeForm.pending && 'bg-blue-900/30 focus-within:outline-none',
				resultSuccess && 'outline-2 outline-green-500 focus-within:outline-green-500'
			)}
		>
			{#snippet children({ cells })}
				<!-- Pending State -->
				<div
					class={createClass(
						'absolute inset-0 flex h-full w-full items-center justify-center transition-all delay-100 duration-300',
						verifyEmailChangeForm.pending ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
					)}
				>
					<Suspense.Text
						class="text-[1.1rem] font-medium"
						backgroundColor="var(--color-neutral-600)"
						primaryColor="var(--color-neutral-200)"
					>
						Verifying...
					</Suspense.Text>
				</div>
				<!-- Success State -->
				<div
					class={createClass(
						'absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-xl transition-all duration-150',
						resultSuccess
							? 'translate-y-0 bg-green-900/30 opacity-100 backdrop-blur'
							: 'translate-y-full bg-transparent opacity-0 backdrop-blur-none'
					)}
				>
					<div class={createClass('flex h-full w-full items-center justify-center')}>
						<IconCircleCheck class="text-green-500" />
					</div>
				</div>
				<!-- Pin Input -->
				<div class="flex">
					{#each cells.slice(0, 3) as cell}
						{@render Cell(cell)}
					{/each}
				</div>

				<div class="flex w-4 items-center justify-center"></div>

				<div class="flex">
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
			verifyEmailChangeForm.pending
				? 'scale-110 opacity-0 blur-md'
				: 'scale-100 opacity-100 blur-none'
		)}
	>
		<div class="absolute top-0 left-0 flex h-full w-full items-center justify-center">
			<div
				style:opacity={cell.char === null ? '1.0' : '0.0'}
				style:transform={cell.char === null ? 'translateY(0%)' : 'translateY(150%)'}
				style:scaleY={cell.char === null ? '1.0' : '3.0'}
				class={createClass(
					'text-xl font-semibold transition-all duration-200',
					cell.hasFakeCaret && 'text-shadow-blue-vibrant-light',
					!cell.hasFakeCaret &&
						!resultError &&
						'text-neutral-600 group-hover:text-neutral-500 group-hover:group-focus-within:text-neutral-600',
					!cell.hasFakeCaret &&
						resultError &&
						'text-rose-600 group-focus-within:text-neutral-600 group-hover:text-rose-600 group-hover:group-focus-within:text-neutral-600'
				)}
			>
				0
			</div>
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
