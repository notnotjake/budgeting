<script lang="ts">
	import { onMount } from 'svelte'
	import { z } from 'zod'
	import { createValidation, createEnhancedForm } from '@opensky/remotes'
	import { updateUserName, getUser } from '$remotes/auth/user.remote'

	import { createClass } from '@opensky/style'
	import { delay } from '$utils/timing'
	import { IconCheck, IconArrowBackUp } from '@tabler/icons-svelte'
	import { AdaptFit } from '$ui/adapt'

	const updateUserNameSchema = z.object({
		name: z.string().min(3, 'Too Short').max(32, 'Too Long')
	})

	const updateUserNameValid = createValidation(updateUserName)
	const updateUserNameForm = createEnhancedForm(updateUserName, {
		validation: updateUserNameValid,
		delayMs: 300,
		timeoutMs: 9000
	})

	let user = $state(await getUser())

	let editingName = $state(false)
	let editNameField = $state<HTMLInputElement>()

	const reset = () => {
		updateUserName.fields.name.set(user.name)
	}
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
				updateUserName.fields.name.set(user.name)
				await delay(300)
				editNameField?.focus()
			}}
			class="h-fit w-fit px-4 py-2 transition-all active:scale-95"
		>
			{user.name}
		</button>
	{:else}
		<form
			{...updateUserName.preflight(updateUserNameSchema).enhance(async (opts) =>
				updateUserNameForm.enhance(opts, {
					onReturn: ({ result }) => {
						if (result.success) {
							editingName = false
							user.name = result.name
						}
					}
				})
			)}
			class="flex w-fit items-center gap-2 px-3"
		>
			<button
				type="button"
				onclick={reset}
				class="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600 active:scale-95"
			>
				<IconArrowBackUp class="text-neutral-300" />
			</button>
			<div class="flex flex-col items-center justify-center py-2">
				<p
					class={createClass(
						'text-[0.9rem] text-neutral-500',
						(updateUserNameForm.issues ||
							updateUserNameValid.issues('name') ||
							updateUserNameForm.error) &&
							'text-rose-600'
					)}
				>
					{#if updateUserNameValid.issues('name')}
						{updateUserNameValid.issues('name')}
					{:else if updateUserNameForm.error || updateUserNameForm.timeout}
						Something went wrong, try again
					{:else}
						Edit Name
					{/if}
				</p>
				<input
					{...updateUserName.fields.name.as('text')}
					{...updateUserNameValid.fields('name')}
					bind:this={editNameField}
					autocomplete="off"
					class="border-none text-center outline-none"
				/>
			</div>
			<button
				type="submit"
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-blue-vibrant to-sky-500 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
			>
				<IconCheck />
			</button>
		</form>
	{/if}
</AdaptFit>
