<script lang="ts">
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { wipeVertical } from '$ui/transition'
	import { IconChevronLeft, IconArrowRight, IconAlertCircleFilled } from '@tabler/icons-svelte'
	import { Suspense } from '$ui/feedback'
	import PinInput from '$ui/input/pin-code.svelte'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'
	import { onMount } from 'svelte'
	import { z } from 'zod'

	let { data } = $props()

	import { startLogin, verifyLoginCode } from '$lib/remotes/auth.remote'

	const startLoginSchema = z.object({
		identifier: z.string().email(),
		timezone: z.string().optional()
	})

	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	let loginRequestResponse = $derived(startLogin.result)

	type FailStates = 'pending' | 'timeout' | 'error' | 'delayed' | null
	let startLoginState = $state<FailStates>(null)

	let errors = $state(false)
	let anyIssues = $derived(!!startLogin.fields.allIssues())
	let emailIssues = $derived(startLogin.fields.identifier.issues())

	let startButtonAvailable = $derived(
		!startLogin.result &&
			!anyIssues &&
			startLogin.fields.value()?.identifier &&
			startLogin.fields.value()?.identifier.length >= 5
	)

	let doAttentionAnimation = $state(false)
</script>

{#if startLogin.result}
	<div
		transition:fade={{ duration: 150 }}
		class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-neutral-400/10"
	></div>
{/if}

<div class="z-10 flex h-full w-full max-w-[28rem] items-center justify-center px-2">
	<div
		class={createClass(
			'relative flex min-h-40 w-full flex-shrink-0 grow flex-col items-center p-2.5 transition-all duration-200 sm:px-5',
			startLogin.result ? 'rounded-[1.8rem] bg-white pb-10 pt-4' : 'rounded-[1.9rem] bg-none'
		)}
	>
		<div
			class={createClass(
				'h-18 left-0 top-0 z-0 hidden w-full rounded-t-[1.8rem] bg-gradient-to-b from-[#DFF3FF] to-[#E8F9FF]/0 transition-colors duration-200 sm:absolute sm:z-auto sm:block',
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
					{data?.title}
				</h2>
				<p
					class="animate-fade-in-scale text-[1.05rem] font-[430] leading-4 tracking-[-0.015em] text-neutral-500"
				>
					{data?.text}
				</p>
			</div>
		{/if}

		<svelte:boundary>
			<form
				oninput={() => startLogin.validate()}
				{...startLogin.preflight(startLoginSchema).enhance(async ({ data, submit }) => {
					console.log(data)
					try {
						await submit()
					} catch (error) {
						errors = true
						startLoginState = 'error'
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

					{#if localTimezone}
						<input {...startLogin.fields.timezone.as('hidden', localTimezone)} aria-hidden />
					{/if}

					<input
						{...startLogin.fields.identifier.as('email')}
						autocomplete="username webauthn"
						placeholder="Continue with email"
						aria-label="Enter your email"
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
					<div
						class={createClass(
							'pointer-events-none absolute right-0 top-0 z-0 h-full w-10 bg-gradient-to-l from-[#4496FF] to-[rgba(45,169,255,0.00)] transition-all duration-300',
							startButtonAvailable ? 'w-15 opacity-20' : 'w-0 opacity-0'
						)}
					></div>
					<!-- {#each startLogin.fields.identifier.issues() as issue} -->
					<!-- {/each} -->

					<button
						type="submit"
						disabled={anyIssues}
						class={createClass(
							'group z-10 flex h-full shrink-0 flex-nowrap items-center justify-end transition-all duration-200',
							startLogin.result ? 'opacity-0' : 'opacity-100',
							emailIssues ? 'cursor-[w-resize]' : 'cursor-pointer'
						)}
					>
						{#if !anyIssues}
							<IconArrowRight
								stroke={3}
								size={26}
								class={createClass(
									'animate-fade-in-scale-right mr-1 transition-colors duration-300 ease-in-out group-disabled:text-neutral-500/80',
									startButtonAvailable ? 'text-blue-vibrant' : 'text-neutral-400'
								)}
							/>
						{:else}
							<IconAlertCircleFilled
								stroke={3}
								size={26}
								class={createClass('mr-1 text-rose-500')}
							/>
						{/if}
					</button>
				</div>
				<div class="mt-2 flex h-8 items-start justify-end">
					{#if errors}
						<p class="rounded-full px-3 py-0.5 text-[0.9rem] font-[450] text-rose-500">
							An error occured, try again
						</p>
					{:else if anyIssues}
						{#each startLogin.fields.allIssues() as issue}
							<p
								class="rounded-full bg-rose-100 px-3 py-0.5 text-[0.9rem] font-[450] text-rose-500"
							>
								{issue.message}
							</p>
						{/each}
					{/if}
				</div>
			</form>
		</svelte:boundary>

		{#if startLogin.result}
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
		{/if}

		{#if startLogin.result}
			<PinInput />
			<button
				class="mt-2 rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 text-neutral-700 hover:bg-neutral-100 hover:text-black"
			>
				Resend
			</button>
		{/if}

		{#if loginRequestResponse}
			<button
				class="rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 hover:bg-neutral-100"
			>
				or <span class="text-neutral-700 hover:text-black">login with email</span>
			</button>
		{/if}
	</div>
</div>
