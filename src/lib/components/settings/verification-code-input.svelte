<script lang="ts">
	import { onMount, tick } from 'svelte'

	import { delay } from '$utils/timing'
	import { createClass } from '@opensky/style'
	import { createShake } from '$lib/components/adapt/shake-behavior'
	import { scale } from 'svelte/transition'
	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui'

	let codeValue = $state('')
	type CellProps = PinInputRootSnippetProps['cells'][0]

	onMount(async () => {
		await tick()

		codeValue = ''
	})
</script>

<div>
	<PinInput.Root
		bind:value={codeValue}
		maxlength={6}
		pattern={REGEXP_ONLY_DIGITS}
		class={createClass(
			'group flex w-fit cursor-pointer items-center overflow-hidden pr-2 has-disabled:opacity-70'
		)}
	>
		{#snippet children({ cells })}
			<!-- Pin Input -->
			<div class="flex">
				{#each cells.slice(0, 3) as cell}
					{@render Cell(cell)}
				{/each}
			</div>

			<div class="flex w-4 items-center justify-center"></div>

			<div class="flex gap-[0.1rem]">
				{#each cells.slice(3, 6) as cell}
					{@render Cell(cell)}
				{/each}
			</div>
		{/snippet}
	</PinInput.Root>

	<!-- Pin input snippet for each input character -->
	{#snippet Cell(cell: CellProps)}
		<PinInput.Cell
			{cell}
			class={createClass(
				'group/cell relative flex h-10 w-5 cursor-pointer items-center justify-center rounded-xl transition-all duration-500',
				cell.char !== null && 'data-active:bg-sky-400/20'
			)}
		>
			<div class="absolute top-0 left-0 flex h-full w-full items-center justify-center">
				<div
					style:opacity={cell.char === null ? '1.0' : '0.0'}
					style:transform={cell.char === null ? 'translateY(0%)' : 'translateY(150%)'}
					style:scaleY={cell.char === null ? '1.0' : '3.0'}
					class={createClass(
						`text-xl font-semibold transition-all duration-200`,
						cell.hasFakeCaret
							? 'text-blue-vibrant-light'
							: 'text-neutral-600 group-hover:text-neutral-500 group-hover:group-focus-within:text-neutral-600'
					)}
				>
					0
				</div>
			</div>
			<div
				style:opacity={cell.char !== null ? '1.0' : '0.0'}
				style:transform={cell.char !== null ? 'translateY(0%)' : 'translateY(-50%)'}
				style:filter={cell.char !== null ? 'blur(0px)' : 'blur(5px)'}
				class="text-xl font-medium transition-all duration-300 group-data-active/cell:text-blue-500"
			>
				{cell.char}
			</div>
		</PinInput.Cell>
	{/snippet}
</div>
