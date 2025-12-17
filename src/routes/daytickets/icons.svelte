<script lang="ts">
	import { Popover, RadioGroup } from 'bits-ui'
	import type { Icon as TablerIcon } from '@tabler/icons-svelte'
	import { createClass } from '@opensky/style'

	import {
		IconUsers,
		IconPackage,
		IconBox,
		IconMicrowave,
		IconPlugConnected,
		IconDeviceRemote,
		IconDeviceTv,
		IconGhost3,
		IconDeviceSpeaker,
		IconMicrophone,
		IconCar,
		IconBulb,
		IconStar,
		IconPrinter,
		IconClipboardText,
		IconShield
	} from '@tabler/icons-svelte'

	const icons = [
		{ value: 'box', component: IconBox },
		{ value: 'users', component: IconUsers },
		{ value: 'package', component: IconPackage },
		{ value: 'microwave', component: IconMicrowave },
		{ value: 'plug-connected', component: IconPlugConnected },
		{ value: 'device-remote', component: IconDeviceRemote },
		{ value: 'device-tv', component: IconDeviceTv },
		{ value: 'ghost', component: IconGhost3 },
		{ value: 'device-speaker', component: IconDeviceSpeaker },
		{ value: 'microphone', component: IconMicrophone },
		{ value: 'car', component: IconCar },
		{ value: 'bulb', component: IconBulb },
		{ value: 'star', component: IconStar },
		{ value: 'printer', component: IconPrinter },
		{ value: 'clipboard-text', component: IconClipboardText },
		{ value: 'shield', component: IconShield }
	] as const

	let selectedValue = $state('box')

	let SelectedIcon = $derived(icons.find((i) => i.value === selectedValue)?.component ?? IconBox)
</script>

<Popover.Root>
	<Popover.Trigger
		class="rounded-lg px-1 py-1 hover:bg-neutral-300 data-[state=open]:bg-neutral-300"
	>
		<SelectedIcon size={22} class="text-neutral-700" />
	</Popover.Trigger>

	<Popover.Content
		side="bottom"
		sideOffset={5}
		align="center"
		class="flex w-fit rounded-2xl bg-black p-1 shadow-lg outline-none"
	>
		<RadioGroup.Root bind:value={selectedValue} class="grid grid-cols-4 gap-1">
			{#each icons as { value, component: Icon } (value)}
				{@const isSelected = selectedValue === value}
				<RadioGroup.Item
					{value}
					class={createClass(
						'rounded-xl p-1.5 text-neutral-300',
						isSelected && 'bg-neutral-700 text-neutral-50'
					)}
				>
					<Icon />
				</RadioGroup.Item>
			{/each}
		</RadioGroup.Root>
	</Popover.Content>
</Popover.Root>
