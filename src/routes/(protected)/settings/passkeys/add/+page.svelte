<script lang="ts">
	import { startRegistration } from '@simplewebauthn/browser'
	import { startPasskeyRegistration, verifyPasskeyRegistration } from '$lib/remotes/auth.remote'

	let name = $state('')

	async function addPasskey() {
		const optionsResult = await startPasskeyRegistration()

		console.log(optionsResult)

		const registrationResponse = await startRegistration({ optionsJSON: optionsResult.options })

		const result = await verifyPasskeyRegistration({ name, registration: registrationResponse })

		console.log(result)
	}
</script>

<input type="text" bind:value={name} maxlength="64" class="border-1 border-neutral-300" />

<button onclick={addPasskey}>Add Passkey</button>
