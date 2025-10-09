<script lang="ts">
	import { Adapt } from '$ui/adapt'
	import { fade } from 'svelte/transition'

	type ContentState = 'small' | 'wide' | 'tall'
	let contentState = $state<ContentState>('small')

	function cycleContent() {
		switch (contentState) {
			case 'small':
				contentState = 'wide'
				break
			case 'wide':
				contentState = 'tall'
				break
			case 'tall':
				contentState = 'small'
				break
		}
	}
</script>

<div class="mx-auto max-w-5xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Adapting Container Demo</h1>

	<div class="mb-6 flex items-center gap-4">
		<button
			onclick={cycleContent}
			class="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
		>
			Cycle Content Size
		</button>
		<span class="text-sm text-gray-600">Current: {contentState}</span>
	</div>

	<div class="relative w-full rounded-lg border-2 border-dashed border-gray-300 p-4">
		<Adapt.Fit class="mx-auto rounded-lg bg-gray-100 shadow-lg">
			<div class="p-6">
				{#if contentState === 'small'}
					<div in:fade class="text-center whitespace-nowrap">
						<h2 class="text-xl font-semibold">Small Content</h2>
						<p class="mt-2 text-gray-600">This is a compact content block.</p>
					</div>
				{:else if contentState === 'wide'}
					<div in:fade class="space-y-4">
						<h2 class="text-2xl font-semibold">Wide & Medium Height</h2>
						<div class="flex gap-6">
							<div class="flex-1 rounded bg-indigo-200 p-4">
								<h3 class="font-medium">Left Panel</h3>
								<p class="mt-2 text-sm">This content spreads horizontally</p>
							</div>
							<div class="flex-1 rounded bg-teal-200 p-4">
								<h3 class="font-medium">Center Panel</h3>
								<p class="mt-2 text-sm">Creating a wider layout</p>
							</div>
							<div class="flex-1 rounded bg-amber-200 p-4">
								<h3 class="font-medium">Right Panel</h3>
								<p class="mt-2 text-sm">With medium vertical space</p>
							</div>
						</div>
					</div>
				{:else if contentState === 'tall'}
					<div in:fade class="space-y-4">
						<h2 class="text-2xl font-semibold">Tall Content</h2>
						<p class="text-gray-700">
							This content block is taller, demonstrating vertical expansion of the container.
						</p>
						<div class="space-y-3">
							<div class="rounded bg-rose-200 p-3">
								<h3 class="font-medium">Section 1</h3>
								<p class="text-sm">Spring-based animations</p>
							</div>
							<div class="rounded bg-sky-200 p-3">
								<h3 class="font-medium">Section 2</h3>
								<p class="text-sm">Smooth transitions</p>
							</div>
							<div class="rounded bg-emerald-200 p-3">
								<h3 class="font-medium">Section 3</h3>
								<p class="text-sm">Responsive to content</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</Adapt.Fit>
	</div>

	<div class="mt-8 rounded-lg bg-gray-50 p-6">
		<h3 class="mb-2 text-lg font-semibold">How it works:</h3>
		<ul class="list-inside list-disc space-y-1 text-gray-700">
			<li>The container measures its content using ResizeObserver</li>
			<li>Spring physics animate the size changes smoothly</li>
			<li>Overflow is hidden during animations to prevent layout jumps</li>
			<li>Configurable stiffness and damping parameters control the animation feel</li>
		</ul>
	</div>
</div>
