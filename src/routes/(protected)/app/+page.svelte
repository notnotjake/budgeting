<script lang="ts">
	import {
		getSubscriptions,
		getAccounts,
		getTags,
		createSubscription,
		deleteSubscription,
		pauseSubscription,
		cancelSubscription
	} from '$remotes/subscriptions.remote'
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { ContextMenu } from 'bits-ui'
	import { IconTrash, IconPlayerPause, IconX, IconTrashFilled, IconPlayerPauseFilled, IconArrowNarrowRight } from '@tabler/icons-svelte'
	import ControlStrip from './control-strip.svelte'

	let isSubmitting = $state(false)
	let subscriptionsPromise = $state(getSubscriptions())
	let accountsPromise = $state(getAccounts())
	let tagsPromise = $state(getTags())

	async function handleSubmit(data: {
		name: string
		company: string | undefined
		account: string | undefined
		tag: string | undefined
		amount: number
		dueDate: string
		frequency: 'day' | 'month'
		frequencyInterval: number
	}) {
		isSubmitting = true
		try {
			await createSubscription(data)
			// Refresh subscriptions and accounts/tags lists
			subscriptionsPromise = getSubscriptions()
			accountsPromise = getAccounts()
			tagsPromise = getTags()
		} catch (e) {
			console.error('Failed to create subscription', e)
			alert('Failed to create subscription')
		} finally {
			isSubmitting = false
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteSubscription({ id })
			subscriptionsPromise = getSubscriptions()
			accountsPromise = getAccounts()
			tagsPromise = getTags()
		} catch (e) {
			console.error('Failed to delete subscription', e)
		}
	}

	async function handlePause(id: string) {
		try {
			await pauseSubscription({ id })
			subscriptionsPromise = getSubscriptions()
		} catch (e) {
			console.error('Failed to pause subscription', e)
		}
	}

	async function handleCancel(id: string) {
		try {
			await cancelSubscription({ id })
			subscriptionsPromise = getSubscriptions()
		} catch (e) {
			console.error('Failed to cancel subscription', e)
		}
	}
</script>

<div
	class={createClass(
		'relative z-10 flex h-full min-h-screen w-full flex-col items-center',
		'transition-transform duration-300 will-change-transform'
	)}
>
	<h1
		class={createClass(
			'pt-18 text-center text-xl text-black transition-all duration-150 dark:text-white'
		)}
	>
		Subscriptions
	</h1>
	{#await subscriptionsPromise then subscriptions}
		{@const total = subscriptions.reduce((sum, sub) => {
			const amount = Number(sub.amount)
			// Convert to monthly equivalent
			if (sub.frequency === 'day' && sub.frequencyInterval === 7) {
				return sum + amount * 4.33 // Weekly to monthly
			} else if (sub.frequency === 'month' && sub.frequencyInterval === 12) {
				return sum + amount / 12 // Yearly to monthly
			}
			return sum + amount // Already monthly
		}, 0)}
		<p class="pb-8 text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
			${total.toFixed(2)}/mo
		</p>
	{/await}

	<!-- Toolbar Group -->
	<div
		class="sticky top-0 z-200 flex w-full items-center justify-center bg-linear-to-b from-[#F1F1F3] to-transparent pt-2 pb-8 dark:from-neutral-950"
	>
		{#await Promise.all([accountsPromise, tagsPromise]) then [accounts, tags]}
			<ControlStrip onSubmit={handleSubmit} {isSubmitting} {accounts} {tags} />
		{/await}
	</div>

	<!-- Subscriptions List -->
	<div class="w-full max-w-2xl px-6 py-10">
		{#await subscriptionsPromise}
			<p class="text-center text-neutral-500">Loading subscriptions...</p>
		{:then subscriptions}
			{#if subscriptions.length === 0}
				<div class="flex flex-col items-center gap-2 py-20">
					<p class="text-neutral-500">No subscriptions yet.</p>
					<p class="text-sm text-neutral-400">Add your first subscription using the toolbar above.</p>
				</div>
			{:else}
				<div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-6">
					{#each subscriptions as sub (sub.id)}
						<ContextMenu.Root>
							<ContextMenu.Trigger class="col-span-4 grid grid-cols-subgrid">
								{@const isYearly = sub.frequency === 'month' && sub.frequencyInterval === 12}
								<div
									class="col-span-4 grid grid-cols-subgrid border-b border-neutral-300 py-4 dark:border-neutral-700"
									class:group={isYearly}
									transition:fade
								>
									<!-- Row 1: Title, empty, date/status, price -->
									<div class="flex min-w-0 items-baseline gap-1.5">
										<h3 class="truncate font-medium text-neutral-900 dark:text-white">{sub.name}</h3>
										{#if sub.pauseDate}
											<IconPlayerPauseFilled class="shrink-0 text-orange-500" size={16} />
										{:else if sub.endDate}
											<IconTrashFilled class="shrink-0 text-rose-500" size={16} />
										{/if}
									</div>
									<div></div>
									<div class="self-baseline text-right text-sm">
										{#if sub.pauseDate}
											<span class="text-orange-500">Paused</span>
										{:else if sub.endDate}
											<span class="text-rose-500">Cancels {new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
										{:else}
											<span class="text-neutral-500">{new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
										{/if}
									</div>
									<div class="self-baseline text-right">
										{#if isYearly}
											<p class="relative h-6 overflow-hidden tabular-nums font-medium text-neutral-900 dark:text-white">
												<span class="absolute inset-0 transition-all duration-300 ease-out group-hover:translate-y-full group-hover:opacity-0 group-hover:blur-[2px]">
													${Number(sub.amount).toFixed(2)}
												</span>
												<span class="absolute inset-0 -translate-y-full opacity-0 blur-[2px] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none">
													${(Number(sub.amount) / 12).toFixed(2)}
												</span>
											</p>
										{:else}
											<p class="tabular-nums font-medium text-neutral-900 dark:text-white">
												${Number(sub.amount).toFixed(2)}
											</p>
										{/if}
									</div>
									<!-- Row 2: Subtitle, empty, empty, frequency label -->
									<div class="min-w-0">
										{#if sub.company || sub.tag || sub.account}
											<p class="flex items-center gap-1 truncate text-sm text-neutral-500">
												{#if sub.company}{sub.company}{/if}{#if sub.company && (sub.tag || sub.account)} &bull; {/if}{#if sub.tag}{sub.tag}{/if}{#if sub.tag && sub.account} &bull; {/if}{#if sub.account}<IconArrowNarrowRight size={16} class="-mr-0.5 text-neutral-500" />{sub.account}{/if}
											</p>
										{/if}
									</div>
									<div></div>
									<div></div>
									<div class="text-right">
										<p class="relative text-xs text-neutral-400">
											{#if isYearly}
												<span class="inline-block transition-opacity duration-300 group-hover:opacity-0">Yearly</span>
												<span class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">Monthly</span>
											{:else if sub.frequency === 'day' && sub.frequencyInterval === 7}
												Weekly
											{:else}
												Monthly
											{/if}
										</p>
									</div>
								</div>
							</ContextMenu.Trigger>
							<ContextMenu.Content
								class="relative z-40 w-44 rounded-[1.15rem] bg-black p-1 shadow-lg outline-none"
							>
								<ContextMenu.Item class="outline-none" onSelect={() => handlePause(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
									>
										<IconPlayerPause class="text-neutral-200" />
										<p class="px-1.5 font-medium text-neutral-200">Pause</p>
									</div>
								</ContextMenu.Item>
								<ContextMenu.Item class="outline-none" onSelect={() => handleCancel(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
									>
										<IconX class="text-neutral-200" />
										<p class="px-1.5 font-medium text-neutral-200">Cancel</p>
									</div>
								</ContextMenu.Item>
								<ContextMenu.Item class="outline-none" onSelect={() => handleDelete(sub.id)}>
									<div
										class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-rose-500 hover:bg-rose-600/50"
									>
										<IconTrash class="text-rose-500" />
										<p class="px-1.5 font-medium text-rose-500">Delete</p>
									</div>
								</ContextMenu.Item>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{/each}
				</div>
			{/if}
		{:catch error}
			<p class="text-center text-red-500">Error loading subscriptions</p>
		{/await}
	</div>
</div>
