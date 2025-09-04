<script lang="ts">
	import {
		DndContext,
		DragOverlay,
		type DragEndEvent,
		type DragOverEvent,
		type DragStartEvent,
		type Over,
		type Active,
		type UniqueIdentifier
	} from '@dnd-kit-svelte/core'
	import { sensors } from './sensors'
	import Droppable from './droppable.svelte'
	import Draggable from './draggable.svelte'

	const containers = ['A', 'B', 'C']
	let parent = $state<UniqueIdentifier | null>(null)
</script>

<DndContext
	{sensors}
	onDragEnd={(event) => {
		parent = event.over?.id ?? null
	}}
>
	<div class="flex-s-center h-20">
		{#if parent === null}
			{@render draggableMarkup()}
		{:else}
			<div class="text-neutral-4 fw-semibold">Drop here</div>
		{/if}
	</div>

	<div class="grid gap-8 md:grid-cols-3">
		{#each containers as container}
			<Droppable id={container} class="flex-s-center h-100px bg-#F9F9F9 rd-3xl">
				{#if parent === container}
					{@render draggableMarkup()}
				{:else}
					<div class="text-neutral-4 fw-semibold">Drop here</div>
				{/if}
			</Droppable>
		{/each}
	</div>
</DndContext>

{#snippet draggableMarkup()}
	<Draggable />
{/snippet}
