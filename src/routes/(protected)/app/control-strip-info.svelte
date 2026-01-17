<script lang="ts">
	import { createClass } from '@opensky/style'
	import {
		IconDots,
		IconTagFilled,
		IconCreditCard,
		IconWorld,
		IconChevronLeft
	} from '@tabler/icons-svelte'
	import { Tooltip } from 'bits-ui'
	import InputAdapting from '$ui/input/input-adapting.svelte'
	import AdaptSwap from '$lib/components/adapt/swap.svelte'

	type Props = {
		company: string
		tag: string
		account: string
		accounts: string[]
		tags: string[]
	}

	let {
		company = $bindable(),
		tag = $bindable(),
		account = $bindable(),
		accounts,
		tags
	}: Props = $props()

	let expanded = $state(false)
	let accountPopoverOpen = $state(false)
	let tagPopoverOpen = $state(false)

	let filteredAccounts = $derived.by(() => {
		const trimmedInput = account.trim().toLowerCase()
		if (!trimmedInput) return accounts
		return accounts.filter((a) => a.toLowerCase().includes(trimmedInput))
	})

	let filteredTags = $derived.by(() => {
		const trimmedInput = tag.trim().toLowerCase()
		if (!trimmedInput) return tags
		return tags.filter((t) => t.toLowerCase().includes(trimmedInput))
	})

	// Auto-collapse when all fields are cleared
	$effect(() => {
		if (expanded && !company.trim() && !tag.trim() && !account.trim()) {
			// Don't auto-collapse immediately - user might be clearing to re-enter
		}
	})

	// Check if any info field has a value
	let hasCompany = $derived(company.trim() !== '')
	let hasTag = $derived(tag.trim() !== '')
	let hasAccount = $derived(account.trim() !== '')
</script>

<Tooltip.Provider delayDuration={600}>
	<AdaptSwap bind:isActive={expanded} adaptSize={true}>
		{#snippet children()}
			<!-- Collapsed state: IconDots when empty, or value indicators when set -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							onclick={() => (expanded = true)}
							class={createClass(
								'flex min-h-8 cursor-pointer items-center gap-0.5 rounded-full px-2 hover:bg-neutral-200/80',
								'dark:hover:bg-neutral-700/80'
							)}
						>
							{#if hasCompany || hasTag || hasAccount}
								{#if hasCompany}
									<IconWorld size={18} class="text-neutral-500" />
								{/if}
								{#if hasTag}
									<IconTagFilled size={18} class="text-neutral-500" />
								{/if}
								{#if hasAccount}
									<IconCreditCard size={18} class="text-neutral-500" />
								{/if}
							{:else}
								<IconDots size={22} class="text-neutral-500" />
							{/if}
						</button>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Add Info')}
			</Tooltip.Root>
		{/snippet}

	{#snippet swapContent()}
		<!-- Expanded state: Company, Tag, Account inputs + close button -->
		<div class="flex items-center gap-0">
			<!-- Company -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<label
							{...props}
							tabindex="-1"
							class={createClass(
								'flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
								'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
							)}
						>
							<IconWorld size={22} class="shrink-0 grow text-neutral-500" />
							<InputAdapting
								class={createClass(
									'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
									'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
									'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
									'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
								)}
								type="text"
								placeholderIsMinWidth={true}
								maxWidth="var(--container-3xs)"
								bind:value={company}
								placeholder="Company"
							/>
						</label>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Company')}
			</Tooltip.Root>

			<!-- Tag -->
			<Tooltip.Root disabled={tagPopoverOpen}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<label
							{...props}
							tabindex="-1"
							class={createClass(
								'relative flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
								'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
							)}
						>
							<IconTagFilled size={22} class="shrink-0 text-neutral-500" />
							<InputAdapting
								class={createClass(
									'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
									'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
									'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
									'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
								)}
								type="text"
								placeholderIsMinWidth={true}
								maxWidth="var(--container-3xs)"
								bind:value={tag}
								placeholder="Tag"
								onfocus={() => (tagPopoverOpen = true)}
								onblur={() => setTimeout(() => (tagPopoverOpen = false), 150)}
							/>
							{#if tagPopoverOpen && (filteredTags.length > 0 || tags.length > 0)}
								<div
									class="absolute top-full left-0 z-300 mt-1 max-h-60 w-48 overflow-y-auto rounded-xl bg-white p-1 shadow-lg dark:bg-neutral-800"
								>
									{#if filteredTags.length > 0}
										{#each filteredTags as t (t)}
											<button
												type="button"
												class="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
												onmousedown={() => {
													tag = t
													tagPopoverOpen = false
												}}
											>
												{t}
											</button>
										{/each}
									{:else}
										<div class="px-3 py-2 text-sm text-neutral-500">No matches</div>
									{/if}
								</div>
							{/if}
						</label>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Tag')}
			</Tooltip.Root>

			<!-- Account -->
			<Tooltip.Root disabled={accountPopoverOpen}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<label
							{...props}
							tabindex="-1"
							class={createClass(
								'relative flex h-full min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 focus-within:bg-neutral-200/80 hover:bg-neutral-200/80',
								'dark:focus-within:bg-neutral-700/80 dark:hover:bg-neutral-700/80'
							)}
						>
							<IconCreditCard size={22} class="shrink-0 text-neutral-500" />
							<InputAdapting
								class={createClass(
									'w-fit outline-none selection:bg-sky-200 selection:text-blue-600 placeholder:font-medium placeholder:tracking-tight-md',
									'dark:text-white dark:selection:bg-sky-500 dark:selection:text-white',
									'placeholder:text-neutral-800 focus:placeholder:text-neutral-500',
									'dark:placeholder:text-neutral-100 dark:focus:placeholder:text-neutral-400'
								)}
								type="text"
								placeholderIsMinWidth={true}
								maxWidth="var(--container-3xs)"
								bind:value={account}
								placeholder="Account"
								onfocus={() => (accountPopoverOpen = true)}
								onblur={() => setTimeout(() => (accountPopoverOpen = false), 150)}
							/>
							{#if accountPopoverOpen && (filteredAccounts.length > 0 || accounts.length > 0)}
								<div
									class="absolute top-full left-0 z-300 mt-1 max-h-60 w-48 overflow-y-auto rounded-xl bg-white p-1 shadow-lg dark:bg-neutral-800"
								>
									{#if filteredAccounts.length > 0}
										{#each filteredAccounts as acc (acc)}
											<button
												type="button"
												class="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
												onmousedown={() => {
													account = acc
													accountPopoverOpen = false
												}}
											>
												{acc}
											</button>
										{/each}
									{:else}
										<div class="px-3 py-2 text-sm text-neutral-500">No matches</div>
									{/if}
								</div>
							{/if}
						</label>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Account/Card')}
			</Tooltip.Root>

			<!-- Close button -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							onclick={() => (expanded = false)}
							class={createClass(
								'flex min-h-8 cursor-pointer items-center rounded-full px-1.5 hover:bg-neutral-200/80',
								'dark:hover:bg-neutral-700/80'
							)}
						>
							<IconChevronLeft size={18} class="text-neutral-500" />
						</button>
					{/snippet}
				</Tooltip.Trigger>
				{@render tooltipContent('Hide Info')}
			</Tooltip.Root>
		</div>
	{/snippet}
	</AdaptSwap>
</Tooltip.Provider>

{#snippet tooltipContent(text: string)}
	<Tooltip.Portal>
		<Tooltip.Content side="bottom" sideOffset={5} align="center" class="z-200">
			<div
				class="rounded-2xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50"
			>
				{text}
			</div>
		</Tooltip.Content>
	</Tooltip.Portal>
{/snippet}
