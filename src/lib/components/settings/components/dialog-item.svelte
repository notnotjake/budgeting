<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { Icon as TablerIcon } from '@tabler/icons-svelte'
	import { Dialog } from 'bits-ui'
	import { fade } from 'svelte/transition'
	import { IconDotsVertical } from '@tabler/icons-svelte'
	import { getDialogContext } from '../dialog-context'

	type Props = {
		content: Snippet<[{ close: () => void }]>
		icon: TablerIcon
		title: string
		hint?: string | null
	}

	let { content, icon: Icon, title, hint }: Props = $props()

	let open = $state(false)
	let innerHeight = $state<number>(0)

	const close = () => {
		open = false
	}

	const { setNestedDialogHeight, scrollToTop } = getDialogContext()

	$effect(() => {
		if (open) {
			scrollToTop()
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
	<Dialog.Trigger
		class="w-full rounded-2xl px-3 py-2 transition-all duration-200 hover:bg-neutral-800/80"
	>
		<div class="flex h-10 items-center gap-2">
			<div class="flex w-7 justify-start text-neutral-500">
				<Icon size={24} />
			</div>
			<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">{title}</h2>
			{#if hint}
				<p transition:fade={{ duration: 150 }} class="text-neutral-400">{hint}</p>
			{/if}

			<div class="grow"></div>

			<div class="flex grow items-center justify-end gap-3">
				<div class="h-fit w-fit origin-center transition-transform">
					<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
				</div>
			</div>
		</div>
	</Dialog.Trigger>
	<Dialog.Content forceMount preventScroll={false} interactOutsideBehavior="ignore">
		{#snippet child({ props, open })}
			{#if open}
				<div
					{...props}
					bind:offsetHeight={innerHeight}
					transition:fade={{ duration: 150 }}
					class="absolute top-0 right-0 left-0 z-50 flex w-full flex-col bg-neutral-950"
				>
					<div class="h-fit w-full overflow-y-auto p-3">
						{@render content({ close })}
					</div>
				</div>
			{/if}
		{/snippet}
	</Dialog.Content>
</Dialog.Root>
