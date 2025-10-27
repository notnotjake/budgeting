<script lang="ts">
	import { ProgressCountdown } from '$ui/feedback'
	import { createClass } from '@opensky/style'

	let {
		cooldownMs = 20 * 1000,
		onclick
	}: {
		cooldownMs: number
		onclick: () => void | Promise<void>
	} = $props()

	let resendAvailable = $state(false) // Controls when button is available

	const onComplete = () => {
		resendAvailable = true
	}
</script>

<button
	{onclick}
	disabled={!resendAvailable}
	class="group flex items-center rounded-full bg-none px-4 py-2 font-medium text-neutral-700 transition-all hover:bg-neutral-50 active:scale-95"
>
	<p class="font-medium group-disabled:text-neutral-500">Resend</p>
	{#if !resendAvailable}
		<div
			class={createClass(
				'duration-250 overflow-hidden transition-all',
				'max-w-0 pl-0 opacity-50 group-hover:max-w-40 group-hover:pl-1 group-hover:opacity-100'
			)}
		>
			<div
				class={createClass(
					'duration-250 w-fit pl-1 transition-all',
					'translate-x-[-100%] group-hover:translate-x-0'
				)}
			>
				<ProgressCountdown totalTime={cooldownMs / 1000} currentTime={3} {onComplete} />
			</div>
		</div>
	{/if}
</button>
