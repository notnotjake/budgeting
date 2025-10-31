<script lang="ts">
	import { getContext, setContext, onMount } from 'svelte'

	import {
		IconX,
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconChevronRight,
		IconCheck,
		IconDotsVertical,
		IconTrashFilled,
		IconArrowBackUp,
		IconUserCircle,
		IconLogout,
		IconCircleChevronUpFilled
	} from '@tabler/icons-svelte'
	import { slide } from 'svelte/transition'
	import { createClass } from '@opensky/style'
	import { delay } from '$utils/timing'

	import { AdaptFit } from '$ui/adapt'

	let editingName = $state(false)
	let name = $state('Curious Panda')
	let editNameField = $state<HTMLInputElement>()

	let settingsOpen = $state(true)

	$effect(() => {
		settingsOpen = getContext('settings-visible')
	})

	setContext('settings-visible', settingsOpen)
</script>

<!-- Overscroll Top -->
<div class="fixed top-0 -z-2 h-[300px] w-full -translate-y-[299px] bg-neutral-950"></div>

{#if settingsOpen}
	<div class="flex min-h-screen w-full justify-center bg-neutral-100">
		<div class="relative w-xl">
			<div
				transition:slide={{ axis: 'y', duration: 400 }}
				class="max-h-152 min-h-50 w-full overflow-y-scroll rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg"
			>
				<div class="min-h-50 w-full p-5 pt-3">
					<div class="flex w-full items-center justify-between">
						<button
							onclick={() => (settingsOpen = false)}
							class="flex items-center gap-1 rounded-full bg-linear-to-b from-[#212121] to-neutral-900 px-4 py-1.5 pl-1.5 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]"
						>
							<IconCircleChevronUpFilled size={21} />
							<p class="font-[450]">Done</p>
						</button>

						<button
							class="flex items-center gap-1 rounded-full bg-linear-to-b from-[#212121] to-neutral-900 px-4 py-1.5 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2),inset_-0.5px_-0.5px_0_rgba(255,255,255,0.1)]"
						>
							<IconLogout size={21} />
							<p class="font-[450]">Logout</p>
						</button>
					</div>

					<div class="flex flex-col gap-4 pb-4">
						<div class="flex w-full flex-col items-center gap-2 pb-5">
							<div class="h-20 w-20 rounded-full bg-linear-to-b from-green-500 to-green-600"></div>
							<AdaptFit
								class={createClass(
									'group flex w-fit cursor-pointer gap-[0.15rem] rounded-2xl bg-neutral-800/70 whitespace-nowrap',
									editingName ? 'rounded-4xl' : 'rounded-2xl'
								)}
							>
								{#if !editingName}
									<button
										onclick={async () => {
											editingName = true
											await delay(300)
											editNameField?.focus()
										}}
										class="h-fit w-fit px-4 py-2 transition-all active:scale-95"
									>
										{name}
									</button>
								{:else}
									<div class="flex w-fit items-center gap-2 px-3">
										<div
											class="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600"
										>
											<IconArrowBackUp class="text-neutral-300" />
										</div>
										<div class="flex flex-col items-center justify-center py-2">
											<p class="text-[0.9rem] text-neutral-500">Edit Name</p>
											<input
												bind:value={name}
												bind:this={editNameField}
												type="text"
												class="border-none text-center outline-none"
											/>
										</div>
										<button
											onclick={() => (editingName = false)}
											class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-blue-vibrant to-sky-500 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
										>
											<IconCheck />
										</button>
									</div>
								{/if}
							</AdaptFit>
						</div>

						<div class="flex w-full items-center justify-center"></div>

						<div class="flex w-full items-baseline gap-2">
							<p class="text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">
								Account Settings
							</p>
							<!-- <div class="h-px w-full bg-neutral-500/30"></div> -->
						</div>

						<div class="flex items-center gap-2">
							<div class="flex w-7 justify-start">
								<IconUserCircle class="text-neutral-500" size={24} />
							</div>
							<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Login Method</h2>
							<p class="text-neutral-400">jake@notnotjake.com</p>
							<div class="flex grow justify-end">
								<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
							</div>
						</div>

						<div class="h-px w-full bg-neutral-500/30"></div>

						<div class="flex items-center gap-2">
							<div class="flex w-7 justify-start">
								<IconKeyFilled class="text-neutral-500" size={24} />
							</div>
							<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Passkeys</h2>
							<p class="text-neutral-400">2 Passkeys</p>
							<div class="flex grow justify-end">
								<IconChevronRight />
							</div>
						</div>

						<div class="h-px w-full bg-neutral-500/30"></div>

						<div class="flex items-center gap-2">
							<div class="flex w-7 justify-start">
								<IconDeviceIpadHorizontalPin class="text-neutral-500" size={24} />
							</div>
							<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Sessions</h2>
							<p class="text-neutral-400">Signed in 3 places</p>
							<div class="flex grow justify-end">
								<IconChevronRight />
							</div>
						</div>

						<div class="h-px w-full bg-neutral-500/30"></div>

						<div class="flex items-center gap-2">
							<div class="flex w-7 justify-start">
								<IconTrashFilled class="text-neutral-500" size={24} />
							</div>
							<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">
								Delte Account
							</h2>
							<div class="flex grow justify-end">
								<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
							</div>
						</div>
					</div>
				</div>

				<div class="h-full w-full p-3">
					<div
						class="min-h-40 w-full rounded-3xl bg-[#212121] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.09),inset_0_-1px_4px_rgba(255,255,255,0.03)]"
					>
						<div class="flex flex-col gap-4">
							<div class="flex w-full flex-col gap-4 px-4 pt-4">
								<div class="flex items-center justify-between">
									<p class="text-xl font-semibold">Passkeys</p>

									<div class="flex items-center gap-3">
										<div>
											<button class="h-9 rounded-full bg-neutral-600 px-3 py-1">Add Passkey</button>
										</div>
										<div
											class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-blue-vibrant to-sky-500 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
										>
											<IconCheck />
										</div>
									</div>
								</div>

								<div class="h-px w-full bg-neutral-500/30"></div>
							</div>

							<div class="flex flex-col px-2 pb-4">
								<div
									class="flex items-center justify-between rounded-2xl px-2 py-4 transition-all hover:bg-neutral-700 hover:px-3"
								>
									<div class="flex items-baseline gap-2">
										<p class="text-[1.08rem] font-medium">1Password</p>
										<p class="text-[0.95rem] text-neutral-300">Added 1mo ago</p>
									</div>
									<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
								</div>

								<div
									class="flex items-center justify-between rounded-2xl px-2 py-4 transition-all hover:bg-neutral-700 hover:px-3"
								>
									<div class="flex items-baseline gap-2">
										<p class="text-[1.08rem] font-medium">Chrome</p>
										<p class="text-[0.95rem] text-neutral-300">Added 3mo ago</p>
									</div>
									<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.shadow-card {
		box-shadow:
			rgba(0, 0, 0, 0.07) 0px 0.602187px 0.602187px -1.166667px,
			rgba(0, 0, 0, 0.063) 0px 2.288533px 2.288533px -2.333333px,
			rgba(0, 0, 0, 0.03) 0px 10px 10px -3.5px;
	}
</style>
