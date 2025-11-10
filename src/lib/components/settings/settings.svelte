<script lang="ts">
	import { setContext } from 'svelte'
	import { Dialog, Accordion } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { slide } from 'svelte/transition'

	import Title from './components/title.svelte'
	import Content from './settings-content.svelte'
	import ReauthDialog from './reauth-dialog.svelte'

	let reauthShown = $state(false)
	const showReauth = () => {
		reauthShown = true
	}
	setContext('reauth-prompt', {
		showReauth
	})

	let accordionValue = $state('')
	setContext('accordion-value', () => accordionValue)

	let dialogContainer = $state<HTMLDivElement | null>(null)
	const getDialogContainer = () => dialogContainer
	setContext('settings-dialog-container', getDialogContainer)

	let scrollRegion = $state<HTMLDivElement | null>(null)
	const scrollSettingsToTop = () => {
		if (scrollRegion) {
			scrollRegion.scrollTo({ top: 0, behavior: 'auto' })
		}
	}
	setContext('settings-scroll-to-top', scrollSettingsToTop)

	let nestedDialogHeight = $state<null | number>(null)
	const isNestedDialogOpen = $derived(Boolean(nestedDialogHeight))
	const setNestedDialogHeight = (height: number) => {
		if (height > 0) {
			nestedDialogHeight = Math.ceil(height)
		} else {
			nestedDialogHeight = null
		}
	}
	setContext('nested-dialog-height', setNestedDialogHeight)
</script>

<Dialog.Content forceMount>
	{#snippet child({ props, open })}
		{#if open}
			<div class="absolute inset-0 z-100 flex h-screen w-full justify-center">
				<div
					{...props}
					bind:this={dialogContainer}
					data-nested-open={isNestedDialogOpen ? '' : undefined}
					in:slide={{ axis: 'y', delay: 300, duration: 400 }}
					out:slide={{ axis: 'y', duration: 300 }}
					class={createClass(
						'relative flex flex-col overflow-hidden rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg transition-all duration-200 ease-out outline-none',
						'w-xl data-nested-open:w-[calc(var(--container-xl)-4rem)]',
						'h-fit max-h-152 min-h-52 data-nested-open:max-h-none data-nested-open:overflow-hidden',
						'mt-0  data-nested-open:mt-5',
						'rounded-t-none data-nested-open:rounded-t-[2.25rem] data-nested-open:rounded-b-[2.25rem]'
					)}
					style:height={nestedDialogHeight ? `${nestedDialogHeight}px` : ''}
					style:max-height={nestedDialogHeight ? `${nestedDialogHeight}px` : ''}
				>
					<div
						bind:this={scrollRegion}
						class={createClass(
							'flex-1 overflow-y-auto',
							isNestedDialogOpen ? 'overflow-hidden' : ''
						)}
					>
						<div class="sticky top-0 z-10 h-fit w-full">
							<Title />
						</div>

						<div class="w-full px-3 pb-8">
							<Accordion.Root type="single" bind:value={accordionValue}>
								<Content />
							</Accordion.Root>

							<ReauthDialog bind:open={reauthShown} />
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/snippet}
</Dialog.Content>
