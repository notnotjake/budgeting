<script lang="ts">
	import {
		IconUserCircle,
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconTrashFilled
	} from '@tabler/icons-svelte'
	import AccordionItem from './components/accordion-item.svelte'
	import DialogItem from './components/dialog-item.svelte'
	import SectionHeader from './components/section-header.svelte'
	import Section from './components/section.svelte'
	import Divider from './components/item-divider.svelte'

	// import ChangeName from './account-settings/change-name.svelte'
	import ChangeEmail from './account-settings/change-email.svelte'
	import DeleteAccount from './account-settings/delete-account.svelte'

	import Profile from './profile/profile.svelte'
	import Sessions from './account-settings/sessions.svelte'
	import Passkeys from './account-settings/passkeys.svelte'

	// let { detached = $bindable() } = $props()
</script>

<Profile />

<Section title="AccountSettings">
	<DialogItem icon={IconUserCircle} title="Login Method">
		{#snippet content()}
			<ChangeEmail />
		{/snippet}
	</DialogItem>

	<Divider />

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

	<Divider />

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

	<Divider />

	<DialogItem icon={IconTrashFilled} title="Delete Account">
		{#snippet content()}
			<DeleteAccount />
		{/snippet}
	</DialogItem>
</Section>
