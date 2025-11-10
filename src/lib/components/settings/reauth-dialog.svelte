<script lang="ts">
	import { getContext } from 'svelte'
	import { Dialog } from 'bits-ui'
	import { fade } from 'svelte/transition'
	import Reauth from './reauth.svelte'

	let { open = $bindable() }: { open: boolean } = $props()

	// let open = $state(false)
	let innerHeight = $state<number>(0)

	const setNestedDialogHeight = getContext<(height: number) => void>('nested-dialog-height')
	const scrollSettingsToTop = getContext<(() => void) | undefined>('settings-scroll-to-top')

	$effect(() => {
		if (open) {
			scrollSettingsToTop?.()
		}
	})

	$effect(() => {
		if (innerHeight && open) {
			setNestedDialogHeight(innerHeight)
		} else {
			setNestedDialogHeight(0)
		}
	})
</script>

<Dialog.Root bind:open>
	<Dialog.Content forceMount preventScroll={false}>
		{#snippet child({ props, open })}
			{#if open}
				<div
					{...props}
					bind:offsetHeight={innerHeight}
					transition:fade={{ duration: 150 }}
					class="absolute top-0 right-0 left-0 z-50 flex w-full flex-col bg-neutral-950"
				>
					<div class="h-fit w-full overflow-y-auto p-3">
						<Reauth />
					</div>
				</div>
			{/if}
		{/snippet}
	</Dialog.Content>
</Dialog.Root>
