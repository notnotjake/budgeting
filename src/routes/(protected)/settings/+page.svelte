<script lang="ts">
	import {
		IconX,
		IconKeyFilled,
		IconDeviceIpadHorizontalPin,
		IconChevronRight,
		IconCheck,
		IconDotsVertical,
		IconTrashFilled
	} from '@tabler/icons-svelte'
</script>

<!-- Overscroll Top -->
<div class="fixed top-0 -z-2 h-[300px] w-full -translate-y-[299px] bg-neutral-950"></div>

<div class="flex min-h-screen w-full justify-center bg-neutral-100">
	<div class="relative w-xl">
		<svg class="absolute top-0 -left-5 h-10">
			<path d="M 0 0 Q 20 0 20 20 L 20 0 Z" fill="black" />
		</svg>
		<svg class="absolute top-0 -right-[19px] h-[20px] w-[20px]">
			<path d="M 0 20 Q 0 0 20 0 L 0 0 Z" fill="black" />
		</svg>
		<div class="min-h-50 w-full rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg">
			<div class="min-h-50 w-full p-5 pt-3">
				<div class="flex w-full items-center justify-between">
					<IconX class="text-white" stroke={2.5} />

					<button
						class="rounded-full bg-[#212121] px-3 py-1 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)]"
						>Logout</button
					>
				</div>

				<div class="flex flex-col gap-4 bg-black py-4">
					<div class="flex w-full flex-col items-center gap-2 pb-5">
						<div class="h-20 w-20 rounded-full bg-linear-to-b from-green-500 to-green-600"></div>
						<div class="flex gap-[0.15rem]">
							<div class="h-fit w-fit rounded-l-2xl bg-neutral-800/70 px-4 py-2">
								Johnny Appleseed
							</div>
							<div class="h-fit w-fit rounded-r-2xl bg-sky-500/15 px-4 py-2 text-blue-vibrant">
								jappleseed@gmail.com
							</div>
						</div>
					</div>

					<div class="flex w-full items-baseline gap-2">
						<p class="text-[0.94rem] font-semibold whitespace-nowrap text-neutral-400">
							Account Settings
						</p>
						<div class="h-px w-full bg-neutral-500/30"></div>
					</div>

					<div class="flex items-center gap-2">
						<div class="flex w-8 justify-start">
							<IconKeyFilled class="text-neutral-500" size={28} />
						</div>
						<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Passkeys</h2>
						<p class="text-neutral-300">2 Passkeys</p>
						<div class="flex grow justify-end">
							<IconChevronRight />
						</div>
					</div>

					<div class="h-px w-full bg-neutral-500/30"></div>

					<div class="flex items-center gap-2">
						<div class="flex w-8 justify-start">
							<IconDeviceIpadHorizontalPin class="text-neutral-500" size={28} />
						</div>
						<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Sessions</h2>
						<p class="text-neutral-300">Signed in 3 places</p>
						<div class="flex grow justify-end">
							<IconChevronRight />
						</div>
					</div>

					<div class="h-px w-full bg-neutral-500/30"></div>

					<div class="flex items-center gap-2">
						<div class="flex w-8 justify-start">
							<IconTrashFilled class="text-neutral-500" size={28} />
						</div>
						<h2 class="text-[1.2rem] font-medium tracking-tight text-neutral-50">Delte Account</h2>
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
								class="flex items-center justify-between rounded-2xl px-3 py-4 hover:bg-neutral-700"
							>
								<div class="flex items-baseline gap-2">
									<p class="text-[1.08rem] font-medium">1Password</p>
									<p class="text-[0.95rem] text-neutral-300">Added 1mo ago</p>
								</div>
								<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
							</div>

							<div
								class="flex items-center justify-between rounded-2xl px-3 py-4 hover:bg-neutral-700"
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

<style>
	.shadow-card {
		box-shadow:
			rgba(0, 0, 0, 0.07) 0px 0.602187px 0.602187px -1.166667px,
			rgba(0, 0, 0, 0.063) 0px 2.288533px 2.288533px -2.333333px,
			rgba(0, 0, 0, 0.03) 0px 10px 10px -3.5px;
	}
</style>
