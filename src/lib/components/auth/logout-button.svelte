<script lang="ts">
	import { goto } from '$app/navigation'
	import { logout } from '$remotes/auth/authenticate.remote'
	import { createClass } from '@opensky/style'

	let { children, class: classProp, errorClass, error = $bindable() } = $props()

	const handleLogout = async () => {
		try {
			error = false
			const res = await logout()

			goto(res.redirectUrl)
		} catch {
			error = true
		}
	}
</script>

<button class={createClass(classProp, error && errorClass)} onclick={handleLogout}>
	{#if children}
		{@render children()}
	{:else}
		Logout
	{/if}
</button>
