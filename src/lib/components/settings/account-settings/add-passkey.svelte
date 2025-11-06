<script lang="ts">
	import { startRegistration } from '@simplewebauthn/browser'
	import { startPasskeyRegistration, verifyPasskeyRegistration } from '$remotes/auth/passkey.remote'

	import { onMount } from 'svelte'
	import { createClass } from '@opensky/style'

	let name = $state('')
	let nameInput = $state<HTMLElement>()

	onMount(() => {
		nameInput?.focus()
	})

	async function addPasskey() {
		console.log('test')
		const optionsResult = await startPasskeyRegistration()

		const registrationResponse = await startRegistration({ optionsJSON: optionsResult.options })

		const result = await verifyPasskeyRegistration({ name, registration: registrationResponse })

		console.log(result)
	}
</script>

<div class="flex w-full flex-col px-5 py-1">
	<div class="flex w-full items-baseline gap-2 px-5">
		<p class="pb-1 text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">Name</p>
	</div>

	<div
		class="group flex w-full flex-col items-center rounded-3xl bg-neutral-900 px-5 pr-3 focus-within:outline-2 focus-within:outline-blue-vibrant"
	>
		<div class="flex w-full items-center py-3">
			<input
				type="text"
				bind:value={name}
				maxlength="64"
				bind:this={nameInput}
				placeholder="1Password"
				class="grow border-none font-medium outline-none"
			/>

			<button
				onclick={async () => await addPasskey()}
				disabled={name.length < 3}
				class={createClass(
					'rounded-full bg-linear-to-b px-5 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
					name.length > 3
						? 'from-sky-500 to-sky-500 text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.3),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.15)]'
						: 'from-neutral-600 to-neutral-600 text-neutral-400 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]'
				)}
			>
				Add
			</button>
		</div>
	</div>
</div>
