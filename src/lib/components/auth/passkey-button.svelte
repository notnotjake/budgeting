<script lang="ts">
	import { onMount } from 'svelte'
	import { startAuthentication, type AuthenticationResponseJSON } from '@simplewebauthn/browser'
	import { remotesTest } from '$lib/remotes/auth.remote'

	import { createClass } from '@opensky/style'
	import { scale } from 'svelte/transition'
	import { Suspense } from '$ui/feedback'
	import { IconReload, IconAlertTriangleFilled } from '@tabler/icons-svelte'
	import IconPasskey from './passkey-icon.svelte'

	let { identifier, supressAuto = false }: { identifier: string; supressAuto: boolean } = $props()

	type ErrorTypes = 'unknown' | 'cancelled' | 'timeout' | 'network'
	type State =
		| { status: 'idle' }
		| { status: 'pending' }
		| { status: 'error'; type: ErrorTypes; message: string | null }

	let state = $state<State>({ status: 'idle' })
	// Derived values for easier access
	const idle = $derived(state.status === 'idle')
	const pending = $derived(state.status === 'pending')
	const error = $derived(state.status === 'error' && state) // return false or the state object (with type and message)

	function handleClick() {
		if (state.status === 'idle') {
			handlePasskeyRequestChallenge()
		} else if (state.status === 'pending') {
			state = {
				status: 'error',
				type: 'unknown',
				message: 'Something went wrong trying to verify your passkey'
			}
		} else {
			state = { status: 'idle' }
		}
	}

	async function handlePasskeyRequestChallenge() {
		state = { status: 'pending' }

		try {
			const result = await remotesTest({ identifier: 'test@test.com' })

			if (result?.success && result?.data) {
				console.log('success', result)
			} else {
				state = { status: 'error', type: 'unknown', message: 'Server error occurred' }
			}
		} catch (e) {
			console.error(e)
			state = { status: 'error', type: 'unknown', message: 'Server error occurred' }
		}
	}
	function handlePasskeySignChallenge() {}
	function handlePasskeyVerifyAssertion() {}
</script>

<button
	onclick={handleClick}
	class={createClass(
		'bg-blue-vibrant-light flex cursor-pointer items-center justify-center gap-2 py-3 font-medium text-white outline-none transition-all',
		idle ? 'rounded-[1.1rem] px-9' : 'my-2 rounded-[2rem] px-4',
		error &&
			error.type !== 'cancelled' &&
			'ring-3 bg-rose-100 text-rose-500 ring-inset ring-rose-500',
		error && error.type === 'cancelled' && 'bg-neutral-600 text-neutral-100'
	)}
>
	{#if idle}
		<IconPasskey />
		<p>Use Passkey</p>
	{:else if pending}
		<Suspense.Spinner
			size={14}
			thickness={10}
			speed="fast"
			primaryColor="var(--color-neutral-100)"
			backgroundColor="var(--color-blue-vibrant-light)"
		/>
		<Suspense.Text
			class="text-md text-[1rem] font-[450]"
			spread={13}
			backgroundColor="var(--color-sky-200)"
			primaryColor="var(--color-white)">Trying Passkey</Suspense.Text
		>
	{:else if error && error.type === 'cancelled'}
		<IconReload stroke={2.5} size={19} />
		<p class="whitespace-nowrap font-medium">Cancelled. Try again</p>
	{:else}
		<IconReload stroke={2.5} size={19} />
		<p class="whitespace-nowrap font-medium">Something went wrong</p>
	{/if}
</button>

{#if error && error.message}
	<div class="px-5 pb-6 pt-3" in:scale={{ start: 0.8, opacity: 0.7, duration: 300 }}>
		<div class="flex max-w-64 flex-col items-start justify-start gap-1">
			<div class="flex items-center gap-1">
				<IconAlertTriangleFilled size={22} class="text-rose-600" />
				<p class="font-semibold text-rose-600">Details:</p>
			</div>
			<p class="font-[450] leading-5 tracking-tight text-neutral-700">
				{error.message}
			</p>
		</div>
	</div>
{/if}
