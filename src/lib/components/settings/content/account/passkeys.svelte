<script lang="ts">
	import { getUserPasskeys } from '$remotes/auth/passkey.remote'

	import { DropdownMenu } from 'bits-ui'
	import {
		IconDots,
		IconCirclePlusFilled,
		IconFingerprint,
		IconTrash,
		IconPencil
	} from '@tabler/icons-svelte'
	import AddPasskeyMenu from './add-passkey.svelte'

	let { registerAction }: { registerAction: (fn: () => void) => void } = $props()

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

	let addPasskeyShown = $state(false)

	const openAddPasskey = () => {
		addPasskeyShown = true
	}
	const dismissAddPasskey = () => {
		addPasskeyShown = false
	}

	// svelte-ignore state_referenced_locally
	registerAction(() => {
		openAddPasskey()
	})

	const renamePasskey = async (passkeyId: string) => {
		console.log(passkeyId)
	}

	const deletePasskey = async (passkeyId: string) => {
		console.log(passkeyId)
	}
</script>

<div class="flex flex-col pb-3">
	{#if addPasskeyShown}
		<AddPasskeyMenu close={dismissAddPasskey} />
	{/if}

	{#each await getUserPasskeys() as passkey (passkey.id)}
		<DropdownMenu.Root>
			<div class="flex items-baseline justify-between rounded-2xl py-2 transition-all">
				<div class="flex w-full items-center">
					<div class="flex w-7 justify-start text-neutral-500">
						<IconFingerprint size={22} />
					</div>
					<p class="grow text-[1.08rem] font-medium whitespace-nowrap">{passkey.name}</p>
					<p class="text-[0.95rem] font-[450] whitespace-nowrap text-neutral-300">
						Added {relativeTimeString(passkey.createdAt)}
					</p>
					<DropdownMenu.Trigger
						class="ml-1 aspect-square rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-500 hover:text-neutral-100 active:scale-95"
					>
						<IconDots size={20} />
					</DropdownMenu.Trigger>
				</div>
			</div>

			<DropdownMenu.Content
				class="w-44 rounded-[1.15rem] bg-black p-[0.25rem] shadow-lg outline-none"
				side="left"
				align="center"
				sideOffset={8}
				collisionPadding={8}
			>
				<DropdownMenu.Item onSelect={() => renamePasskey(passkey.id)} class="outline-none">
					<div
						class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
					>
						<IconPencil class="text-neutral-200" />
						<p class="px-1.5 font-medium text-neutral-200">Rename</p>
					</div>
				</DropdownMenu.Item>
				<DropdownMenu.Item onSelect={() => deletePasskey(passkey.id)} class="outline-none">
					<div
						class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-rose-500 hover:bg-rose-600/50"
					>
						<IconTrash class="text-rose-500" />
						<p class="px-1.5 font-medium text-rose-500">Remove</p>
					</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else}
		<div class="rounded-4xl flex flex-col items-center py-4">
			{#if !addPasskeyShown}
				<p class="font-semibold tracking-tight-sm text-lg">Secure Your Account</p>
				<p class="max-w-80 tracking-tight-sm text-center text-neutral-300">
					Passkeys are a secure and user-friedly alternative to passwords
				</p>

				<button
					onclick={openAddPasskey}
					class="flex mt-5 gap-2 bg-linear-to-b from-sky-500 to-sky-500 w-fit rounded-full items-center py-2 pl-2 pr-4 active:scale-95 transition-transform"
				>
					<IconCirclePlusFilled />
					<p class="text-lg font-medium">Add Passkey</p>
				</button>
			{/if}
		</div>
	{/each}
</div>
