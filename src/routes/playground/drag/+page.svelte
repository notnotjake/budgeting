<script lang="ts">
	import { createClass } from '@opensky/style'
	import { useDragAndDrop } from 'fluid-dnd/svelte'
	import { type DragStartEventData, type DragEndEventData } from 'fluid-dnd'

	type Item = {
		id: number
		order: number
		name: string
	}

	const column1 = $state<Item[]>([
		{ id: 1, order: 1, name: 'One' },
		{ id: 2, order: 2, name: 'Two' },
		{ id: 3, order: 3, name: 'Three' }
	])
	const column2 = $state<Item[]>([
		{ id: 4, order: 1, name: 'Four' },
		{ id: 5, order: 2, name: 'Five' },
		{ id: 6, order: 3, name: 'Six' }
	])
	const column3 = $state<Item[]>([
		{ id: 7, order: 1, name: 'Seven' },
		{ id: 8, order: 2, name: 'Eight' },
		{ id: 9, order: 3, name: 'Nine' }
	])

	const [dndColumn1] = useDragAndDrop(column1, {
		droppableGroup: 'columns',
		onDragStart,
		onDragEnd,
		draggingClass: 'dragging',
		handlerSelector: '.handler'
	})
	const [dndColumn2] = useDragAndDrop(column2, {
		droppableGroup: 'columns',
		onDragStart,
		onDragEnd,
		draggingClass: 'dragging',
		handlerSelector: '.handler'
	})
	const [dndColumn3] = useDragAndDrop(column3, {
		droppableGroup: 'columns',
		onDragStart,
		onDragEnd,
		draggingClass: 'dragging',
		handlerSelector: '.handler'
	})

	let isDragging = $state<Item | null>(null)

	function onDragStart(data: DragStartEventData<Item>) {
		isDragging = data.value
		console.log(data)
	}
	function onDragEnd(data: DragEndEventData<Item>) {
		isDragging = null
		console.log(data)
	}
</script>

<p>{isDragging ? 'Dragging' : 'Idle'}</p>

<div class="flex gap-2">
	<div use:dndColumn1 class="m-5 flex w-lg flex-col gap-1">
		{#each column1 as item, index (item.id)}
			<div data-index={index} class="flex gap-2 border-2 border-neutral-300">
				<div class="handler">::</div>
				<p>
					{item.name}
				</p>
			</div>
		{/each}
	</div>

	<div use:dndColumn2 class="m-5 flex w-lg flex-col gap-1">
		{#each column2 as item, index (item.id)}
			<div data-index={index} class="flex gap-2 border-2 border-neutral-300">
				<div class="handler">::</div>
				<p>
					{item.name}
				</p>
			</div>
		{/each}
	</div>

	<div use:dndColumn3 class="m-5 flex w-lg flex-col gap-1">
		{#each column3 as item, index (item.id)}
			<div data-index={index} class="flex gap-2 border-2 border-neutral-300">
				<div class="handler">::</div>
				<p>
					{item.name}
				</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.dragging {
		background: var(--color-neutral-200);
	}
</style>
