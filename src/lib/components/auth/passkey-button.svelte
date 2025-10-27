<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { startLoginPasskey, verifyLoginPasskey } from '$remotes/auth/authenticate.remote'
	import { startAuthentication } from '@simplewebauthn/browser'

	import { createClass } from '@opensky/style'
	import { scale } from 'svelte/transition'

	import { IconReload } from '@tabler/icons-svelte'
	import IconPasskey from './passkey-icon.svelte'
	import { Suspense } from '$ui/feedback'

	let { identifier, auto = true }: { identifier: string; auto: boolean } = $props()

	type StandardState = 'idle' | 'pending' | 'result' | 'delayed' | 'timeout' | 'issues' | 'error'
	let standardState = $state<StandardState>('idle')

	function setState(state: StandardState) {
		standardState = state
	}

	let buttonState = $derived.by(() => {
		return {
			current: standardState,
			idle: standardState === 'idle',
			pending: standardState === 'pending',
			result: standardState === 'result',
			delayed: standardState === 'delayed', // not used
			timeout: standardState === 'timeout', // not used
			issues: standardState === 'issues', // not used
			error: standardState === 'error'
		}
	})

	let error = $state<boolean | 'cancelled' | 'invalid'>(false)

	async function handleClick() {
		if (buttonState.idle) {
			await tryLoginPasskey()
		} else if (buttonState.pending) {
			setState('idle')
			// cancel attempt?
		} else if (buttonState.error) {
			setState('idle')
			await tryLoginPasskey()
		}
	}

	async function tryLoginPasskey() {
		setState('pending')
		console.log('calling')

		try {
			const optionsResult = await startLoginPasskey({ identifier })

			const authenticationResponse = await startAuthentication({
				optionsJSON: optionsResult.options
			})

			const result = await verifyLoginPasskey({ attestation: authenticationResponse })

			if (result.success && result.redirectUrl) {
				setState('result')
				goto(result.redirectUrl)
			}
		} catch (e) {
			console.error(e)
			setState('error')
		}
	}

	onMount(async () => {
		console.log('mounted')
		if (auto) {
			await tryLoginPasskey()
		}
	})
</script>

<button
	onclick={handleClick}
	class={createClass(
		'bg-blue-vibrant-light flex cursor-pointer items-center justify-center gap-2 py-3 font-medium text-white outline-none transition-all',
		buttonState.idle ? 'rounded-[1.2rem] px-10' : 'my-2 rounded-[2rem] px-4',
		buttonState.result && 'bg-green-600',
		buttonState.error && error === 'cancelled' && 'bg-neutral-600 text-neutral-100',
		buttonState.error && 'ring-3 bg-rose-100 text-rose-500 ring-inset ring-rose-500'
	)}
>
	{#if buttonState.idle}
		<IconPasskey />
		<p>Use Passkey</p>
	{:else if buttonState.pending || buttonState.result}
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
	{:else if buttonState.error && error === 'cancelled'}
		<IconReload stroke={2.5} size={19} />
		<p class="whitespace-nowrap font-medium">Cancelled. Try again</p>
	{:else}
		<IconReload stroke={2.5} size={19} />
		<p class="whitespace-nowrap font-medium">Something went wrong</p>
	{/if}
</button>

{#if buttonState.error}
	<div class="px-5 pb-6 pt-1" in:scale={{ start: 0.8, opacity: 0.7, duration: 300 }}>
		<div class="flex max-w-56 flex-col items-start justify-start">
			<div class="flex items-center gap-1">
				<p class="font-semibold text-rose-600">Error</p>
			</div>
			{#if error}
				<p class="font-[450] leading-5 tracking-tight text-neutral-700">
					{error}
				</p>
			{/if}
		</div>
	</div>
{/if}
