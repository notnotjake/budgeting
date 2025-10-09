<script lang="ts">
	import { Adapt, type AdaptSwitchChangeState } from '$ui/adapt'
	import { scale } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { createSequence } from '$utils/timing'
	import { Suspense } from '$ui/feedback'
	import { IconCheck } from '@tabler/icons-svelte'

	let states = {
		default: 'default',
		loading: 'loading',
		success: 'success',
		error: 'error'
	}

	let changeState = $state<AdaptSwitchChangeState | null>(null)
	let activeState = $state(states.default)

	let sequence = createSequence()

	sequence
		.add(1500, () => {
			changeState?.(states.success)
		})
		.add(1500, () => {
			changeState?.(states.default)
		})
</script>

<div class="mx-auto max-w-4xl p-8">
	<h1 class="mb-8 text-xl font-semibold tracking-tight">Adapt Swap Demo</h1>

	<div class="space-y-6">
		<div class="border-2 border-neutral-100 p-8">
			<Adapt.Switch
				bind:changeState
				bind:activeState
				adaptSize={true}
				transitionIn={scale}
				transitionOut={scale}
				class={createClass(
					activeState === states.default && 'rounded-xl bg-neutral-600',
					activeState === states.loading && 'rounded-full bg-neutral-200 pl-2',
					activeState === states.success && 'rounded-full bg-green-100 pl-1.5'
				)}
				innerClass={createClass('px-3 py-2')}
			>
				{#snippet children({ state, previousState, data })}
					{#if state === states.default}
						<button
							onclick={() => {
								changeState?.(states.loading)
								sequence.run()
							}}
						>
							<p class="font-medium text-white">Save</p>
						</button>
					{:else if state === states.loading}
						<div class="flex items-center gap-4">
							<Suspense.Spinner speed="fast" />
							<Suspense.Text class="font-medium">Saving Progress</Suspense.Text>
						</div>
					{:else if state === states.success}
						<div class="flex items-center gap-3">
							<IconCheck class="rounded-full bg-green-600 p-0.5 text-green-100" />
							<h3 class="text-lg/tight font-medium text-green-600">Success!</h3>
							<p class="mt-1 text-xs/tight whitespace-nowrap text-green-600">
								From: {previousState}
							</p>
						</div>
					{:else if state === 'error'}
						<div class="flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
							<div class="flex-shrink-0">
								<svg
									class="h-8 w-8 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-medium text-red-900">Error Occurred</h3>
								<p class="text-sm text-red-700">Something went wrong. Please try again.</p>
								<button
									onclick={() => changeState?.('default')}
									class="mt-2 text-xs text-red-600 underline hover:text-red-700"
								>
									Back to default
								</button>
							</div>
						</div>
					{:else if state === 'warning'}
						<div
							class="flex items-center gap-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6"
						>
							<div class="flex-shrink-0">
								<svg
									class="h-8 w-8 text-yellow-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-medium text-yellow-900">Warning</h3>
								<p class="text-sm text-yellow-700">Please review your input before proceeding</p>
							</div>
						</div>
					{/if}
				{/snippet}
			</Adapt.Switch>
		</div>

		<div class="flex flex-wrap gap-3">
			<button
				onclick={() => changeState?.('default')}
				class="rounded-full bg-gray-200 px-4 py-1 transition-colors hover:bg-gray-300"
			>
				Default
			</button>
			<button
				onclick={() => changeState?.('loading', { timestamp: Date.now() })}
				class="rounded-full bg-blue-500 px-4 py-1 text-white transition-colors hover:bg-blue-500"
			>
				Loading
			</button>
			<button
				onclick={() => changeState?.('success', { timestamp: Date.now() })}
				class="rounded-full bg-green-500 px-4 py-1 text-white transition-colors hover:bg-green-500"
			>
				Success
			</button>
			<button
				onclick={() => changeState?.('error')}
				class="rounded-full bg-red-500 px-4 py-1 text-white transition-colors hover:bg-red-500"
			>
				Error
			</button>
			<button
				onclick={() => changeState?.('warning')}
				class="rounded-full bg-yellow-500 px-4 py-1 text-white transition-colors hover:bg-yellow-500"
			>
				Warning
			</button>
		</div>
	</div>
</div>
