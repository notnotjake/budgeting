<script lang="ts">
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
	import Toolbar from './components/toolbar.svelte'
	import ChangeName from './change-name.svelte'
	import ChangeEmail from './change-email.svelte'
	import DeleteAccount from './delete-account.svelte'
	import Passkeys from './passkeys.svelte'
	import Sessions from './sessions.svelte'

	let { settingsShown = $bindable() }: { settingsShown: boolean } = $props()

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
				<Toolbar bind:settingsShown />
			</div>

			<div class="relative min-h-50 w-full px-3 py-3 pb-8">
				<div class="flex flex-col gap-1 pb-4">
					<div class="flex w-full flex-col items-center gap-2 pb-5">
						<div class="h-20 w-20 rounded-full bg-linear-to-b from-green-500 to-green-600"></div>
						<ChangeName />
					</div>

					{@render sectionHeader('Account Settings')}

					{@render listItem(emailItem)}

					{@render dividerLine()}

					{@render listItem(passkeyItem)}

					{#if openPasskeys}
						<div
							class="min-h-40 w-full rounded-3xl bg-[#212121] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
						>
							<div class="flex flex-col gap-4">
								<div class="flex w-full flex-col gap-3 px-3 pt-4">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<div class="flex w-7 justify-start">
												<IconKeyFilled class="text-neutral-500" size={24} />
											</div>
											<p class="text-xl font-semibold">Passkeys</p>
										</div>

										<div class="flex items-center gap-3">
											<div>
												<button
													class="h-9 rounded-full bg-linear-to-b from-neutral-600 to-neutral-600 px-4 py-1 text-neutral-100 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]"
													>Add Passkey</button
												>
											</div>
											<button
												onclick={() => (openPasskeys = false)}
												class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-blue-vibrant to-sky-500 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
											>
												<IconCheck />
											</button>
										</div>
									</div>

									<div class="h-px w-full bg-neutral-500/30"></div>
								</div>

								<Passkeys />
							</div>
						</div>
					{/if}

					{@render dividerLine()}

					{@render listItem(sessionsItem)}

					{#if openSessions}
						<div
							class="w-full rounded-3xl bg-[#212121] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
						>
							<div class="flex flex-col gap-4 px-3 py-4">
								<div class="flex w-full flex-col gap-3">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<div class="flex w-7 justify-start">
												<IconDeviceIpadHorizontalPin class="text-neutral-500" size={24} />
											</div>
											<p class="text-xl font-semibold">Sessions</p>
										</div>

										<div class="flex items-center gap-3">
											<div>
												<button
													class="h-9 rounded-full bg-linear-to-b from-neutral-600 to-neutral-600 px-4 py-1 text-neutral-100 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]"
													>Logout All</button
												>
											</div>
											<button
												onclick={() => (openSessions = false)}
												class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-blue-vibrant to-sky-500 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
											>
												<IconCheck />
											</button>
										</div>
									</div>

									<div class="h-px w-full bg-neutral-500/30"></div>
								</div>

								<Sessions />
							</div>
						</div>
					{/if}

					{@render dividerLine()}

					{@render listItem(deleteAccountItem)}
				</div>
			</div>
		{/if}
	</div>

	{@render spacer()}
</div>
