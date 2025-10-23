<script lang="ts">
	import { startLogin, verifyLoginCode } from '$lib/remotes/auth.remote'
	import { createValidation, createEnhancedForm } from '@opensky/remotes'
	import { z } from 'zod'

	import { createClass } from '@opensky/style'
	import { wipeVertical, wipeHorizontal } from '$ui/transition'
	import { fade } from 'svelte/transition'
	import { createShake } from '$ui/adapt/shake-behavior'
	import { IconChevronLeft, IconArrowRight } from '@tabler/icons-svelte'

	import { Suspense } from '$ui/feedback'
	import PinInput from '$ui/input/pin-code.svelte'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'

	// import { createValidation } from '$lib/utils/validation.svelte'

	let { data } = $props()

	const startLoginSchema = z.object({
		identifier: z.string().email(),
		timezone: z.string().optional()
	})
	const startLoginValid = createValidation(startLogin)
	const startLoginForm = createEnhancedForm(startLogin, {
		validation: startLoginValid,
		delayMs: 500,
		timeoutMs: 9000
	})

	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	let identifierInput = $state<HTMLInputElement>()

	let loginRequestResponse = $derived(startLogin.result)

	let startButtonAvailable = $derived(
		!startLoginForm.result &&
			!startLoginValid.issues('identifier') &&
			startLogin.fields.value()?.identifier &&
			startLogin.fields.value()?.identifier.length >= 5
	)

	let doAttentionAnimation = $state(false)

	const { translateX, triggerShake: incorrectShake } = createShake({
		amplitude: 7,
		shakes: 2,
		duration: 325
	})

	function focusInput() {
		identifierInput?.focus()
	}

	let loggingInFor = $state('')
	$effect(() => {
		if (startLoginForm.state !== 'result') {
			loggingInFor = ''
		}
	})

	function resetForm() {
		const current = loggingInFor
		startLoginForm.reset()
		startLogin.fields.identifier.set(current)
	}
</script>

<!-- Apply gray background on second step -->
{#if startLoginForm.result}
	<div
		transition:fade={{ duration: 200 }}
		class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-neutral-400/10"
	></div>
{/if}

<!-- Container inside the layout -->
<div class="z-10 flex h-full w-full max-w-[30rem] items-center justify-center px-2">
	<!-- Login card container -->
	<div
		class={createClass(
			'relative flex min-h-40 w-full flex-shrink-0 grow flex-col items-center p-2.5 transition-all duration-200 sm:px-5',
			startLoginForm.result ? 'rounded-[1.8rem] bg-white pt-4' : 'rounded-[1.9rem] bg-none'
		)}
	>
		<!-- Color gradient on first step -->
		<div
			class={createClass(
				'h-18 left-0 top-0 z-0 hidden w-full rounded-t-[1.8rem] bg-gradient-to-b from-[#E3F4FF] to-[#E8F9FF]/0 transition-colors duration-200 sm:absolute sm:z-auto sm:block',
				startLoginForm.result ? 'opacity-0' : 'opacity-100'
			)}
		></div>

		<!-- Message shown on first step -->
		{#if !startLoginForm.result}
			<div
				transition:wipeVertical={{ duration: 400 }}
				class="z-10 w-full flex-col items-center justify-center px-7 pb-6 pt-2 text-center"
			>
				<h2
					class="tracking-tight-md animate-fade-in-scale text-[1.33rem] font-[550] leading-loose text-black"
				>
					{data?.title}
				</h2>
				<p
					class="animate-fade-in-scale text-[1.05rem] font-[430] leading-4 tracking-[-0.015em] text-neutral-500"
				>
					{data?.text}
				</p>
			</div>
		{/if}

		<!-- Email/Phone input field -->
		<div
			style:transform="translateX({$translateX}px)"
			class={createClass(
				'group relative z-10 flex h-12 w-full items-center overflow-hidden rounded-[1rem] focus-within:outline-2 focus-within:outline-blue-500',
				startLoginForm.result ? 'bg-neutral-50' : 'bg-neutral-100',
				!startLoginForm.result &&
					(startLoginForm.error || startLoginValid.issues('identifier')) &&
					'outline-[0.12rem] outline-rose-400'
			)}
		>
			{#if !startLoginForm.result}
				<form
					class="flex h-full w-full items-center"
					{...startLogin.preflight(startLoginSchema).enhance(async (opts) =>
						startLoginForm.enhance(opts, {
							onReturn: ({ data }) => {
								loggingInFor = data.identifier
							},
							onIssues: () => {
								incorrectShake()
							},
							onError: () => {
								incorrectShake()
							}
						})
					)}
				>
					<!-- Local timezone hidden input -->
					{#if localTimezone}
						<input {...startLogin.fields.timezone.as('hidden', localTimezone)} aria-hidden="true" />
					{/if}

					<!-- Identifier input -->
					<input
						{...startLogin.fields.identifier.as('email')}
						{...startLoginValid.fields('identifier')}
						bind:this={identifierInput}
						autocomplete="username webauthn"
						placeholder="Continue with email"
						aria-label="Enter your email"
						class="flex-grow-1 h-full w-full pl-4 font-[450] text-zinc-900 outline-none transition-all selection:bg-sky-200 selection:text-blue-600 placeholder:font-[450] placeholder:text-neutral-400"
					/>

					<!-- Gradient State Indicator -->
					<div class="w-18 h-full">
						<!-- Button Available -->
						<div
							class={createClass(
								'w-18 pointer-events-none absolute right-0 top-0 z-0 h-full bg-gradient-to-l from-[#4496FF] to-[rgba(45,169,255,0.00)]',
								startButtonAvailable ? 'w-18 opacity-20' : 'w-0 opacity-0'
							)}
						></div>
						<!-- Errors/Issues Present -->
						<div
							class={createClass(
								'w-18 pointer-events-none absolute right-0 top-0 z-0 h-full bg-gradient-to-l from-rose-400/60 to-rose-300/0',
								startLoginForm.error || startLoginValid.issues('identifier')
									? 'w-18 opacity-25'
									: 'w-0 opacity-0'
							)}
						></div>
					</div>

					<!-- Button: either continue or error alert -->
					<div class="flex h-full shrink-0 items-center justify-end pr-2">
						{#if startLoginForm.delayed}
							<Suspense.Spinner />
						{:else}
							<button type="submit" class="group" disabled={!startButtonAvailable}>
								<IconArrowRight
									stroke={3}
									size={26}
									class={createClass(
										'pointer-events-none transition-colors duration-300 group-disabled:text-neutral-500/80',
										startButtonAvailable ? 'text-blue-vibrant' : 'text-neutral-400',
										startLoginValid.issues('identifier') && 'text-neutral-400'
									)}
								/>
							</button>
						{/if}
					</div>
				</form>
			{:else}
				<!-- Second step shows back button -->
				<button onclick={resetForm} class="flex h-full w-full items-center justify-center">
					<IconChevronLeft
						class="absolute inset-0 h-full text-neutral-400 group-hover:text-neutral-700"
					/>
					<p
						class="flex h-full w-full items-center justify-center font-[450] text-neutral-500 group-hover:text-neutral-700"
						class:attention-animation={doAttentionAnimation}
					>
						{loggingInFor || 'test@example.com'}
					</p>
				</button>
			{/if}
		</div>

		<!-- Errors & Issues -->
		{#if startLoginForm.error}
			<div transition:wipeVertical={{ delay: 300 }} class="flex w-full justify-center py-2.5">
				<button class="cursor-pointer font-[450] text-rose-500" onclick={focusInput}>
					An error occured, try again
				</button>
			</div>
		{:else if startLoginValid.issues('identifier')}
			<div transition:wipeVertical={{ delay: 300 }} class="flex w-full justify-center py-2.5">
				{#each startLoginValid.issues('identifier') ?? [] as issue (issue)}
					<button class="cursor-pointer font-[450] text-rose-500" onclick={focusInput}>
						{issue}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Second step ui -->
		{#if startLoginForm.result && startLogin.result}
			<div class="flex w-full flex-col items-center pb-3 pt-8">
				{#if startLogin.result.codeSent}
					<form {...verifyLoginCode}>
						<input
							{...verifyLoginCode.fields.code.as('text')}
							autocomplete="one-time-code"
							inputmode="numeric"
							maxlength="6"
						/>

						<button>Submit</button>
					</form>
				{/if}
				{#if startLogin.result.passkeyAvailable}
					<PasskeyButton />
				{/if}

				<PinInput />

				<button
					class="mt-2 rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 text-neutral-700 hover:bg-neutral-100 hover:text-black"
				>
					Resend
				</button>

				<button
					class="rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 hover:bg-neutral-100"
				>
					or <span class="text-neutral-700 hover:text-black">login with email</span>
				</button>
			</div>
		{/if}
	</div>
</div>
