<script lang="ts">
	import { onMount } from 'svelte'
	import { startAuthentication, type AuthenticationResponseJSON } from '@simplewebauthn/browser'

	import { createClass } from '@opensky/style'
	import { Suspense } from '$ui/feedback'
	import { IconReload, IconAlertTriangleFilled } from '@tabler/icons-svelte'
	import IconPasskey from './passkey-icon.svelte'

	let { identifier, supressAuto = false }: { identifier: string; supressAuto: boolean } = $props()

	let buttonState: 'idle' | 'pending' | 'error' = $state('idle')

	type ErrorTypes = 'generic' | 'cancelled' | 'timeout' | 'network' | null
	let errorType: ErrorTypes = $state(null)
	let errorMessage: string | null = $state(null)

	const idle = $derived(buttonState === 'idle')
	const pending = $derived(buttonState === 'pending')
	const error = $derived(buttonState === 'error')

	function setError(type: ErrorTypes, message: string | null) {
		buttonState = 'error'
		errorType = type
		errorMessage = message
	}

	// Clear error fields when not in error state
	$effect(() => {
		if (buttonState !== 'error') {
			errorType = null
			errorMessage = null
		}
	})

	// Helper to get the error type by string
	function isErrorType(type: ErrorTypes) {
		return errorType === type
	}

	function handleClick() {
		if (buttonState === 'idle') {
			buttonState = 'pending'
		} else if (buttonState === 'error') {
			buttonState = 'pending'
		} else if (buttonState === 'pending') {
			buttonState = 'idle'
		}
	}

	function passkeyGetOptions() {}
	function passkeyStartAuthentication() {}
	function passkeyVerify() {}
</script>

<button
	onclick={handleClick}
	class={createClass(
		'bg-blue-vibrant-light flex cursor-pointer items-center justify-center gap-2 py-3 font-medium text-white outline-none transition-all',
		idle ? 'rounded-[1.1rem] px-9' : 'my-2 rounded-[2rem] px-4',
		pending && '',
		error && 'border-3 border-rose-500 bg-rose-100 text-rose-500',
		isErrorType('cancelled') && 'border-3 border-neutral-500 bg-neutral-100 text-neutral-600'
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
	{:else if error && isErrorType('cancelled')}
		<IconReload stroke={2.5} />
		<p class="whitespace-nowrap px-2 font-medium">Cancelled. Try again</p>
	{:else}
		<IconReload stroke={2.5} />
		<p class="whitespace-nowrap px-2 font-medium">Something went wrong</p>
	{/if}
</button>

{#if error && errorMessage}
	<div class="px-6 pt-8">
		<div class="flex flex-col items-start justify-start gap-1">
			<div class="flex items-center gap-1">
				<IconAlertTriangleFilled size={22} class="text-rose-600" />
				<p class="font-semibold text-rose-600">Details:</p>
			</div>
			<p class="font-[450] leading-6 tracking-tight text-neutral-700">
				{errorMessage?.message}
			</p>
		</div>
	</div>
{/if}
