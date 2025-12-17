<script lang="ts">
	import { RadioGroup } from 'bits-ui'
	import Button from '$ui/input/button.svelte'
	import { createClass } from '@opensky/style'
	import { createFonts, LoadFonts, url } from '$utils/fonts'

	let { data } = $props()

	const Fonts = createFonts()

	Fonts.Face('Runde', {
		src: url('/open-runde-bold.woff2'),
		preload: true
	})

	let selectedPlan = $state<'monthly' | 'yearly'>('yearly')
</script>

<LoadFonts {Fonts} />

<div
	class="relative flex h-full min-h-full w-full flex-col items-center justify-center bg-black px-7 py-5 text-center"
>
	<div class="relative flex min-h-full w-full items-center justify-center">
		<div class="flex w-full max-w-md flex-col items-center gap-6">
			<!-- Header text above card -->
			<div class="flex flex-col items-center gap-1">
				<h1 class="text-3xl font-bold text-white">Choose a plan</h1>
				<p class="text-lg text-neutral-400">Every feature for your entire team</p>
			</div>

			<!-- Main card -->
			<div
				class="flex w-full flex-col items-center gap-2 rounded-3xl bg-neutral-900 px-8 py-8 text-neutral-100 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
			>
				<!-- Discount Copy -->
				<p class="mb-2 w-full py-3 text-center text-[1.1rem] tracking-tight-sm text-white/80">
					<span class="font-semibold text-blue-vibrant-light">Save 15%</span> on a yearly subscription
				</p>

				<!-- Options -->
				<RadioGroup.Root
					bind:value={selectedPlan}
					class="flex w-full justify-center gap-4 px-4 py-2"
				>
					<RadioGroup.Item value="monthly">
						{#snippet children({ checked })}
							<div
								class={createClass(
									'flex grow flex-col items-end justify-end rounded-3xl bg-white/80 px-5 py-3 shadow-lg',
									checked ? 'bg-white/80' : 'bg-white/50',
									checked && 'outline-3 outline-offset-2 outline-white'
								)}
							>
								<div class="opacity-30">
									<p class="font-[Runde] text-4xl font-bold text-black">$29.99</p>
								</div>

								<div class="flex justify-between">
									<p
										class={createClass(
											'text-lg font-semibold tracking-tight-lg',
											checked ? 'text-black' : 'text-white/70'
										)}
									>
										$29.99/month
									</p>
								</div>
							</div>
						{/snippet}
					</RadioGroup.Item>

					<RadioGroup.Item value="yearly">
						{#snippet children({ checked })}
							<div
								class={createClass(
									'flex grow flex-col items-end justify-end rounded-3xl px-5 py-3 shadow-lg',
									checked ? 'bg-white/80' : 'bg-white/50',
									checked && 'outline-3 outline-offset-2 outline-white'
								)}
							>
								<div class="opacity-30">
									<p class="font-[Runde] text-4xl font-bold text-black">$300</p>
								</div>

								<div class="flex w-full items-baseline justify-end gap-1">
									<p class="text-lg font-semibold tracking-tight-md text-neutral-400 line-through">
										$360
									</p>
									<p
										class={createClass(
											'text-lg font-semibold tracking-tight-lg',
											checked ? 'text-black' : 'text-white/70'
										)}
									>
										$300/year
									</p>
								</div>
							</div>
						{/snippet}
					</RadioGroup.Item>
				</RadioGroup.Root>

				<!-- Call to action -->
				<div class="flex h-fit w-full flex-col items-center pt-10">
					<p class="leading-5 font-medium tracking-tight-md text-neutral-200">
						No payment due today
					</p>
					<p class="leading-5 font-medium tracking-tight-sm text-neutral-400/80">
						1-month free trial, then ${selectedPlan === 'monthly'
							? '29.99 per month'
							: '300 per year'}
					</p>
					<p
						class="mt-3 rounded-full bg-white px-8 py-3 text-lg leading-5 font-semibold tracking-tight-sm text-black"
					>
						Try it for $0
					</p>
				</div>
			</div>

			<!-- Done button -->
			<div>
				<Button
					href="/app"
					style="ghost"
					class="bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
				>
					Skip
				</Button>
			</div>
		</div>
	</div>
</div>
