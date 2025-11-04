<script lang="ts">
	import { setContext } from 'svelte'
	import { Dialog, Accordion } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { slide } from 'svelte/transition'
	import {
		IconChevronRight,
		IconDotsVertical,
		IconTrashFilled,
		IconUserCircle
	} from '@tabler/icons-svelte'
	import Title from './components/title.svelte'
	import Content from './settings-content.svelte'

	import ChangeEmail from './account-settings/change-email.svelte'
	import DeleteAccount from './account-settings/delete-account.svelte'

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
<Dialog.Content forceMount>
	{#snippet child({ props, open })}
		{#if open}
			<div class="absolute inset-0 z-100 flex h-screen w-full justify-center">
				<!-- Spacers that expand when nested dialog opens -->
				<div
					class="w-0 transition-all duration-200 ease-out data-[nested-open]:w-7"
					data-nested-open={props['data-nested-open']}
				></div>

				<div
					{...props}
					in:slide={{ axis: 'y', delay: 300, duration: 400 }}
					out:slide={{ axis: 'y', duration: 300 }}
					class={createClass(
						'relative h-fit max-h-152 min-h-52 w-xl overflow-y-scroll rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg transition-all duration-200 ease-out outline-none',
						'w-xl data-nested-open:w-[calc(var(--container-xl)-3.5rem)]',
						'mt-0  data-nested-open:mt-5',
						'rounded-t-none data-nested-open:rounded-t-4xl'
					)}
				>
					<div class="sticky top-0 z-10 h-fit w-full">
						<Title />
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

							<Dialog.Root>
								<Dialog.Trigger>Open Second Dialog</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Title>Second Dialog</Dialog.Title>
									<Dialog.Description>
										This is the second dialog in the nested dialog stack.
									</Dialog.Description>
									<Dialog.Close>Close Second Dialog</Dialog.Close>
								</Dialog.Content>
							</Dialog.Root>
						</div>
					</div>
				</div>

				<!-- Spacers that expand when nested dialog opens -->
				<div
					class="w-0 transition-all duration-200 ease-out data-[nested-open]:w-7"
					data-nested-open={props['data-nested-open']}
				></div>
			</div>
		{/if}
	{/snippet}
</Dialog.Content>
