<script lang="ts">
	import { createClass } from '@opensky/style'
	import { wipeVertical } from '$ui/transition'
	import {
		IconArrowUp,
		IconCalendarWeekFilled,
		IconMapPinFilled,
		IconBuildings,
		IconReceiptDollarFilled,
		IconArrowBackUp,
		IconMessageChatbotFilled
	} from '@tabler/icons-svelte'
	import { Tooltip } from 'bits-ui'

	let isSubmitAvailable = $state(false)
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

		<div
			class="pointer-events-auto flex h-fit w-fit items-center rounded-4xl bg-[#FAF8FB] px-2 py-1 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_1px_1.5px_0px_rgba(0,0,0,0.08),0_2px_30px_11px_rgba(0,0,0,0.04)] dark:bg-[#212121] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
		>
			<Tooltip.Provider delayDuration={400}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="flex aspect-square h-8 w-8 items-center justify-center rounded-full bg-linear-to-b from-orange-400 to-orange-600 p-2"
						>
							<p class="font-semibold tracking-tight text-white/80">SP</p>
						</button>
					</Tooltip.Trigger>
					{@render tooltipContent('Account')}
				</Tooltip.Root>

				<div class="mx-1 h-full min-h-8 w-0.5 rounded-full bg-neutral-200"></div>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="flex w-fit shrink-0 cursor-pointer items-center gap-1 rounded-full bg-neutral-300/0 px-3 py-2 will-change-transform hover:bg-neutral-200/80 active:scale-95 dark:bg-neutral-700/0 dark:hover:bg-neutral-700/50"
						>
							<IconCalendarWeekFilled size={22} class="shrink-0 grow text-rose-600" />
							<p
								class="w-fit shrink-0 grow font-normal whitespace-nowrap text-neutral-500 dark:text-neutral-400"
							>
								Today
							</p>
							<p
								class="w-fit shrink-0 grow font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200"
							>
								Dec 17th
							</p>
						</button>
					</Tooltip.Trigger>
					{@render tooltipContent('Change Date')}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<div
							class="flex h-full min-h-8 items-center gap-1 rounded-lg px-2 hover:bg-neutral-200/80"
						>
							<IconBuildings size={22} class="shrink-0 grow text-sky-500" />
							<p class="font-medium tracking-tight-md text-neutral-800">Builder</p>
						</div>
					</Tooltip.Trigger>
					{@render tooltipContent('Edit Builder')}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<div
							class="flex h-full min-h-8 items-center gap-1 rounded-lg px-2 hover:bg-neutral-200/80"
						>
							<IconMapPinFilled size={22} class="shrink-0 grow text-indigo-400" />
							<p class="font-medium tracking-tight-md text-neutral-800">Lot</p>
						</div>
					</Tooltip.Trigger>
					{@render tooltipContent('Edit Lot')}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<div
							class="flex h-full min-h-8 items-center gap-1 rounded-lg px-2 hover:bg-neutral-200/80"
						>
							<IconReceiptDollarFilled size={22} class="shrink-0 grow text-green-600" />
							<p class="font-medium tracking-tight-md text-neutral-800">Billing</p>
						</div>
					</Tooltip.Trigger>
					{@render tooltipContent('Edit Billing')}
				</Tooltip.Root>

				<div class="mx-1 h-full min-h-8 w-0.5 rounded-full bg-neutral-200"></div>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<IconArrowBackUp class="mr-2 ml-1 text-neutral-500" />
					</Tooltip.Trigger>
					{@render tooltipContent('Undo/Clear')}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							onclick={() => {}}
							class={createClass(
								'z-50 -mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-500 p-1.5 shadow-md transition-all',
								'active:scale-95',
								isSubmitAvailable
									? 'bg-neutral-800 text-white shadow-md dark:bg-neutral-300 dark:text-neutral-900'
									: 'bg-neutral-300/70 text-neutral-400 shadow-none dark:bg-neutral-700 dark:text-neutral-500'
							)}
						>
							<IconArrowUp stroke={3} size={26} />
						</button>
					</Tooltip.Trigger>
					{@render tooltipContent('Ready to Submit')}
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	</div>
</div>

{#snippet tooltipContent(text)}
	<Tooltip.Content side="bottom" sideOffset={5} align="center">
		<div class="rounded-2xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50">
			{text}
		</div>
	</Tooltip.Content>
{/snippet}
