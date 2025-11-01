<script lang="ts">
	import { createClass } from '@opensky/style'

	let {
		colorTint = 'var(--color-teal-400)',
		isOpen = false,
		...restProps
	}: {
		colorTint: string
		isOpen: boolean
	} = $props()
</script>

<div
	style:--main-color={colorTint}
	class="h-6.5 border-(--main-color)/70 bg-(--main-color)/20 hover:border-(--main-color)/100 hover:bg-(--main-color)/30 group w-fit min-w-9 rounded-lg border-2 p-[3px] transition-colors duration-150"
>
	<div class="h-full w-full">
		<div
			style:--main-color={colorTint}
			class={createClass(
				'bg-(--main-color)/70 group-hover:bg-(--main-color)/100 h-full rounded-sm transition-all duration-150',
				isOpen ? 'w-[60%]' : 'w-[25%]'
			)}
		></div>
	</div>
</div>
