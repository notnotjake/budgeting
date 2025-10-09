<script lang="ts">
	import { getNotes, createNote } from './notes.remote'
</script>

<div class="flex flex-col items-center bg-neutral-100 pt-6 pb-4">
	<h1 class="text-lg font-medium">New Note:</h1>

	<form
		{...createNote.enhance(async ({ form, data, submit }) => {
			try {
				await submit().updates(getNotes())
				form.reset()
			} catch (error) {
				console.log(error)
			}
		})}
		class="w-lg px-2"
	>
		<label>
			<h2 class="px-2 font-medium text-neutral-800">Title</h2>
			<input name="title" class="w-full rounded-lg bg-neutral-200 px-2 py-2" />
		</label>

		<label>
			<h2 class="px-2 font-medium text-neutral-800">Write your note</h2>
			<textarea name="body" class="w-full rounded-lg bg-neutral-200 px-2 py-2"></textarea>
		</label>

		<div class="flex w-full justify-end">
			<button class="rounded-full bg-blue-500 px-3 py-1 font-medium text-white">Save</button>
		</div>
	</form>

	<div>
		{#if createNote.result?.success}
			<p>Successfully Saved!</p>
		{/if}
	</div>
</div>

<div class="mx-auto w-lg py-10">
	<h1 class="pb-4 text-lg">Recent Notes</h1>

	<svelte:boundary>
		{#snippet pending()}
			<p>Loading...</p>
		{/snippet}

		<ul class="flex flex-col gap-5">
			{#each await getNotes() as { title, body }}
				<li>
					<h3 class="font-medium">{title}</h3>
					<p class="text-neutral-500">{body}</p>
				</li>
			{/each}
		</ul>
	</svelte:boundary>
</div>
