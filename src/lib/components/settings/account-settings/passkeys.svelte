<script lang="ts">
	import { getUserPasskeys } from '$remotes/auth/passkey.remote'
	import { IconDotsVertical, IconCirclePlusFilled } from '@tabler/icons-svelte'
	import DialogSubmenu from '$ui/settings/components/dialog-submenu.svelte'
	import AddPasskeyMenu from './add-passkey.svelte'

	let { registerAction }: { registerAction: (fn: () => void) => void } = $props()

	let keys = $state(await getUserPasskeys())

	function relativeTimeString(date: Date): string {
		const now = new Date()

		const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

		// Time intervals in seconds
		const intervals: Record<string, number> = {
			year: 365 * 24 * 60 * 60,
			month: 4 * 7 * 24 * 60 * 60,
			week: 7 * 24 * 60 * 60,
			day: 24 * 60 * 60,
			hour: 60 * 60,
			minute: 60,
			second: 1
		}

		// Check each interval
		for (const [unit, seconds] of Object.entries(intervals)) {
			const interval = Math.floor(secondsAgo / seconds)

			if (interval >= 1) {
				return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`
			}
		}
		return 'Just now'
	}

	const handleClick = () => {
		console.log('clicked')
	}

	const openAddPasskey = () => {
		console.log('TOOD: updade to open passkey dialog')
	}

	registerAction(() => {
		openAddPasskey()
	})
</script>

<div class="flex flex-col pb-3">
	{#each await getUserPasskeys() as passkey (passkey.id)}
		<div class="flex items-baseline justify-between rounded-2xl px-2 py-2 transition-all">
			<div class="flex w-full items-center">
				<p class="grow text-[1.08rem] font-medium">{passkey.name}</p>
				<p class="text-[0.95rem] text-neutral-300">Added {relativeTimeString(passkey.createdAt)}</p>
				<button onclick={handleClick} class="aspect-square rounded-full p-1.5 hover:bg-neutral-500">
					<IconDotsVertical class="text-neutral-300 hover:text-neutral-100" />
				</button>
			</div>
		</div>
	{:else}
		<div class="rounded-4xl flex flex-col items-center py-4">
			<p class="font-semibold tracking-tight-sm text-lg">Secure Your Account</p>
			<p class="max-w-80 tracking-tight-sm text-center text-neutral-300">
				Passkeys are a secure and user-friedly alternative to passwords
			</p>

			<DialogSubmenu>
				{#snippet trigger()}
					<div
						class="flex mt-5 gap-2 bg-linear-to-b from-sky-500 to-sky-500 w-fit rounded-full items-center py-2 pl-2 pr-4 active:scale-95 transition-transform"
					>
						<IconCirclePlusFilled />
						<p class="text-lg font-medium">Add Passkey</p>
					</div>
				{/snippet}

				{#snippet content()}
					<AddPasskeyMenu />
				{/snippet}
			</DialogSubmenu>
		</div>
	{/each}
</div>
