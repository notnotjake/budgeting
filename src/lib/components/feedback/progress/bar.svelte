<script lang="ts">
	import { createClass } from '@opensky/style'
	import { Tween } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	type Props = {
		class?: string
		value: number
		backgroundColor?: string
		primaryColor?: string
		tween?: boolean
		dur?: number
		onComplete?: () => void
	}
	let {
		class: classProp,
		value = 42,
		backgroundColor = 'var(--color-sky-100)',
		primaryColor = 'var(--color-sky-500)',
		tween = true,
		dur = 500,
		onComplete
	}: Props = $props()

	// Create a tweened store for smooth transitions
	const progress = tween
		? new Tween(value, {
				duration: dur,
				easing: cubicOut
			})
		: null

	// Update the progress when value changes
	$effect(() => {
		if (tween && progress) {
			progress.target = Math.min(100, Math.max(0, value))
		}
	})

	$effect(() => {
		if (tween && progress && progress.current >= 100 && onComplete) {
			onComplete()
		}
	})

	let displayValue = $derived(tween && progress ? progress.current : value)
</script>

<div
	style:background={backgroundColor}
	class={createClass('relative h-2 w-20 overflow-hidden rounded-full', classProp)}
>
	<div
		style:width={`${displayValue}%`}
		style:background={primaryColor}
		class="absolute inset-0 h-full"
	></div>
</div>
