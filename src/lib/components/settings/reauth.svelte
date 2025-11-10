<script lang="ts">
	import { IconShieldLockFilled, IconArrowLeft } from '@tabler/icons-svelte'
	import { Dialog } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'
	import CodeInput from '$ui/auth/code-input.svelte'

	let { open = $bindable() } = $props()

	let passkeyAvailable = $state(false)
	let identifier = $state('jake@notnotjake.com')
	let codeSent = $state(false)
	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
</script>

<div class="flex w-full flex-col justify-center p-3 text-neutral-200">
	<div class="flex w-full flex-col px-5 pt-7 pb-12">
		<!-- Heading -->
		<div class="mb-8 flex flex-col">
			<IconShieldLockFilled size={35} class="mb-2 text-sky-500" />
			<h2 class="text-[1.2rem] font-semibold">Reauth</h2>
			<p class="text-[1.05rem] text-neutral-300">This action requires reauthentication</p>
		</div>

		<div class="flex w-full flex-col gap-5 py-1">
			<div>
				<div data-dark class="group/reauth flex w-full flex-col items-center p-3">
					<div class="flex w-full flex-col items-center gap-7 pt-14 pb-3">
						{#if passkeyAvailable}
							<PasskeyButton auto={true} {identifier} />
						{/if}

						<CodeInput {codeSent} {identifier} timezone={localTimezone} dark={true} />
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
