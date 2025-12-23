<script lang="ts">
	import { useDragAndDrop } from 'fluid-dnd/svelte'

	const list1 = $state([1, 2, 3, 4])
	const list2 = $state([5, 6, 7, 8])
	const list3 = $state([9, 10, 11, 12])

	const [parent1] = useDragAndDrop(list1, {
		droppableGroup: 'group1'
	})
	const [parent2] = useDragAndDrop(list2, {
		droppableGroup: 'group1'
	})
	const [parent3] = useDragAndDrop(list3, {
		droppableGroup: 'group1'
	})
</script>

<div class="flex w-full gap-4 p-4">
	<div class="flex-1 rounded-lg bg-neutral-100 p-3">
		<h2 class="mb-3 font-bold">Column 1</h2>
		<ul use:parent1 class="flex flex-col gap-2 border-2 border-dashed border-blue-400 p-2">
			{#each list1 as item, index (item)}
				<li data-index={index} class="rounded border bg-white p-3">
					{item}
				</li>
			{/each}
			{#if list1.length === 0}
				<li
					data-index={0}
					class="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 text-center text-neutral-400"
				>
					Drop here
				</li>
			{/if}
		</ul>
	</div>

	<div class="flex-1 rounded-lg bg-neutral-100 p-3">
		<h2 class="mb-3 font-bold">Column 2</h2>
		<ul use:parent2 class="flex flex-col gap-2 border-2 border-dashed border-blue-400 p-2">
			{#each list2 as item, index (item)}
				<li data-index={index} class="rounded border bg-white p-3">
					{item}
				</li>
			{/each}
			{#if list2.length === 0}
				<li
					data-index={0}
					class="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 text-center text-neutral-400"
				>
					Drop here
				</li>
			{/if}
		</ul>
	</div>

	<div class="flex-1 rounded-lg bg-neutral-100 p-3">
		<h2 class="mb-3 font-bold">Column 3</h2>
		<ul use:parent3 class="flex flex-col gap-2 border-2 border-dashed border-blue-400 p-2">
			{#each list3 as item, index (item)}
				<li data-index={index} class="rounded border bg-white p-3">
					{item}
				</li>
			{/each}
			{#if list3.length === 0}
				<li
					data-index={0}
					class="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 text-center text-neutral-400"
				>
					Drop here
				</li>
			{/if}
		</ul>
	</div>
</div>

<div class="p-4">
	<pre class="text-xs">{JSON.stringify({ list1, list2, list3 }, null, 2)}</pre>
</div>
