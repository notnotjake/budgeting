<script lang="ts">
	import { createClass } from '@opensky/style'
	import { test } from './test.remote'
	import { z } from 'zod'
	import { createValidation } from './validation.svelte'

	const testSchema = z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long'),
		// age: z.coerce.number().min(18, 'Must be 18 or older')
		address: z.object({
			state: z.string()
		})
	})

	const valid = createValidation(test)
</script>

<form
	{...test.preflight(testSchema).enhance(async ({ form, submit, data }) => {
		try {
			await submit()

			if (test?.result) {
				console.log('success')
				form.reset()
			} else {
				// await validateAll()
				await valid.updateIssues()
			}
		} catch {
			await valid.validateAll()
			// await validateAll()
			console.log('error')
		}
	})}
	class="mx-auto flex max-w-lg flex-col gap-2 px-2 py-10"
>
	<input
		{...test.fields.name.as('text')}
		{...valid.fields('name')}
		class={createClass(
			'border-1 rounded-lg border-neutral-300 px-3 py-1',
			valid.issues('name') ? 'border-rose-500' : 'border-neutral-300'
		)}
	/>
	{#if valid.issues('name')}
		{#each valid.issues('name') as issue}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.name.issues() as issue}
		<p class="text-neutral-400">{issue.message}</p>
	{/each}

	<input
		{...test.fields.address.state.as('text')}
		{...valid.fields('address.state')}
		class={createClass(
			'border-1 rounded-lg border-neutral-300 px-3 py-1',
			valid.issues('address.state') ? 'border-rose-500' : 'border-neutral-300'
		)}
	/>
	{#if valid.issues('address.state')}
		{#each valid.issues('address.state') as issue}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.address.state.issues() as issue}
		<p class="text-neutral-400">{issue.message}</p>
	{/each}

	<!-- <input
		{...test.fields.age.as('text')}
		{...validate('age')}
		class={createClass(
			'border-1 rounded-lg border-neutral-300 px-3 py-1',
			showIssues('age') ? 'border-rose-500' : 'border-neutral-300'
		)}
	/>
	{#if showIssues('age')}
		{#each showIssues('age') as issue}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.age.issues() as issue}
		<p class="text-neutral-400">{issue.message}</p>
	{/each} -->

	<button
		class="rounded-full bg-blue-500 py-3 text-white hover:bg-blue-600"
		onmouseenter={() => {
			valid.validateAll()
		}}>Try Submit</button
	>
</form>

<button onclick={() => valid.validateAll()}>Validate All</button>
<button onclick={() => valid.resetIssues()}>Reset</button>

{#if test.result}
	<p>Returned: {test.result.message}</p>
{/if}

{#each test.fields.allIssues() ?? [] as issue}
	<p class="text-neutral-600">{issue.message}</p>
{/each}
