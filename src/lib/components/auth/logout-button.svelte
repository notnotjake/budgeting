<script lang="ts">
	import type { Snippet } from 'svelte'
	import { goto } from '$app/navigation'
	import { logout } from '$remotes/auth/authenticate.remote'
	import { createClass } from '@opensky/style'

	interface Props {
		/** Content to be displayed with adaptive sizing */
		children?: Snippet
		/** CSS class for the container */
		class?: string
		/** CSS classes applied when in error state */
		errorClass?: string
		/** Bindable state var for an error having occurred */
		error?: boolean
	}

	let { children, class: classProp, errorClass, error = $bindable() }: Props = $props()

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
