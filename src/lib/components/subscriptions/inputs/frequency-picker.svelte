<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconRepeat } from '@tabler/icons-svelte'

	interface Props {
		value: 'weekly' | 'monthly' | 'yearly'
	}

	let { value = $bindable() }: Props = $props()

	let dropdownOpen = $state(false)

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	let label = $derived(capitalize(value))
</script>

<div class="relative">
	<button
		type="button"
		onclick={() => (dropdownOpen = !dropdownOpen)}
		onblur={() => setTimeout(() => (dropdownOpen = false), 150)}
		class={createClass(
			'flex min-h-8 w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 will-change-transform hover:bg-neutral-200/80 active:scale-95',
			'dark:hover:bg-neutral-700/80',
			dropdownOpen && 'bg-neutral-200/80 dark:bg-neutral-700/80'
		)}
	>
		<IconRepeat size={20} class="shrink-0 text-neutral-500" />
		<p class="font-medium text-neutral-800 dark:text-neutral-200">
			{label}
		</p>
	</button>
	{#if dropdownOpen}
		<div
			class="absolute top-full left-0 z-300 mt-1 w-32 overflow-hidden rounded-xl bg-white p-1 shadow-lg dark:bg-neutral-800"
		>
			{#each ['weekly', 'monthly', 'yearly'] as option (option)}
				<button
					type="button"
					class={createClass(
						'w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-neutral-100 dark:hover:bg-neutral-700',
						value === option
							? 'font-medium text-neutral-900 dark:text-white'
							: 'text-neutral-700 dark:text-neutral-200'
					)}
					onmousedown={() => {
						value = option as 'weekly' | 'monthly' | 'yearly'
						dropdownOpen = false
					}}
				>
					{capitalize(option)}
				</button>
			{/each}
		</div>
	{/if}
</div>
