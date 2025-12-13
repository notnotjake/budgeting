<script lang="ts">
	import { useDragAndDrop } from 'fluid-dnd/svelte'
	import { type DragStartEventData, type DragEndEventData } from 'fluid-dnd'

	type Item = {
		id: number
		order: number
		name: string
	}

	const items = $state<Item[]>([
		{ id: 1, order: 1, name: 'One' },
		{ id: 2, order: 2, name: 'Two' },
		{ id: 3, order: 3, name: 'Three' },
		{ id: 4, order: 4, name: 'Four' }
	])

	const testList = $state<Item[]>([
		{ id: 1, order: 1, name: 'Test 1' },
		{ id: 2, order: 2, name: 'Test 2' },
		{ id: 3, order: 3, name: 'Test 3' }
	])

	const [sortableList] = useDragAndDrop(items, {
		onDragStart,
		onDragEnd
	})
	function onDragStart(data: DragStartEventData<Item>) {
		console.log(data)
	}
	function onDragEnd(data: DragEndEventData<Item>) {
		console.log(data)
	}

	let droppableGroup = $state<HTMLElement | null>(null)
	const list = $state([1, 2, 3])
	const [parent] = useDragAndDrop(testList, {
		droppableGroup: 'group1',
		onDragStart,
		onDragEnd
	})

	function addNew() {
		const sortedList = Array.from(list).sort((a, b) => a - b)
		const newValue = sortedList[sortedList.length - 1] + 1
		list.push(newValue)
	}

	// $inspect(items)
</script>

<ul use:parent class="number-list debug p-10">
	{#each list as element, index (element)}
		<li data-index={index} class="number mt-1 debug bg-neutral-100 pl-2">
			{element}
		</li>
	{/each}
</ul>

<button
	onclick={() => {
		addNew()
	}}>Add</button
>

<div bind:this={droppableGroup}>
	<div use:sortableList class="flex flex-col gap-1">
		{#each items as item, index (item.id)}
			<p data-index={index} class="rounded-sm bg-neutral-200 p-2">{item.name} ({index})</p>
		{/each}
	</div>
</div>
