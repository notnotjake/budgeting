<script lang="ts">
	import type { Snippet } from 'svelte'
	import { useDroppable, type UseDroppableArguments } from '@dnd-kit-svelte/core'
	import { createClass } from '@opensky/style'

	interface DroppableProps extends UseDroppableArguments {
		children: Snippet
		class?: string
	}

	let { children, class: className, ...rest }: DroppableProps = $props()

	const droppable = useDroppable(rest)
</script>

<div class={createClass(className)} bind:this={droppable.node.current}>
	{@render children()}
</div>
