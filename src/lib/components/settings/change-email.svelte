<script lang="ts">
	import { goto } from '$app/navigation'
	import {
		IconUserCircle,
		IconCircle,
		IconCircleCheckFilled,
		IconAlertTriangleFilled
	} from '@tabler/icons-svelte'
	import { scale } from 'svelte/transition'
	import { AdaptSwap, AdaptFit } from '$ui/adapt'
	import { SuspenseText } from '$ui/feedback'
	import { createClass } from '@opensky/style'

	let { open = $bindable() } = $props()

	const handleCancel = () => {
		open = false
	}

	const currentEmail = 'jake@notnotjake.com'
	let emailValue = $state('jake@notnotjake.com')

	let emailDiff = $derived(emailValue !== currentEmail)
</script>

<div class="flex w-full flex-col justify-center p-3 text-neutral-200">
	<div class="flex w-full flex-col px-5 pt-7 pb-12">
		<!-- Heading -->
		<div class="mb-8 flex flex-col">
			<IconUserCircle size={35} class="mb-2 text-sky-500" />
			<h2 class="text-[1.2rem] font-semibold">Login Method</h2>
			<p class="text-[1.05rem] text-neutral-300">Change how you login to your account</p>
		</div>

		<div class="w-full py-1">
			<div
				class="group w-full rounded-2xl bg-neutral-800/70 px-5 py-3 focus-within:outline-2 focus-within:outline-blue-500"
			>
				<input type="text" bind:value={emailValue} class="border-none font-medium outline-none" />
				<button
					class={createClass(
						'rounded-full bg-linear-to-b px-3 py-2 text-[1.05rem] transition-all active:scale-[0.97]',
						emailDiff
							? 'from-blue-500 to-sky-500 text-white shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.4),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.2)]'
							: 'from-[#212121] to-neutral-900 text-neutral-300 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]'
					)}>Change</button
				>
			</div>
		</div>
	</div>

	<!-- Buttons -->
	<div class="flex flex-col gap-2">
		<button
			onclick={handleCancel}
			class="rounded-full bg-neutral-500 py-4 text-[1.05rem] font-semibold text-white transition-transform active:scale-[0.97]"
			>Cancel</button
		>
	</div>
</div>
