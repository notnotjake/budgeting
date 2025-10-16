<script lang="ts">
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { wipeVertical } from '$ui/transition'
	import { IconChevronLeft, IconArrowRight } from '@tabler/icons-svelte'
	import { Suspense } from '$ui/feedback'
	import PinInput from '$ui/input/pin-code.svelte'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'

	import { startLogin } from '$lib/remotes/auth.remote'

	// Set the timezone for the startLogin form
	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	startLogin.fields.timezone.set(localTimezone)

	let loginRequestResponse = $state(false)

	let loginMethodsAvailable = $state({
		code: null,
		password: null,
		passkey: null
	})

	let title = $state('Welcome to Spring')

	let loginHadExpired = $state(false)

	let emailValue = $state('')

	let errors = $state(false)

	let doAttentionAnimation = $state(false)
</script>

{#if loginRequestResponse}
	<div
		transition:fade={{ duration: 150 }}
		class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-neutral-400/10"
	></div>
{/if}

<div class="z-10 flex h-full w-full max-w-[28rem] items-center justify-center px-2">
	<div
		class={createClass(
			'relative flex min-h-40 w-full flex-shrink-0 grow flex-col items-center p-2.5 transition-all duration-200 sm:px-5',
			loginRequestResponse ? 'rounded-[1.8rem] bg-white pb-10 pt-4' : 'rounded-[1.9rem] bg-none'
		)}
	>
		<div
			class={createClass(
				'h-18 left-0 top-0 z-0 hidden w-full rounded-t-[1.7rem] bg-gradient-to-b from-[#DFF3FF] to-[#E8F9FF]/0 transition-colors duration-200 sm:absolute sm:z-auto sm:block',
				loginRequestResponse ? 'opacity-0' : 'opacity-100'
			)}
		></div>

		{#if !loginRequestResponse}
			<div
				transition:wipeVertical={{ duration: 400 }}
				class="z-10 w-full flex-col items-center justify-center px-7 pb-6 pt-2 text-center"
			>
				<h2
					class="tracking-tight-md animate-fade-in-scale text-[1.33rem] font-[550] leading-loose text-black"
				>
					{title}
				</h2>
				<p
					class="animate-fade-in-scale text-[1.05rem] font-[430] leading-5 tracking-[-0.015em] text-neutral-500"
				>
					Log in or sign up to get started
				</p>
			</div>
		{/if}

		<form
			{...startLogin.enhance(async ({ form, data, submit }) => {
				console.log('Client: Form is submitting')
				console.log(data)
				try {
					await submit()
					console.log('Client: Submit completed')
				} catch (error) {
					console.error('Client: Submit failed:', error)
				}
			})}
			class="z-10 w-full"
		>
			<div
				class={createClass(
					'group relative flex h-12 w-full items-center overflow-hidden rounded-[1rem] border-2 border-red-500/0 focus-within:border-2 focus-within:border-blue-500',
					loginRequestResponse ? 'bg-neutral-50' : 'bg-neutral-100'
				)}
			>
				{#if loginRequestResponse}
					<button
						onclick={() => {
							loginRequestResponse = false
						}}
						class="absolute inset-0 z-10 flex h-full w-full items-center justify-start"
					>
						<IconChevronLeft class="text-neutral-400 group-hover:text-neutral-700" />
					</button>
				{/if}

				<input {...startLogin.fields.timezone.as('hidden')} aria-hidden value={localTimezone} />

				<input
					{...startLogin.fields.identifier.as('email')}
					autocomplete="username webauthn"
					id="email"
					placeholder="Continue with email"
					aria-label="Enter your email"
					bind:value={emailValue}
					tabindex={loginRequestResponse ? '-1' : '1'}
					onclick={() => {
						if (loginRequestResponse) {
							resetForm()
						}
					}}
					onchange={() => {
						if (loginRequestResponse) {
							resetForm()
						}
					}}
					onfocus={() => {
						if (loginRequestResponse) {
							identifierInput.blur()
						}
					}}
					class:attention-animation={doAttentionAnimation}
					class={createClass(
						'flex-grow-1 h-full w-full translate-y-0 pl-4 font-[450] text-zinc-900 outline-none transition-all selection:bg-sky-200 selection:text-blue-600 placeholder:font-[450] placeholder:text-neutral-400',
						loginRequestResponse
							? 'cursor-pointer bg-none pr-4 text-center text-neutral-500'
							: 'pr-1'
					)}
				/>

				<!-- Hint -->
				<!-- <div
					class={createClass(
						'pointer-events-none absolute right-0 top-0 z-0 h-full w-10 bg-gradient-to-l from-[#4496FF] to-[rgba(45,169,255,0.00)] transition-all duration-300',
						errors.length > 0 || $emailForm.email.length < 5 ? 'w-0 opacity-0' : 'w-15 opacity-20',
						$emailMessage && 'w-full opacity-10'
					)}
				></div> -->

				<button
					type="submit"
					class={createClass(
						'group z-10 flex h-full shrink-0 flex-nowrap items-center justify-end transition-all duration-200',
						loginRequestResponse ? 'opacity-0' : 'opacity-100'
					)}
				>
					<IconArrowRight
						stroke={3}
						size={26}
						class={createClass(
							'animate-fade-in-scale-right mr-1 cursor-pointer transition-colors duration-300 ease-in-out group-disabled:text-neutral-500/80',
							emailValue.length > 5 ? 'text-blue-vibrant' : 'text-neutral-400'
						)}
					/>
				</button>
			</div>
		</form>

		{#if startLogin.result}
			{#if startLogin.result.codeSent}
				<p>Code sent to your email!</p>
			{/if}
			{#if startLogin.result.passkeyAvailable}
				<p>Passkey available</p>
			{/if}
		{/if}

		{#if loginRequestResponse}
			<PasskeyButton />
		{/if}

		<!-- {#if loginRequestResponse}
			<PinInput />
		{/if} -->

		{#if loginRequestResponse}
			<button
				class="rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 hover:bg-neutral-100"
			>
				or <span class="text-neutral-700 hover:text-black">login with email</span>
			</button>
		{/if}
	</div>
</div>
