<script lang="ts">
	import {
		IconUserCircle,
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconTrashFilled
	} from '@tabler/icons-svelte'
	import AccordionItem from './components/accordion-item.svelte'
	import SectionHeader from './components/section-header.svelte'

	// import ChangeName from './account-settings/change-name.svelte'
	// import ChangeEmail from './account-settings/change-email.svelte'
	// import DeleteAccount from './account-settings/delete-account.svelte'

	import Profile from './profile/profile.svelte'
	import Sessions from './account-settings/sessions.svelte'
	import Passkeys from './account-settings/passkeys.svelte'

	// let { detached = $bindable() } = $props()
</script>

<Profile />

<SectionHeader>Account Settings</SectionHeader>

<AccordionItem
	id="account-sessions"
	icon={IconDeviceIpadHorizontalPin}
	title="Sessions"
	hint="Signed in 3 places"
	actionButtonText="Remove All"
>
	{#snippet content({ registerAction })}
		<Sessions {registerAction} />
	{/snippet}
</AccordionItem>

{@render dividerLine()}

<AccordionItem
	id="account-passkeys"
	icon={IconKeyFilled}
	title="Passkeys"
	hint="1 Passkey"
	actionButtonText="Add Passkey"
>
	{#snippet content({ registerAction })}
		<Passkeys {registerAction} />
	{/snippet}
</AccordionItem>

<!-- Snippets -->
{#snippet dividerLine()}
	<div class="w-full px-3">
		<div class="h-px w-full bg-neutral-500/30"></div>
	</div>
{/snippet}
