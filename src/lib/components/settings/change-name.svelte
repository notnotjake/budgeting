<script lang="ts">
	import { createClass } from '@opensky/style'
	import { delay } from '$utils/timing'
	import { IconCheck, IconArrowBackUp } from '@tabler/icons-svelte'
	import { AdaptFit } from '$ui/adapt'

	let editingName = $state(false)
	let name = $state('Curious Panda')
	let editNameField = $state<HTMLInputElement>()
</script>

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
			<div class="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600">
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
