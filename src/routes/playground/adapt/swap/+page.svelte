<script lang="ts">
	import { createClass } from '@opensky/style'
	import { Adapt } from '$ui/adapt'
	import { scale } from 'svelte/transition'
	import { wipeHorizontal } from '$ui/transition'
	import { IconCheck } from '@tabler/icons-svelte'

	// Trigger functions bound from components
	let triggerCopyExample = $state<((opts?: any) => void) | null>(null)
	let triggerInlineToast = $state<((opts?: any) => void) | null>(null)
	let triggerAdaptingSwap = $state<((opts?: any) => void) | null>(null)

	let isSavingMessage = $state(false)

	let interruptBounce = true
</script>

<div class="flex flex-col gap-8 p-10">
	<h1 class="text-2xl font-bold">Toast Components</h1>
	<p class="text-gray-600">
		Simple, composable toast notifications with interrupt bouncing and smooth transitions
	</p>

	<!-- Toast.Inline Examples -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Toast.Inline</h2>
		<p class="text-gray-600">For popup notifications that appear and disappear</p>

		<div class="">
			<!-- Basic inline example -->
			<div class="flex items-center">
				<Adapt.Reveal bind:trigger={triggerInlineToast} {interruptBounce}>
					<div transition:wipeHorizontal>
						<div class="mr-2 flex items-center gap-2 rounded-full bg-green-100 px-3 py-2">
							<IconCheck size={17} class="shrink-0 text-green-500" />
							<span class="text-sm font-medium text-green-500">Passkey Saved</span>
						</div>
					</div>
				</Adapt.Reveal>

				<button
					onclick={() => triggerInlineToast?.()}
					class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
				>
					Save Passkey
				</button>
			</div>
		</div>
	</div>

	<!-- Toast.Swap Examples -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Toast.Swap</h2>
		<p class="text-gray-600">For swapping between default and success states</p>

		<div class="space-y-6">
			<!-- Copy button example -->
			<div>
				<h3 class="mb-2 font-medium text-gray-800">Copy Button</h3>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<code class="rounded bg-gray-100 px-2 py-1 text-sm">npm install svelte@latest</code>

						<Adapt.Swap adaptSize={true} {interruptBounce} bind:trigger={triggerCopyExample}>
							<button
								transition:scale={{ duration: 200 }}
								onclick={() => {
									navigator.clipboard.writeText('npm install svelte@latest')
									triggerCopyExample?.({ duration: 2000 })
								}}
								class="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-gray-100"
								title="Copy to clipboard"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									></path>
								</svg>
								<span>Copy</span>
							</button>

							{#snippet swapContent()}
								<div
									transition:scale={{ start: 0.5, duration: 150 }}
									class="flex items-center gap-1 text-green-600"
								>
									<span class="text-sm">Copied!</span>
								</div>
							{/snippet}
						</Adapt.Swap>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Toast.Swap with Size Transitions -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Toast.Swap with Size Transitions</h2>
		<p class="text-gray-600">Now includes built-in smooth size transitions and no layout shift</p>

		<div class="flex items-center gap-4">
			<Adapt.Swap
				{interruptBounce}
				adaptSize={true}
				bind:trigger={triggerAdaptingSwap}
				bind:isActive={isSavingMessage}
				class={createClass(
					'overflow-hidden rounded-full',
					isSavingMessage ? 'bg-purple-200' : 'bg-neutral-400 hover:bg-neutral-500'
				)}
				innerClass="px-3 py-2"
			>
				<button
					transition:scale
					onclick={() => triggerAdaptingSwap?.({ duration: 3000 })}
					class="text-white"
				>
					Save
				</button>

				{#snippet swapContent(data)}
					<div transition:wipeHorizontal>
						<div
							transition:scale={{ duration: 500, opacity: 0 }}
							class="flex items-center gap-2 whitespace-nowrap"
						>
							<IconCheck size={17} class="shrink-0 text-purple-700" />
							<span class="font-medium text-purple-700"> Saved to your profile </span>
						</div>
					</div>
				{/snippet}
			</Adapt.Swap>

			<button
				onclick={() => triggerAdaptingSwap?.({ duration: 3000 })}
				class="rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600"
			>
				External Save
			</button>
		</div>
	</div>
</div>
