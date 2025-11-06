<script lang="ts">
	import { startRegistration } from '@simplewebauthn/browser'
	import { startPasskeyRegistration, verifyPasskeyRegistration } from '$remotes/auth/passkey.remote'

	import { onMount } from 'svelte'
	import { Dialog } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { IconKeyFilled, IconArrowLeft } from '@tabler/icons-svelte'

	let name = $state('')
	let nameInput = $state<HTMLElement>()

	onMount(() => {
		nameInput?.focus()
	})

	async function addPasskey() {
		const optionsResult = await startPasskeyRegistration()

		const registrationResponse = await startRegistration({ optionsJSON: optionsResult.options })

		const result = await verifyPasskeyRegistration({ name, registration: registrationResponse })

		console.log(result)
	}
</script>

<input type="text" bind:value={name} maxlength="64" class="border border-neutral-300" />

<button onclick={addPasskey}>Add Passkey</button>

<div class="flex w-full flex-col justify-center p-3 text-neutral-200">
	<div class="flex w-full flex-col px-5 pt-7 pb-12">
		<!-- Heading -->
		<div class="mb-8 flex flex-col">
			<IconKeyFilled size={35} class="mb-2 text-sky-500" />
			<h2 class="text-[1.2rem] font-semibold">Add Passkey</h2>
			<p class="text-[1.05rem] text-neutral-300">Adding a passkey keeps your account secure</p>
		</div>

		<div class="flex w-full flex-col gap-5 py-1">
			<div>
				<div class="flex w-full items-baseline gap-2 px-5">
					<p class="pb-1 text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">Name</p>
				</div>

				<div
					class="group flex w-full flex-col items-center rounded-3xl bg-neutral-800/70 px-5 pr-3 focus-within:outline-2 focus-within:outline-blue-vibrant"
				>
					<div class="flex w-full items-center py-3">
						<input
							type="text"
							bind:value={name}
							bind:this={nameInput}
							placeholder="1Password"
							class="grow border-none font-medium outline-none"
						/>

						<button
							class={createClass(
								'rounded-full bg-linear-to-b px-5 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
								name !== ''
									? 'from-blue-500 to-sky-500 text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.3),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.15)]'
									: 'from-neutral-600 to-neutral-600 text-neutral-400 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]'
							)}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Buttons -->
	<div class="flex flex-col gap-2">
		<Dialog.Close
			class="group flex items-center justify-center gap-2 rounded-full py-4 text-[1.05rem] font-semibold text-white transition-transform hover:bg-neutral-800/70 active:scale-[0.97]"
		>
			<IconArrowLeft />
			Go Back
		</Dialog.Close>
	</div>
</div>
