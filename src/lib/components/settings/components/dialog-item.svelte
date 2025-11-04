<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getContext } from 'svelte'
	import type { Icon as TablerIcon } from '@tabler/icons-svelte'
	import { Dialog } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { fade } from 'svelte/transition'
	import { AdaptFit } from '$ui/adapt'

	import { IconDotsVertical } from '@tabler/icons-svelte'

	type Props = {
		content: Snippet
		icon: TablerIcon
		title: string
		hint?: string | null
		actionButtonText?: string
	}

	let { content, icon: Icon, title, hint, actionButtonText }: Props = $props()
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="w-full rounded-2xl px-3 py-2 transition-all duration-200 hover:bg-neutral-800/80"
	>
		<div class="flex h-10 items-center gap-2">
			<div class="flex w-7 justify-start text-neutral-500">
				<Icon size={24} />
			</div>
			<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">{title}</h2>
			<p transition:fade={{ duration: 150 }} class="text-neutral-400">{hint}</p>

			<div class="grow"></div>

			<div class="flex grow items-center justify-end gap-3">
				<div class="h-fit w-fit origin-center transition-transform">
					<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
				</div>
			</div>
		</div>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Second Dialog</Dialog.Title>
		<Dialog.Description>This is the second dialog in the nested dialog stack.</Dialog.Description>

		{@render content?.()}

		<Dialog.Close>Close Second Dialog</Dialog.Close>
	</Dialog.Content>
</Dialog.Root>
