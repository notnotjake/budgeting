<script lang="ts">
	import { z } from 'zod'
	import { useSearchParams } from 'runed/kit'

	import { createClass } from '@opensky/style'
	import CodeInput from '$ui/auth/code-input.svelte'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'
	import { IconLockFilled } from '@tabler/icons-svelte'

	const reauthParams = z.object({
		title: z.string().optional(),
		description: z.string().optional()
	})

	const params = useSearchParams(reauthParams)
	const title = $derived(params.title)
	const description = $derived(params.description)

	params.title = 'Add a Passkey'
	params.description = 'Verify to add a new passkey to your account'

	let { data } = $props()

	let showCodeInput = $state(false)
</script>

<!-- Gray background gradient -->
<div
	transition:fade={{ duration: 200 }}
	class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-neutral-400/10"
></div>

<!-- Container inside the layout -->
<div class="z-10 flex h-full w-full max-w-[29rem] items-center justify-center px-2">
	<!-- Login card container -->
	<div
		class={createClass(
			'relative flex min-h-40 w-full flex-shrink-0 grow flex-col items-center p-2.5 transition-all duration-200',
			'rounded-[1.8rem] bg-white pt-3'
		)}
	>
		<div class="flex h-fit w-full flex-col pb-8">
			<!-- User identifier -->
			<p
				class="flex w-fit items-center gap-1 rounded-full bg-neutral-100 px-4 py-2 font-[450] text-neutral-600"
			>
				<IconLockFilled size={19} class="text-green-700" />
				{data.user?.identifier}
			</p>

			<!-- Message-->
			<div class="w-full flex-col items-start justify-center px-3 pt-5">
				<h2
					class="tracking-tight-md animate-fade-in-scale text-[1.33rem] font-[550] leading-loose text-black"
				>
					{title}
				</h2>
				<p
					class="animate-fade-in-scale text-[1.05rem] font-[430] leading-4 tracking-[-0.015em] text-neutral-500"
				>
					{description}
				</p>
			</div>
		</div>

		<div class="flex w-full flex-col items-center gap-7 pb-3 pt-14">
			{#if data.passkeyAvailable}
				<PasskeyButton />
			{/if}

			{#if data.codeSent || showCodeInput}
				<div class="flex flex-col items-center gap-1">
					<CodeInput />

					<button
						class="mt-2 rounded-full bg-none px-4 py-2 font-[500] text-neutral-600 hover:bg-neutral-100 hover:text-black"
					>
						Resend
					</button>
				</div>
			{/if}

			{#if data.passkeyAvailable && !showCodeInput}
				<button
					onclick={() => {
						showCodeInput = true
					}}
					class="mt-4 rounded-full bg-none px-4 py-2 font-[500] text-neutral-500 hover:bg-neutral-100"
				>
					or <span class="text-neutral-700 hover:text-black">login with email</span>
				</button>
			{/if}
		</div>
	</div>
</div>
