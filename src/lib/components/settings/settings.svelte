<script lang="ts">
	import { setContext } from 'svelte'
	import { Dialog, Accordion } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { slide } from 'svelte/transition'

	import Toolbar from './components/toolbar.svelte'
	import Content from './content/index.svelte'
	import ReauthDialog from './reauth/reauth-dialog.svelte'

	let showReauthDialog = $state(false)
	let reauthResolve = $state<((success: boolean) => void) | null>(null)

	const requireRecentAuth = (): Promise<boolean> => {
		return new Promise((resolve) => {
			reauthResolve = resolve
			showReauthDialog = true
		})
	}

	const handleReauthSuccess = () => {
		showReauthDialog = false
		reauthResolve?.(true)
		reauthResolve = null
	}

	const handleReauthCancel = () => {
		showReauthDialog = false
		reauthResolve?.(false)
		reauthResolve = null
	}

	setContext('settings-reauth', {
		requireRecentAuth
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
					in:slide={{ axis: 'y', delay: 300, duration: 400 }}
					out:slide={{ axis: 'y', duration: 300 }}
					class={createClass(
						'relative flex flex-col overflow-hidden bg-neutral-950 text-neutral-100 shadow-lg transition-all duration-200 ease-out outline-none',
						isNestedDialogOpen ? 'mt-5 rounded-[2.25rem]' : 'mt-0 rounded-t-none rounded-b-4xl',
						isNestedDialogOpen ? 'w-[calc(var(--container-xl)-4rem)]' : 'w-xl',
						isNestedDialogOpen ? 'max-h-none' : 'h-fit max-h-152 min-h-52'
					)}
					style:height={nestedDialogHeight ? `${nestedDialogHeight}px` : ''}
					style:max-height={nestedDialogHeight ? `${nestedDialogHeight}px` : ''}
				>
					<div
						bind:this={scrollRegion}
						class={createClass('flex-1 overflow-y-auto', isNestedDialogOpen && 'overflow-hidden')}
					>
						<div class="sticky top-0 z-10 h-fit w-full">
							<Toolbar />
						</div>

						<div class="w-full px-3 pb-8">
							<Accordion.Root type="single" bind:value={accordionValue}>
								<Content />
							</Accordion.Root>

							<ReauthDialog
								bind:open={showReauthDialog}
								onSuccess={handleReauthSuccess}
								onCancel={handleReauthCancel}
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/snippet}
</Dialog.Content>
