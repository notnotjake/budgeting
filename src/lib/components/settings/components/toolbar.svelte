<script lang="ts">
	import { IconLogout, IconCircleCheck } from '@tabler/icons-svelte'
	import LogoutButton from '$ui/auth/logout-button.svelte'

	let { settingsShown = $bindable() } = $props()
</script>

<div class="flex w-full items-center justify-between px-3">
	<button
		onclick={() => (settingsShown = false)}
		class="flex items-center gap-1 rounded-full bg-linear-to-b from-[#212121] to-neutral-900 px-4 py-1.5 pl-1.5 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)] transition-transform active:scale-95"
	>
		<IconCircleCheck size={21} />
		<p class="font-[450]">Done</p>
	</button>

	<LogoutButton
		class="flex items-center gap-1 rounded-full bg-linear-to-b from-[#212121] to-neutral-900 px-4 py-1.5 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)] transition-transform active:scale-95"
		errorClass="outline-1 outline-rose-400"
	>
		<IconLogout size={21} />
		<p class="font-[450]">Logout</p>
	</LogoutButton>
</div>
