<script lang="ts">
	import { createClass } from '@opensky/style'
	import { wipeVertical } from '$ui/transition'
	import { IconMessageChatbotFilled } from '@tabler/icons-svelte'
	import ControlStrip from './control-strip.svelte'
</script>

<!-- Overscroll Top -->
<div class="overscroll-top bg-blue-200 dark:bg-neutral-950"></div>

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
	class="relative flex min-h-screen bg-linear-to-b from-[#F1F1F3] to-[#EDEBED] dark:bg-neutral-950 dark:from-neutral-950 dark:to-neutral-950"
>
	<div class="relative z-10 mx-auto flex h-full min-h-screen w-xl flex-col items-center px-2">
		<h1
			class={createClass(
				'pt-18 pb-8 text-center text-xl text-black transition-all duration-150 dark:text-white'
			)}
		>
			Log a new ticket
		</h1>

		<ControlStrip />
	</div>
</div>
