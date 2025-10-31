<script lang="ts">
	import {
		IconTrashFilled,
		IconCircle,
		IconCircleCheckFilled,
		IconAlertTriangleFilled
	} from '@tabler/icons-svelte'
	import { scale } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { AdaptSwap, AdaptFit } from '$ui/adapt'

	type Step = {
		heading: string
		description: string
		acknowledged: boolean
		prominent?: boolean
	}

	const steps = $state<Step[]>([
		{
			heading: 'Your data will be lost',
			description: 'All of your user data will be completely and permanently lost',
			acknowledged: false
		},
		{
			heading: 'Your subscription will be cancelled',
			description:
				'You will immediately lose access to your subsrciption features and you will not be charged again',
			acknowledged: false
		},
		{
			heading: 'Permanently Delete Account',
			description:
				'Are you sure you want to delete your account? This is permanent and irrevocable.',
			acknowledged: false,
			prominent: true
		}
	])

	let currentStep = $state(1)

	function acknowledgeStep() {
		currentStep += 1
		if (currentStep > steps.length) {
			console.log('DELETING')
		}
	}
</script>

<div class="flex w-full justify-center py-10">
	<div
		class="flex w-full max-w-120 flex-col justify-center rounded-[2.5rem] bg-neutral-950 p-3 text-neutral-200 shadow-card"
	>
		<div class="flex flex-col px-5 pt-7 pb-12">
			<!-- Heading -->
			<div class="mb-8 flex flex-col">
				<IconTrashFilled size={35} class="mb-2 text-rose-600" />
				<h2 class="text-[1.2rem] font-semibold">Delete Account</h2>
				<p class="text-[1.05rem] text-neutral-300">Deleting your account is permanent</p>
			</div>

			<AdaptFit>
				<div class="flex flex-col gap-3">
					{#each steps as step, i (step.heading)}
						{#if i < currentStep}
							<div class="flex gap-2" in:scale>
								{#if !step?.prominent}
									<AdaptSwap isActive={currentStep - 1 > i}>
										<div
											out:scale={{ duration: 200, start: 0.5 }}
											class="flex h-7 w-7 shrink-0 items-center justify-center"
										>
											<IconCircle class="shrink-0" />
										</div>

										{#snippet swapContent()}
											<div
												in:scale={{ delay: 225, duration: 200, start: 0.5 }}
												class="flex h-7 w-7 shrink-0 items-center justify-center"
											>
												<IconCircleCheckFilled class="shrink-0" />
											</div>
										{/snippet}
									</AdaptSwap>
								{:else}
									<div class="flex h-7 w-7 shrink-0 items-center justify-center">
										<IconAlertTriangleFilled class="text-rose-600" />
									</div>
								{/if}
								<div>
									<p class="font-medium text-white capitalize">{step.heading}</p>
									<p class="text-neutral-300">
										{step.description}
									</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</AdaptFit>
		</div>

		<!-- Buttons -->
		<div class="flex flex-col gap-2">
			<button
				onclick={acknowledgeStep}
				class="rounded-full bg-linear-to-b from-rose-600 to-rose-500 py-4 text-[1.05rem] text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.4),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.2)] transition-transform active:scale-[0.97]"
			>
				{currentStep >= steps.length ? 'Delete Account' : 'Yes, Continue'}
			</button>
			<button
				class="rounded-full bg-neutral-500 py-4 text-[1.05rem] font-semibold text-white transition-transform active:scale-[0.97]"
				>Cancel</button
			>
		</div>
	</div>
</div>

<style>
	.shadow-card {
		box-shadow:
			rgba(0, 0, 0, 0.07) 0px 0.602187px 0.602187px -1.166667px,
			rgba(0, 0, 0, 0.063) 0px 2.288533px 2.288533px -2.333333px,
			rgba(0, 0, 0, 0.03) 0px 10px 10px -3.5px;
	}
</style>
