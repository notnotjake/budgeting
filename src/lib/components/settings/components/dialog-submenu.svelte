<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getContext } from 'svelte'
	import { Dialog } from 'bits-ui'
	import { fade } from 'svelte/transition'

	type Props = {
		trigger: Snippet
		content: Snippet
	}

	let { trigger, content }: Props = $props()

	let open = $state(false)
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
	<Dialog.Trigger>
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Content forceMount preventScroll={false}>
		{#snippet child({ props, open })}
			{#if open}
				<div
					{...props}
					bind:offsetHeight={innerHeight}
					transition:fade={{ duration: 150 }}
					class="absolute inset-x-0 top-0 z-50 flex w-full flex-col bg-neutral-950"
				>
					<div class="h-fit w-full overflow-y-auto px-3 pt-4 pb-8">
						{@render content()}
					</div>
				</div>
			{/if}
		{/snippet}
	</Dialog.Content>
</Dialog.Root>
