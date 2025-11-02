<script lang="ts">
	import { IconLogout, IconCircleCheck, IconX, IconHelp } from '@tabler/icons-svelte'
	import LogoutButton from '$ui/auth/logout-button.svelte'

	let { settingsShown = $bindable() } = $props()

	const getHelp = () => {
		console.log('TODO: implement help feature')
	}
</script>

<div
	class="flex w-full items-center justify-between bg-linear-to-b from-neutral-950 from-70% to-neutral-950/0 px-3 py-3 pb-6"
>
	<button
		onclick={() => (settingsShown = false)}
		class="flex items-center transition-transform active:scale-95"
	>
		<IconX size={30} stroke={2.5} />
	</button>

	<p class="text-[1.15rem] font-semibold">Settings</p>

	<button onclick={getHelp} class="flex items-center transition-transform active:scale-95">
		<IconHelp size={30} />
	</button>
</div>
