<script lang="ts">
	import { createClass } from '@opensky/style'
	import {
		IconArrowUp,
		IconCalendarWeekFilled,
		IconMapPinFilled,
		IconBuildings,
		IconReceiptDollarFilled,
		IconArrowBackUp
	} from '@tabler/icons-svelte'
	import { Tooltip, Label } from 'bits-ui'
	import InputAdapting from '$ui/input/input-adapting.svelte'

	let isSubmitAvailable = $state(false)

	let builder = $state('')
	let lot = $state('')
	let billing = $state('')
</script>

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

		<!-- Date -->
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

		<!-- Builder -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Label.Root
					class="flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80"
				>
					<IconBuildings size={22} class="shrink-0 grow text-sky-500" />
					<InputAdapting
						class="w-fit outline-none selection:bg-sky-200 selection:text-blue-600  placeholder:font-medium placeholder:tracking-tight-md placeholder:text-neutral-800 focus:placeholder:text-neutral-500"
						type="text"
						placeholderIsMinWidth={true}
						maxWidth="var(--container-3xs)"
						bind:value={builder}
						placeholder="Builder"
					/>
				</Label.Root>
			</Tooltip.Trigger>
			{@render tooltipContent('Edit Builder')}
		</Tooltip.Root>

		<!-- Lot -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Label.Root
					class="flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80"
				>
					<IconMapPinFilled size={22} class="shrink-0 grow text-indigo-400" />
					<InputAdapting
						class="w-fit outline-none selection:bg-sky-200 selection:text-blue-600  placeholder:font-medium placeholder:tracking-tight-md placeholder:text-neutral-800 focus:placeholder:text-neutral-500"
						type="text"
						placeholderIsMinWidth={true}
						maxWidth="var(--container-3xs)"
						bind:value={lot}
						placeholder="Lot"
					/>
				</Label.Root>
			</Tooltip.Trigger>
			{@render tooltipContent('Edit Lot')}
		</Tooltip.Root>

		<!-- Billing -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Label.Root
					class="flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80"
				>
					<IconReceiptDollarFilled size={22} class="shrink-0 grow text-green-600" />
					<InputAdapting
						class="w-fit outline-none selection:bg-sky-200 selection:text-blue-600  placeholder:font-medium placeholder:tracking-tight-md placeholder:text-neutral-800 focus:placeholder:text-neutral-500"
						type="text"
						placeholderIsMinWidth={true}
						maxWidth="var(--container-3xs)"
						bind:value={billing}
						placeholder="Billing"
					/>
				</Label.Root>
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

{#snippet tooltipContent(text)}
	<Tooltip.Content side="bottom" sideOffset={5} align="center">
		<div class="rounded-2xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50">
			{text}
		</div>
	</Tooltip.Content>
{/snippet}
