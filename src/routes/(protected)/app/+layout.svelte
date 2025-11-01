<script lang="ts">
	import { fly } from 'svelte/transition'

	import AccountButton from '$ui/settings/account-button.svelte'
	import SettingsPane from '$ui/settings/settings.svelte'

	let { children } = $props()

	let settingsShown = $state(false)
</script>

<div class="min-h-screen w-full">
	<div class="pointer-events-none absolute inset-0 z-100 h-screen w-full">
		{#if settingsShown}
			<div class="flex h-screen w-full justify-center">
				<div class="pointer-events-auto">
					<SettingsPane bind:settingsShown />
				</div>
			</div>
		{:else}
			<div
				class="flex w-full justify-center pt-1.5"
				out:fly={{ y: -100, duration: 200 }}
				in:fly={{ y: -100, duration: 400, delay: 375 }}
			>
				<div class="pointer-events-auto">
					<AccountButton bind:settingsShown />
				</div>
			</div>
		{/if}
	</div>

	{@render children()}
</div>
