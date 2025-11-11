<script lang="ts">
	import { z } from 'zod'
	import { useSearchParams } from 'runed/kit'

	import { createClass } from '@opensky/style'
	import CodeInput from '$ui/auth/code-input.svelte'
	import PasskeyButton from '$ui/auth/passkey-button.svelte'

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

	const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
</script>

<!-- Gray background gradient -->
<div class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-neutral-400/10"></div>

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
			<!-- Message-->
			<div class="w-full flex-col items-start justify-center px-5 pt-5">
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

			<CodeInput
				codeSent={data.codeSent}
				identifier={data.user?.identifier}
				timezone={localTimezone}
			/>
		</div>
	</div>
</div>
