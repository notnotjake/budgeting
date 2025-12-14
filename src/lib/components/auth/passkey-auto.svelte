<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount, tick } from 'svelte'
	import { startLoginPasskey, verifyLoginPasskey } from '$remotes/auth/authenticate.remote'
	import { startAuthentication } from '@simplewebauthn/browser'

	async function tryLoginPasskey() {
		try {
			const optionsResult = await startLoginPasskey({ identifier: undefined })

			const authenticationResponse = await startAuthentication({
				optionsJSON: optionsResult.options
			})

			const result = await verifyLoginPasskey({ attestation: authenticationResponse })

			if (result.success && result.redirectUrl) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto(result.redirectUrl, { invalidateAll: true })
			}
		} catch (e) {
			console.error(e)
		}
	}

	onMount(async () => {
		await tick()
		await tryLoginPasskey()
	})
</script>
