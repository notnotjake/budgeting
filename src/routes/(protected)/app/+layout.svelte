<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { fade, fly, slide } from 'svelte/transition'
	import { createClass } from '@opensky/style'

	import AccountButton from '$ui/settings/account-button.svelte'
	import SettingsPane from '$ui/settings/settings.svelte'

	let { children } = $props()

	let settingsShown = $state(false)

	const openSettings = () => {
		settingsShown = true
	}
</script>

<!-- Overscroll Top -->
<div
	class="fixed top-0 -z-2 h-[300px] w-full -translate-y-[299px]"
	class:bg-neutral-950={settingsShown}
	class:bg-neutral-50={!settingsShown}
></div>

<div class="min-h-screen w-full bg-neutral-50">
	<Dialog.Root bind:open={settingsShown}>
		<Dialog.Portal>
			<Dialog.Overlay forceMount>
				{#snippet child({ props, open })}
					{#if open}
						<div
							{...props}
							transition:fade={{ duration: 200 }}
							class="absolute inset-0 z-50 h-screen w-full bg-neutral-100/30 data-nested-open:bg-neutral-200/40"
						></div>
					{/if}
				{/snippet}
			</Dialog.Overlay>
			<!-- Content -->
			<SettingsPane />
		</Dialog.Portal>
	</Dialog.Root>

	<div class="pointer-events-none absolute inset-0 z-100 h-screen w-full">
		{#if !settingsShown}
			<div
				class="flex w-full justify-center pt-1.5"
				out:fly={{ y: -100, duration: 200 }}
				in:fly={{ y: -100, duration: 400, delay: 375 }}
			>
				<div class="pointer-events-auto">
					<AccountButton {openSettings} />
				</div>
			</div>
		{/if}
	</div>

	{@render children()}
</div>
