<script lang="ts">
	import { onDestroy } from 'svelte'
	import { Timer, SEC } from '$lib/utils/timing'
	import Radial from './radial.svelte'

	type Props = {
		totalTime?: number
		currentTime?: number
		size?: string
		backgroundColor?: string
		primaryColor?: string
		onComplete?: () => void
	}
	let {
		totalTime = 30,
		currentTime = 0,
		size = '0.8rem',
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

	$inspect(timer.state)

	onDestroy(() => {
		timer.destroy()
	})

	let displayProgress = $derived(100 - timer.progress)
	let timeRemaining = $derived(Math.ceil(timer.remaining / 1000))
</script>

{#if timer.state !== 'completed'}
	<div class="flex items-center">
		<Radial value={displayProgress} {size} {backgroundColor} {primaryColor} tween={false} />
		<div class="pl-1 text-[0.8rem] font-medium tabular-nums">
			{timeRemaining}s
		</div>
	</div>
{/if}
