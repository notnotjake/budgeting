<script lang="ts">
	import { getSubscriptions, createSubscription } from '$remotes/subscriptions.remote'
	import { fade } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import ControlStrip from './control-strip.svelte'

	let isSubmitting = $state(false)
	let subscriptionsPromise = $state(getSubscriptions())

	async function handleSubmit(data: {
		name: string
		company: string | undefined
		amount: number
		dueDate: string
		frequency: 'day' | 'month'
	}) {
		isSubmitting = true
		try {
			await createSubscription(data)
			// Refresh subscriptions list
			subscriptionsPromise = getSubscriptions()
		} catch (e) {
			console.error('Failed to create subscription', e)
			alert('Failed to create subscription')
		} finally {
			isSubmitting = false
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
				'pt-18 pb-8 text-center text-xl text-black transition-all duration-150 dark:text-white'
			)}
		>
			Subscriptions
		</h1>

		<!-- Toolbar Group -->
		<div
			class="sticky top-0 z-200 flex w-full items-center justify-center bg-linear-to-b from-[#F1F1F3] to-transparent pt-2 pb-8 dark:from-neutral-950"
		>
			<ControlStrip onSubmit={handleSubmit} {isSubmitting} />
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
							<div
								class="flex items-center justify-between rounded-xl bg-white/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm dark:bg-neutral-900/80"
								transition:fade
							>
								<div>
									<h3 class="font-semibold text-neutral-900 dark:text-white">{sub.name}</h3>
									{#if sub.company}
										<p class="text-sm text-neutral-500">{sub.company}</p>
									{/if}
								</div>
								<div class="text-right">
									<p class="font-medium text-neutral-900 dark:text-white">
										${Number(sub.amount).toFixed(2)}
									</p>
									<p class="text-xs text-neutral-500">
										/{sub.frequency} &bull; Due {new Date(sub.dueDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:catch error}
				<p class="text-center text-red-500">Error loading subscriptions</p>
			{/await}
		</div>
	</div>
</div>
