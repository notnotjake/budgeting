<script lang="ts">
	import { Suspense, Progress } from '$ui/feedback'
	import { createClass } from '@opensky/style'

	let isTrue = $state(false)

	let value = $state(20)
</script>

<div>
	<p class={createClass('font-bold', isTrue ? 'text-black' : 'text-blue-500')}>Testing</p>
</div>

<div class="flex flex-col gap-2 px-4 py-4">
	<Suspense.Spinner />
	<Suspense.Text>Testing this Tooling</Suspense.Text>
	<Suspense.Skeleton class="w-20" />
	<Suspense.Bar speed="fast" bounce={false} />
</div>

<div class="flex flex-col gap-2 px-4 py-4">
	<Progress.Ring {value} />
	<Progress.Text {value} class="text-xl font-bold">Testing this Tooling</Progress.Text>
	<Progress.Radial {value} />
	<Progress.Bar {value} />
	<Progress.Countdown totalTime={15} />
</div>

<button
	onclick={() => {
		isTrue = !isTrue
		if (value > 50) {
			value = 30
		} else {
			value = 80
		}
	}}>Trigger</button
>
