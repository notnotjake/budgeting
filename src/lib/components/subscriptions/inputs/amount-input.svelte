<script lang="ts">
	import { createClass } from '@opensky/style'
	import { IconReceiptDollarFilled } from '@tabler/icons-svelte'
	import InputAdapting from '$ui/input/input-adapting.svelte'

	interface Props {
		value: string
	}

	let { value = $bindable() }: Props = $props()
</script>

<label
	class={createClass(
		'flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
		'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
	)}
>
	<IconReceiptDollarFilled size={22} class="shrink-0 grow text-green-600" />
	<InputAdapting
		class={createClass(
			'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
			'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
			'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
			'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
		)}
		type="text"
		placeholderIsMinWidth={true}
		maxWidth="var(--container-4xs)"
		bind:value
		placeholder="0.00"
	/>
</label>
