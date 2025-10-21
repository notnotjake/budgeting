<script lang="ts">
	import { createClass } from '@opensky/style'
	import { test } from './test.remote'
	import { z } from 'zod'

	const testSchema = z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long')
	})
</script>

<form {...test.preflight(testSchema)} class="mx-auto flex max-w-lg flex-col gap-2 px-2 py-10">
	<input
		{...test.fields.name.as('text')}
		class={createClass('border-1 rounded-lg border-neutral-300 px-3 py-1')}
	/>
	{#each test.fields.name.issues() as issue}
		<p class="text-neutral-600">{issue.message}</p>
	{/each}

	<button class="rounded-full bg-blue-500 py-3 text-white hover:bg-blue-600">Try Submit</button>
</form>

<button onclick={() => test.validate()}>Validate All</button>

{#if test.result}
	<p>Returned: {test.result.message}</p>
{/if}

{#each test.fields.allIssues() as issue}
	<p class="text-neutral-600">{issue.message}</p>
{/each}
