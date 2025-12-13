<script lang="ts">
	import { onDestroy } from 'svelte'
	import { createClass } from '@opensky/style'
	import { Timer, SEC } from '$lib/utils/timing'
	import Radial from './radial.svelte'

	type Props = {
		totalTime?: number
		currentTime?: number
		size?: string
		class?: string
		backgroundColor?: string
		primaryColor?: string
		onComplete?: () => void
	}
	let {
		totalTime = 30,
		currentTime = 0,
		size = '0.8rem',
		class: classProp,
		backgroundColor = 'var(--color-neutral-200)',
		primaryColor = 'var(--color-neutral-700)',
		onComplete
	}: Props = $props()

	const timer = new Timer({
		duration: totalTime * SEC,
		immediate: false,
		onComplete
	})

	// Start the timer with the current time offset
	$effect(() => {
		if (timer.state === 'idle') {
			timer.start(currentTime * 1000)
		}
	})

	onDestroy(() => {
		timer.destroy()
	})

	let displayProgress = $derived(100 - timer.progress)
	let timeRemaining = $derived(Math.ceil(timer.remaining / 1000))
</script>

{#if timer.state !== 'completed'}
	<div class="flex items-center">
		<Radial value={displayProgress} {size} {backgroundColor} {primaryColor} tween={false} />
		<div class={createClass('pl-1 text-[0.8rem] font-medium tabular-nums', classProp)}>
			{timeRemaining}s
		</div>
	</div>
{/if}
