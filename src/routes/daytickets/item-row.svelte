<script lang="ts">
	type Props = {
		name: string
		cost: string
		quantityType?: string
	}

	let { name, cost, quantityType }: Props = $props()

	let quantity = $state('')
	let inputRef = $state<HTMLInputElement>()

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault()

			const currentLabel = inputRef?.closest('label')
			if (!currentLabel) return

			const siblingLabel =
				e.key === 'ArrowDown'
					? currentLabel.nextElementSibling
					: currentLabel.previousElementSibling

			// If there's a sibling in the same section, focus it
			if (siblingLabel) {
				const targetInput = siblingLabel.querySelector('input')
				targetInput?.focus()
				return
			}

			// Otherwise, try to move to adjacent section
			const currentSection = currentLabel.closest('[data-section]')
			if (!currentSection) return

			const adjacentSection =
				e.key === 'ArrowDown'
					? currentSection.nextElementSibling
					: currentSection.previousElementSibling

			if (adjacentSection) {
				const labels = adjacentSection.querySelectorAll('label')
				const targetLabel = e.key === 'ArrowDown' ? labels[0] : labels[labels.length - 1]
				const targetInput = targetLabel?.querySelector('input')
				targetInput?.focus()
			}
		}

		if (e.key === 'Tab') {
			const currentLabel = inputRef?.closest('label')
			if (!currentLabel) return

			const currentSection = currentLabel.closest('[data-section]')
			if (!currentSection) return

			const targetSection = e.shiftKey
				? currentSection.previousElementSibling
				: currentSection.nextElementSibling

			if (targetSection) {
				e.preventDefault()
				const firstInput = targetSection.querySelector('label input')
				if (firstInput instanceof HTMLInputElement) {
					firstInput.focus()
				}
			}
		}
	}
</script>

<label
	class="group/row relative flex w-full cursor-text items-stretch border-b border-neutral-200 border-b-neutral-200/70 first:rounded-t-xl last:rounded-b-xl last:border-b-0 focus-within:z-10 focus-within:rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-vibrant"
>
	<input
		type="text"
		bind:this={inputRef}
		bind:value={quantity}
		onkeydown={handleKeydown}
		class="w-15 bg-white/50 px-1.5 py-1.5 text-right font-mono text-[0.9rem] font-medium outline-none group-first/row:rounded-tl-xl group-last/row:rounded-bl-xl focus:rounded-l-lg focus:bg-blue-500/20 focus:text-blue-vibrant"
	/>
	<span class="flex w-full items-center justify-between gap-1.5 px-2">
		<span class="grow text-[0.9rem] tracking-tight">{name}</span>
		{#if quantityType && quantityType !== 'whole_unit'}
			<span
				class="rounded-full bg-neutral-300 px-1.5 text-xs font-medium tracking-tight text-neutral-600"
			>
				{quantityType}
			</span>
		{/if}
		<span class="text-[0.85rem] tabular-nums opacity-60">${cost}</span>
	</span>
</label>
