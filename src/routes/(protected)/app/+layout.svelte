<script lang="ts">
	import AccountButton from '$ui/account-button.svelte'
	import SettingsPane from '$ui/settings.svelte'

	import { slide, fly } from 'svelte/transition'

	let { children } = $props()

	const user = {
		email: 'test@test.com',
		name: 'Curious Panda'
	}

	let settingsShown = $state(false)
</script>

<div class="min-h-screen w-full">
	<div class="absolute inset-0 z-100 h-screen w-full">
		{#if settingsShown}
			<div class="flex h-screen w-full justify-center">
				<SettingsPane bind:settingsShown />
			</div>
		{:else}
			<div
				class="flex w-full justify-center pt-1.5"
				out:fly={{ y: -100, duration: 200 }}
				in:fly={{ y: -100, duration: 400, delay: 375 }}
			>
				<AccountButton {user} bind:settingsShown />
			</div>
		{/if}
	</div>

	{@render children()}
</div>
