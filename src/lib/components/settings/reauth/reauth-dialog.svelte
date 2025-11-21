<script lang="ts">
	import { onMount, getContext } from 'svelte'

	import { IconShieldLockFilled, IconArrowLeft } from '@tabler/icons-svelte'
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { Dialog } from 'bits-ui'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'
	import CodeInput from '$ui/auth/code-input.svelte'
	import { startReauth } from '$remotes/auth/authenticate.remote'

	type Props = {
		open: boolean
		onSuccess: () => void
		onCancel: () => void
	}
	let { open = $bindable(), onSuccess, onCancel }: Props = $props()

	let innerHeight = $state<number>(0)

	const setReauthDialogHeight = getContext<(height: number) => void>('reauth-dialog-height')
	const scrollSettingsToTop = getContext<(() => void) | undefined>('settings-scroll-to-top')

	// Reauth state
	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	let loading = $state(false)
	let requireReauth = $state(false)

	let identifier = $state('')
	let passkeyAvailable = $state(false)
	let codeSent = $state(false)

	// Initialize reauth options when dialog opens
	$effect(() => {
		if (open) {
			requestStartReauth()
		}
	})

	$effect(() => {
		if (innerHeight && open) {
			setReauthDialogHeight(innerHeight)
		} else {
			setReauthDialogHeight(0)
		}
	})

	function handleReauthSuccess() {
		open = false
		requireReauth = false
		onSuccess()
	}

	async function requestStartReauth() {
		loading = true
		try {
			const result = await startReauth({ timezone: localTimezone })

			if (result.recentAuth) {
				handleReauthSuccess()
				requireReauth = false
			} else {
				requireReauth = true
				scrollSettingsToTop?.()

				identifier = result.identifier
				passkeyAvailable = result.passkeyAvailable
				codeSent = result.codeSent
			}
			loading = false
		} catch (e) {
			console.error('Failed to start reauth', e)
			open = false
			onCancel()
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content forceMount preventScroll={false}>
		{#snippet child({ props, open })}
			{#if open}
				<div
					{...props}
					bind:offsetHeight={innerHeight}
					transition:fade={{ duration: 150 }}
					class="absolute top-0 right-0 left-0 z-50 flex w-full flex-col bg-neutral-950"
				>
					<div class="h-fit w-full overflow-y-auto p-3">
						<div class="flex w-full flex-col justify-center p-3 text-neutral-200">
							<div class="flex w-full flex-col px-5 pt-7 pb-10">
								<!-- Heading -->
								<div class="mb-8 flex flex-col">
									<IconShieldLockFilled size={35} class="mb-2 text-sky-500" />
									<h2 class="text-[1.2rem] font-semibold">Reauth</h2>
									<p class="text-[1.05rem] text-neutral-300">
										This action requires reauthentication
									</p>
								</div>

								<div class="flex w-full flex-col gap-5 pt-10">
									{#if !loading && requireReauth}
										<div data-dark class="group/reauth flex w-full flex-col items-center gap-7">
											{#if passkeyAvailable}
												<PasskeyButton
													{identifier}
													auto={true}
													reauth={true}
													onSuccess={handleReauthSuccess}
												/>
											{/if}

											<div class="flex w-full flex-col items-center gap-1">
												<CodeInput
													{codeSent}
													{identifier}
													timezone={localTimezone}
													reauth={true}
													dark={true}
													onSuccess={handleReauthSuccess}
												/>
											</div>
										</div>
									{/if}
								</div>
							</div>

							<!-- Buttons -->
							<div class="flex flex-col gap-2">
								<button
									onclick={onCancel}
									class="group flex items-center justify-center gap-2 rounded-full py-4 text-[1.05rem] font-semibold text-white transition-transform hover:bg-neutral-800/70 active:scale-[0.97]"
								>
									<IconArrowLeft />
									Go Back
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/snippet}
	</Dialog.Content>
</Dialog.Root>
