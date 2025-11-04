<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { IconX, IconHelp } from '@tabler/icons-svelte'

	const getHelp = () => {
		console.log('TODO: implement help feature')
	}
</script>

<div
	class="flex w-full items-center justify-between bg-linear-to-b from-neutral-950 from-70% to-neutral-950/0 px-3 py-3 pb-6"
>
	<Dialog.Close class="flex items-center transition-transform active:scale-95">
		<IconX size={30} stroke={2.5} />
	</Dialog.Close>

	<p class="text-[1.15rem] font-semibold">Settings</p>

	<button onclick={getHelp} class="flex items-center transition-transform active:scale-95">
		<IconHelp size={30} />
	</button>
</div>
