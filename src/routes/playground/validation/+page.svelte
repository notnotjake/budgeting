<script lang="ts">
	import { createClass } from '@opensky/style'
	import { test, getPosts } from './test.remote'
	import { z } from 'zod'
	import { createValidation, createEnhancedForm } from '@opensky/remotes'

	const testSchema = z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long'),
		// age: z.coerce.number().min(18, 'Must be 18 or older')
		address: z.object({
			state: z.string()
		})
	})

	const valid = createValidation(test)
	const testForm = createEnhancedForm(test, {
		validation: valid,
		delayMs: 500,
		timeoutMs: 8000
	})

	const posts = $derived(await getPosts())
</script>

<p>{testForm.state}</p>
{#if testForm.result}
	<p>RESULT</p>
{/if}

<p>{posts.posts}</p>

<form
	{...test.preflight(testSchema).enhance(async (opts) =>
		testForm.enhance(opts, {
			onSubmit: ({ data, cancel, updates }) => {
				if (data.name === 'a111') {
					cancel('issues')
					valid.addIssue('name', 'a111 not allowed')
				}

				console.log('submitting')

				updates(
					getPosts().withOverride(() => {
						return { posts: 'Updating!' }
					})
				)
			},
			onDelay: () => {
				console.log('delayed')
			},
			onTimeout: () => {
				console.log('timeout')
			},
			onReturn: ({ data, result }) => {
				// console.log(data)
				console.log('returned')
				// console.log(result)
			}
		})
	)}
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
		{#each valid.issues('name') as issue (issue)}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.name.issues() as issue (issue)}
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
		{#each valid.issues('address.state') as issue (issue)}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.address.state.issues() as issue (issue)}
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
		disabled={testForm.pending || testForm.delayed}
		class="rounded-full bg-blue-500 py-3 text-white hover:bg-blue-600 disabled:bg-neutral-500"
		onmouseenter={() => {
			// valid.validateAll()
		}}
	>
		{testForm.delayed ? 'loading' : 'Try Submit'}
	</button>
</form>

{#if testForm.delayed}
	<p>Loading...</p>
{/if}

{#if testForm.timeout}
	<p>Request Timed Out.</p>
{/if}

<button
	onclick={() => {
		test.fields.name.set('alyx')
		test.fields.address.state.set('Va')
	}}
>
	Fill Form
</button>

<button
	onclick={() => {
		testForm.reset()
	}}
>
	Reset state
</button>

{#if test.result}
	<p>Returned: {test.result.message}</p>
{/if}

{#each test.fields.allIssues() ?? [] as issue (issue.message)}
	<p class="text-neutral-600">{issue.message}</p>
{/each}
