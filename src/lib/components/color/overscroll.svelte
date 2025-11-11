<script lang="ts">
	import { createClass } from '@opensky/style'

	type Props = { edge: 'top' | 'bottom'; class?: string }
	let { edge, class: classProp }: Props = $props()
</script>

<div
	class={createClass(
		'fixed -z-10 h-[300px] w-full',
		edge === 'top' && 'top-0 -translate-y-[299px]',
		edge === 'bottom' && 'bottom-0 translate-y-[299px]',
		classProp
	)}
></div>
