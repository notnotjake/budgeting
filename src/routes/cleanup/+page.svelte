<script>
	import { cleanupChallenges, cleanupSessions } from './cleanup.remote'
</script>

<div class="flex flex-col gap-3 p-10">
	<button
		class="w-fit rounded-full bg-neutral-200 px-4 py-2"
		onclick={async () => {
			await cleanupChallenges()
		}}>Cleanup Challenges</button
	>

	<button
		class="w-fit rounded-full bg-neutral-200 px-4 py-2"
		onclick={async () => {
			await cleanupSessions()
		}}>Cleanup Sessions</button
	>
</div>
