<script lang="ts">
	import { getUser } from '$remotes/auth/user.remote'

	import {
		IconUserCircle,
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconTrashFilled
	} from '@tabler/icons-svelte'
	import AccordionItem from '$ui/settings/components/accordion-item.svelte'
	import DialogItem from '$ui/settings/components/dialog-item.svelte'
	import Section from '$ui/settings/components/section.svelte'
	import Divider from '$ui/settings/components/item-divider.svelte'

	import Avatar from './profile/avatar.svelte'
	import ChangeName from './profile/change-name.svelte'

	import LoginMethod from './account/login-method.svelte'
	import Passkeys from './account/passkeys.svelte'
	import Sessions from './account/sessions.svelte'
	import DeleteAccount from './account/delete-account.svelte'

	let user = $derived(await getUser())
</script>

<!-- Profile -->
<div class="flex w-full flex-col items-center gap-2 pb-5">
	<Avatar />
	<ChangeName />
</div>

<!-- Account -->
<Section title="Account Settings">
	<DialogItem icon={IconUserCircle} title="Login Method" hint={user.identifier ?? ''}>
		{#snippet content({ close })}
			<LoginMethod {close} />
		{/snippet}
	</DialogItem>

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

	<DialogItem icon={IconTrashFilled} title="Delete Account">
		{#snippet content({ close })}
			<DeleteAccount {close} />
		{/snippet}
	</DialogItem>
</Section>
