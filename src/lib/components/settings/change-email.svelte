<script lang="ts">
	import {
		IconUserCircle,
		IconArrowLeft,
		IconMail,
		IconDeviceMobile,
		IconArrowBackUp,
		IconChevronRight
	} from '@tabler/icons-svelte'
	import { onMount } from 'svelte'
	import { scale, fade } from 'svelte/transition'
	import { wipeVertical } from '$ui/transition'
	import { AdaptSwap, AdaptFit } from '$ui/adapt'
	import { SuspenseText } from '$ui/feedback'
	import { createClass } from '@opensky/style'
	import VerificationCodeInput from './verification-code-input.svelte'

	let { open = $bindable() } = $props()

	const handleCancel = () => {
		open = false
	}

	const revert = () => {
		emailValue = currentEmail
	}

	const currentEmail = 'jake@notnotjake.com'
	let emailValue = $state('jake@notnotjake.com')
	let emailInput = $state<HTMLFormElement>()

	let emailDiff = $derived(emailValue !== currentEmail)

	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	let verificationStep = $state(false)

	onMount(() => {
		emailInput?.focus()
	})
</script>

<div class="flex w-full flex-col justify-center p-3 text-neutral-200">
	<div class="flex w-full flex-col px-5 pt-7 pb-12">
		<!-- Heading -->
		<div class="mb-8 flex flex-col">
			<IconUserCircle size={35} class="mb-2 text-sky-500" />
			<h2 class="text-[1.2rem] font-semibold">Login Method</h2>
			<p class="text-[1.05rem] text-neutral-300">Change how you login to your account</p>
		</div>

		<div class="flex w-full flex-col gap-5 py-1">
			<div>
				<div class="flex w-full items-baseline gap-2 px-5">
					<p class="pb-1 text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">Email</p>
				</div>

				<div
					class="group flex w-full flex-col items-center rounded-3xl bg-neutral-800/70 px-5 pr-3 focus-within:outline-2 focus-within:outline-blue-vibrant"
				>
					{#if verificationStep}
						<div
							in:fade={{ duration: 350 }}
							class="flex w-full items-center justify-start gap-2 py-5"
						>
							<p class="text-[1.05rem] font-medium">Verification</p>
							<p class="text-neutral-400">Enter code sent to new email</p>
						</div>
					{:else}
						<div class="flex w-full items-center py-3">
							<IconMail class="mr-2 text-neutral-500" />
							<input
								type="text"
								bind:value={emailValue}
								bind:this={emailInput}
								class="grow border-none font-medium outline-none"
							/>

							{#if emailDiff}
								<button
									onclick={revert}
									class="flex items-center px-3 py-2 text-neutral-400 transition-transform hover:text-neutral-300"
								>
									<IconArrowBackUp />
								</button>
							{/if}

							<button
								onclick={() => {
									verificationStep = true
								}}
								class={createClass(
									'rounded-full bg-linear-to-b px-5 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
									emailDiff
										? 'from-blue-500 to-sky-500 text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.3),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.15)]'
										: 'from-neutral-600 to-neutral-600 text-neutral-400 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]'
								)}
							>
								Update
							</button>
						</div>
					{/if}
					{#if verificationStep}
						<div
							in:wipeVertical
							class="flex w-full items-center justify-between border-t border-neutral-700 py-3"
						>
							<VerificationCodeInput />
							<div class="flex items-center gap-2">
								<button
									class={createClass(
										'rounded-full px-5 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
										'text-neutral-400 hover:bg-neutral-700/70 hover:text-neutral-200'
									)}
								>
									Resend
								</button>
								<button
									class={createClass(
										'rounded-full bg-linear-to-b px-5 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
										emailDiff
											? 'from-blue-500 to-sky-500 text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.3),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.15)]'
											: 'from-neutral-600 to-neutral-600 text-neutral-400 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]'
									)}
								>
									Continue
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<div class="flex w-full items-baseline gap-2 px-5">
					<p class="pb-1 text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">
						Phone Number
					</p>
				</div>

				<div
					class="group flex w-full items-center rounded-3xl bg-neutral-800/70 px-5 py-3 pr-3 focus-within:outline-2 focus-within:outline-blue-500"
				>
					<IconDeviceMobile class="mr-2 text-neutral-500" />
					<p class="grow">Switch to Phone Number</p>

					<button class={createClass('py-2 text-[1.05rem] ')}>
						<IconChevronRight />
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Buttons -->
	<div class="flex flex-col gap-2">
		<button
			onclick={handleCancel}
			class="group flex items-center justify-center gap-2 rounded-full py-4 text-[1.05rem] font-semibold text-white transition-transform hover:bg-neutral-800/70 active:scale-[0.97]"
		>
			<IconArrowLeft />
			Go Back
		</button>
	</div>
</div>
