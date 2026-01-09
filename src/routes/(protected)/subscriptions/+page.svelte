<script lang="ts">
	import {
		getSubscriptions,
		getAccounts,
		createSubscription,
		deleteSubscription,
		pauseSubscription,
		cancelSubscription
	} from '$remotes/subscriptions.remote'
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { ContextMenu } from 'bits-ui'
	import { IconTrash, IconPlayerPause, IconX } from '@tabler/icons-svelte'
	import ControlStrip from './control-strip.svelte'

	let isSubmitting = $state(false)
	let subscriptionsPromise = $state(getSubscriptions())
	let accountsPromise = $state(getAccounts())

	async function handleSubmit(data: {
		name: string
		company: string | undefined
		account: string | undefined
		amount: number
		dueDate: string
		frequency: 'day' | 'month'
		frequencyInterval: number
	}) {
		isSubmitting = true
		try {
			await createSubscription(data)
			// Refresh subscriptions and accounts lists
			subscriptionsPromise = getSubscriptions()
			accountsPromise = getAccounts()
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

<!-- Overscroll Top -->
<div class="overscroll-top bg-[#F1F1F3] dark:bg-neutral-950"></div>

<!-- Overscroll Bottom -->
<div class="overscroll-bottom bg-[#EDEBED] dark:bg-neutral-950"></div>

<div
	class="min-h-screen w-full bg-linear-to-b from-[#F1F1F3] to-[#EDEBED] dark:bg-neutral-950 dark:from-neutral-950 dark:to-neutral-950"
>
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
			{#await accountsPromise then accounts}
				<ControlStrip onSubmit={handleSubmit} {isSubmitting} {accounts} />
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
					<div class="grid gap-4">
						{#each subscriptions as sub (sub.id)}
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									<div
										class="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl bg-white/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:bg-neutral-900/80"
										transition:fade
									>
										<div>
											<h3 class="font-semibold text-neutral-900 dark:text-white">{sub.name}</h3>
											{#if sub.company}
												<p class="text-sm text-neutral-500">{sub.company}</p>
											{/if}
										</div>
										<div class="text-right">
											{#if sub.account}
												<p class="text-sm font-medium text-cyan-600 dark:text-cyan-400">{sub.account}</p>
											{/if}
										</div>
										<div class="text-right">
											<p class="font-medium text-neutral-900 dark:text-white">
												${Number(sub.amount).toFixed(2)}
											</p>
											<p class="text-xs text-neutral-500">
												{sub.frequency === 'day' && sub.frequencyInterval === 7
													? 'Weekly'
													: sub.frequency === 'month' && sub.frequencyInterval === 12
														? 'Yearly'
														: 'Monthly'} &bull; Due {new Date(sub.dueDate).toLocaleDateString()}
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
</div>
