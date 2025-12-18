<script lang="ts">
	import { createClass } from '@opensky/style'
	import { wipeVertical } from '$ui/transition'
	import { IconMessageChatbotFilled } from '@tabler/icons-svelte'
	import ControlStrip from './control-strip.svelte'
	import Section from './section.svelte'
	import { getItems } from '../play/items.remote'

	const sections = await getItems()
</script>

<!-- Overscroll Top -->
<div class="overscroll-top bg-[#F1F1F3] dark:bg-neutral-950"></div>

<!-- Overscroll Bottom -->
<div class="overscroll-bottom bg-[#EDEBED] dark:bg-neutral-950"></div>

<!-- Feedback Divide -->
<div
	class="group fixed right-2 bottom-2 z-50 rounded-full p-1.5 delay-75 hover:bg-sky-500 hover:shadow-sm"
>
	<IconMessageChatbotFilled
		class="-scale-x-100 text-neutral-600 delay-75 group-hover:text-sky-50"
	/>
</div>

<div
	class="relative flex min-h-screen flex-col bg-linear-to-b from-[#F1F1F3] to-[#EDEBED] dark:bg-neutral-950 dark:from-neutral-950 dark:to-neutral-950"
>
	<div class="relative z-10 flex h-full min-h-screen w-full flex-col items-center px-4">
		<h1
			class={createClass(
				'pt-18 pb-8 text-center text-xl text-black transition-all duration-150 dark:text-white'
			)}
		>
			Log a new ticket
		</h1>

		<ControlStrip />

		<div class="w-full columns-3 gap-6 py-10">
			{#each sections as section (section.id)}
				<div class="mb-6 break-inside-avoid">
					<Section title={section.title} items={section.items} />
				</div>
			{/each}
		</div>
	</div>
</div>
