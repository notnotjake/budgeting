<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { createClass } from '@opensky/style'
	import { fade } from 'svelte/transition'
	import { Adapt } from '$ui/adapt'
	import { IconDots } from '@tabler/icons-svelte'
	import { createSequence } from '$lib/utils/timing'

	let isActive = $state(false)
	let swapData = $state<string | undefined>()

	const sequence = createSequence({ interruptible: true })

	sequence
		.at(0, () => {
			isActive = true
			swapData = 'initial'
		})
		.add(2000, () => {
			swapData = 'welcome'
		})
		.add(3000, () => {
			isActive = false
			swapData = null
		})

	onMount(() => {
		sequence.run()
	})

	onDestroy(() => {
		sequence.stop()
	})

	// Demo user data
	const user = {
		name: 'John Doe',
		email: 'john@example.com'
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-neutral-50">
	<div class="flex flex-col items-center gap-8">
		<h1 class="text-2xl font-semibold text-neutral-800">Adapting Container Demo</h1>

		<div
			class={createClass(
				'flex items-center justify-center gap-2 rounded-[3rem] transition-all duration-200',
				isActive ? 'bg-neutral-900 shadow-md' : 'bg-neutral-100'
			)}
		>
			<Adapt.Swap bind:isActive bind:swapData class="flex items-center" adaptSize={true}>
				{#snippet swapContent(data)}
					<div transition:fade={{ duration: 200 }}>
						{#if data === 'initial'}
							<div class="flex items-center justify-center gap-1 px-4 py-2">
								<h3 class="text-[0.95rem] font-medium text-white">Logged In</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.email}</p>
							</div>
						{:else if data === 'welcome'}
							<div class="flex items-center justify-center gap-1 px-4 py-2">
								<h3 class="text-[0.95rem] font-medium text-white">Welcome back</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.name}</p>
							</div>
						{/if}
					</div>
				{/snippet}

				<div class="px-2">
					<IconDots color="var(--color-neutral-500)" />
				</div>
			</Adapt.Swap>
		</div>

		<button
			onclick={() => sequence.run()}
			class="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-300"
		>
			Run Sequence
		</button>
	</div>
</div>
