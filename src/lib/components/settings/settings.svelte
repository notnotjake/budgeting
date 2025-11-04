<script lang="ts">
	import { setContext } from 'svelte'
	import { createClass } from '@opensky/style'
	import { slide } from 'svelte/transition'
	import {
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconChevronRight,
		IconCheck,
		IconDotsVertical,
		IconTrashFilled,
		IconUserCircle
	} from '@tabler/icons-svelte'
	import Title from './components/title.svelte'
	import ChangeEmail from './account-settings/change-email.svelte'
	import DeleteAccount from './account-settings/delete-account.svelte'
	import Passkeys from './account-settings/passkeys.svelte'
	import Sessions from './account-settings/sessions.svelte'
	import { Accordion } from 'bits-ui'

	import Content from './settings-content.svelte'

	let { settingsShown = $bindable() }: { settingsShown: boolean } = $props()

	let accordionValue = $state('')
	setContext('accordion-value', () => accordionValue)

	type ListItemButton = {
		title: string
		hint: string
		icon: any
		action: {
			type: 'inline' | 'menu'
			onclick: () => void
		}
	}

	const emailItem: ListItemButton = {
		title: 'Login Method',
		hint: 'jake@notnotjake.com',
		action: {
			type: 'menu',
			onclick: () => {
				openEmail = true
			}
		},
		icon: IconUserCircle
	}

	const passkeyItem: ListItemButton = {
		title: 'Passkeys',
		hint: '2 Passkeys',
		action: {
			type: 'inline',
			onclick: () => {
				openPasskeys = true
			}
		},
		icon: IconKeyFilled
	}

	const sessionsItem: ListItemButton = {
		title: 'Sessions',
		hint: 'Signed in 3 places',
		action: {
			type: 'inline',
			onclick: () => {
				openSessions = true
			}
		},
		icon: IconDeviceIpadHorizontalPin
	}

	const deleteAccountItem: ListItemButton = {
		title: 'Delete Account',
		hint: '',
		action: {
			type: 'menu',
			onclick: () => {
				openDelete = true
			}
		},
		icon: IconTrashFilled
	}

	let openDelete = $state(false)
	let openEmail = $state(false)
	let openPasskeys = $state(false)
	let openSessions = $state(false)

	let detachedCard = $derived(openDelete || openEmail)
</script>

<!-- Horizontal Spacers (to make it smaller) -->
{#snippet spacer()}
	<div
		class={createClass('transition-all duration-200 ease-out', detachedCard ? 'w-7' : 'w-0')}
	></div>
{/snippet}

<!-- Divider Lines -->
{#snippet dividerLine()}
	<div class="w-full px-3">
		<div class="h-px w-full bg-neutral-500/30"></div>
	</div>
{/snippet}

<!-- Section Header -->
{#snippet sectionHeader(text: string)}
	<div class="flex w-full items-baseline gap-2 px-3">
		<p class="text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400 capitalize">
			{text}
		</p>
	</div>
{/snippet}

<!-- Top Level Button Items -->
{#snippet listItem(item: ListItemButton)}
	<button
		onclick={item.action.onclick}
		class="flex items-center gap-2 rounded-2xl px-3 py-3.5 hover:bg-neutral-800/80"
	>
		<div class="flex w-7 justify-start">
			<item.icon class="text-neutral-500" size={24} />
		</div>
		<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">{item.title}</h2>
		<p class="text-neutral-400">{item.hint}</p>
		<div class="flex grow justify-end">
			{#if item.action.type === 'menu'}
				<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
			{:else}
				<IconChevronRight class="text-neutral-300 hover:text-neutral-100" />
			{/if}
		</div>
	</button>
{/snippet}

<!-- Content -->
<div class={createClass('relatived flex w-xl')}>
	{@render spacer()}

	<div
		in:slide={{ axis: 'y', delay: 300, duration: 400 }}
		out:slide={{ axis: 'y', duration: 300 }}
		class={createClass(
			'relative max-h-152 min-h-50 w-full overflow-y-scroll rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg transition-all duration-200 ease-out',
			detachedCard ? 'mt-5 rounded-t-4xl' : 'mt-0 rounded-t-none'
		)}
	>
		{#if openDelete}
			<DeleteAccount bind:open={openDelete} />
		{:else if openEmail}
			<ChangeEmail bind:open={openEmail} />
		{:else}
			<div class="sticky top-0 z-10 h-fit w-full">
				<Title bind:settingsShown />
			</div>

			<div class="relative min-h-50 w-full px-3 py-3 pb-8">
				<div class="flex flex-col gap-1 pb-4">
					<Accordion.Root type="single" bind:value={accordionValue}>
						<Content />
					</Accordion.Root>

					{@render dividerLine()}

					<!-- This should be 1st but will deal with later -->
					{@render listItem(emailItem)}

					{@render dividerLine()}

					{@render listItem(deleteAccountItem)}
				</div>
			</div>
		{/if}
	</div>

	{@render spacer()}
</div>
