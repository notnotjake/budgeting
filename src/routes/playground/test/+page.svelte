<script lang="ts">
	import { test } from './test.remote'
	import { z } from 'zod'

	const testSchema = z.object({
		age: z.number().min(18, 'Must be 18 or older')
	})

	$inspect(test.fields.allIssues())
</script>

<form {...test.preflight(testSchema)} oninput={() => test.validate()}>
	<input {...test.fields.age.as('number')} class="m-5 rounded-md border-1 border-neutral-300" />

	{#each test.fields.age.issues() as issue}
		<p>{issue.message}</p>
	{/each}

	{#each test.fields.allIssues() as issue}
		<p class="text-neutral-500">{issue.message}</p>
	{/each}

	<button>Submit</button>
</form>

<button
	onclick={() => {
		test.validate()
	}}
>
	Validate
</button>
