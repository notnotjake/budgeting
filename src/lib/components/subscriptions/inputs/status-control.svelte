<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconTrashFilled } from '@tabler/icons-svelte'

	type Status = 'active' | 'paused' | 'cancelled'

	interface Props {
		value: Status
	}

	let { value = $bindable() }: Props = $props()

	const options: { value: Status; icon: typeof IconPlayerPlayFilled }[] = [
		{ value: 'active', icon: IconPlayerPlayFilled },
		{ value: 'paused', icon: IconPlayerPauseFilled },
		{ value: 'cancelled', icon: IconTrashFilled }
	]
</script>

<div class="status-control relative flex rounded-full bg-neutral-200 p-1 dark:bg-neutral-800">
	<!-- Sliding background indicator -->
	<div
		class="status-indicator absolute rounded-full bg-white shadow-sm dark:bg-neutral-600"
	></div>

	{#each options as option (option.value)}
		{@const Icon = option.icon}
		<button
			type="button"
			onclick={() => (value = option.value)}
			class={createClass(
				'status-option relative z-10 flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors',
				value === option.value && 'status-option-active',
				value !== option.value &&
					'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
			)}
		>
			<Icon
				size={20}
				class={createClass(
					value === option.value
						? option.value === 'active'
							? 'text-green-600'
							: option.value === 'paused'
								? 'text-orange-500'
								: 'text-rose-500'
						: ''
				)}
			/>
		</button>
	{/each}
</div>

<style>
	.status-control {
		anchor-name: --status-control;
	}

	.status-option-active {
		anchor-name: --status-active;
	}

	.status-indicator {
		position-anchor: --status-active;
		top: anchor(top);
		right: anchor(right);
		bottom: anchor(bottom);
		left: anchor(left);
		transition: all 0.2s ease-out;
	}
</style>
