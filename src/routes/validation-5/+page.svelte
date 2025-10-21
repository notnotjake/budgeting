<script lang="ts">
	import { createClass } from '@opensky/style'
	import { useDebounce } from 'runed'
	import { test } from './test.remote'
	import { z } from 'zod'

	const testSchema = z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long'),
		age: z.coerce.number().min(18, 'Must be 18 or older')
	})

	type ValidationIssues = {
		[key: string]: string[] | null | ValidationIssues
	}

	let issues = $state<ValidationIssues>({})
	// $inspect(issues)

	function resetIssues() {
		issues = {}
	}

	$inspect(test.fields.name.issues())

	function setNestedValue(obj: ValidationIssues, path: string, value: string[] | null) {
		const keys = path.split('.')

		if (keys.length === 1) {
			obj[path] = value
			return
		}

		const lastKey = keys.pop()!

		let current = obj
		for (const key of keys) {
			if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
				current[key] = {}
			}
			current = current[key]
		}

		current[lastKey] = value
	}

	let allFieldPaths = $state.raw<string[]>([])

	function registerPath(path: string) {
		if (!allFieldPaths.includes(path)) {
			allFieldPaths.push(path)
		}
	}

	async function validateAll() {
		await test.validate({ includeUntouched: true })

		for (const path of allFieldPaths) {
			const keys = path.split('.')
			const field = keys.reduce((current, key) => current?.[key], test.fields)
			const iss = field.issues()?.map((i) => i.message) || null
			setNestedValue(issues, path, iss)
		}
	}

	async function updateIssues() {
		for (const path of allFieldPaths) {
			const keys = path.split('.')
			const field = keys.reduce((current, key) => current?.[key], test.fields)
			const iss = field.issues()?.map((i) => i.message) || null
			setNestedValue(issues, path, iss)
		}
	}

	function showIssues(path: string) {
		const keys = path.split('.')
		const fieldIssues = keys.reduce((current, key) => current?.[key], issues)

		if (fieldIssues && Array.isArray(fieldIssues) && fieldIssues.length > 0) {
			return fieldIssues
		} else {
			return null
		}
	}

	function validate(path: string) {
		registerPath(path)

		const keys = path.split('.')
		const field = keys.reduce((current, key) => current?.[key], test.fields)

		return {
			onblur: async () => {
				// await test.validate({ preflightOnly: true })
				await test.validate()

				const iss = field.issues()?.map((i) => i.message) || null
				setNestedValue(issues, path, iss)

				// if preflight didn't find issues, then we should check against server
				// if (!iss) {
				// 	await test.validate({ includeUntouched: true })
				// 	const iss = field.issues()?.map((i) => i.message) || null
				// 	setNestedValue(issues, path, iss)
				// }
				// this code currently doesnt work for some reason. it may be an issue with sveltekit remotes though
			},
			oninput: async () => {
				const fieldIssues = keys.reduce((current, key) => current?.[key], issues)

				if (fieldIssues && Array.isArray(fieldIssues) && fieldIssues.length > 0) {
					await test.validate({ preflightOnly: true })

					let iss = field.issues()?.map((i) => i.message) || null

					if (iss) {
						await test.validate()
						iss = field.issues()?.map((i) => i.message) || null
					}

					setNestedValue(issues, path, iss)
				}
			}
		}
	}
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
				await updateIssues()
			}
		} catch {
			await validateAll()
			// await validateAll()
			console.log('error')
		}
	})}
	class="mx-auto flex max-w-lg flex-col gap-2 px-2 py-10"
>
	<input
		{...test.fields.name.as('text')}
		{...validate('name')}
		class={createClass(
			'border-1 rounded-lg border-neutral-300 px-3 py-1',
			showIssues('name') ? 'border-rose-500' : 'border-neutral-300'
		)}
	/>
	{#if showIssues('name')}
		{#each showIssues('name') as issue}
			<p class="text-rose-600">{issue}</p>
		{/each}
	{/if}
	{#each test.fields.name.issues() as issue}
		<p class="text-neutral-400">{issue.message}</p>
	{/each}

	<input
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
	{/each}

	<button
		class="rounded-full bg-blue-500 py-3 text-white hover:bg-blue-600"
		onmouseenter={() => {
			validateAll()
		}}>Try Submit</button
	>
</form>

<button onclick={() => validateAll()}>Validate All</button>
<button onclick={() => resetIssues()}>Reset</button>

{#if test.result}
	<p>Returned: {test.result.message}</p>
{/if}
