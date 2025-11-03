<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { goto } from '$app/navigation'
	import { getUser } from '$remotes/auth/user.remote'
	import { handleLogout } from '$ui/auth/logout'

	import { createClass } from '@opensky/style'
	import { fade } from 'svelte/transition'
	import { createSequence } from '$lib/utils/timing'
	import { IconSettings, IconDots, IconLogout } from '@tabler/icons-svelte'
	import { Adapt } from '$ui/adapt'
	import { DropdownMenu } from 'bits-ui'

	let { settingsShown = $bindable() }: { settingsShown: boolean } = $props()

	let user = $state({
		identifier: 'Error',
		name: 'Error'
	})

	function shouldWelcomeBack() {
		let result = false
		const lastSeenAt = localStorage.getItem('lastSeenAt')

		if (lastSeenAt) {
			const lastSeenTime = parseInt(lastSeenAt)
			const now = Date.now()

			if (now - lastSeenTime > 45 * 60 * 1000) {
				result = true
			}
		} else {
			result = true
		}

		localStorage.setItem('lastSeenAt', Date.now().toString())
		return result
	}

	let swapActive = $state(false)
	let swapData = $state<string | undefined | null>()

	const sequence = createSequence({ interruptible: true })
		.at(0, () => {
			swapActive = true
			swapData = 'initial'
		})
		.add(2000, () => {
			swapData = 'welcome'
		})
		.add(3000, () => {
			swapActive = false
			swapData = null
		})

	onMount(async () => {
		// Get user info
		const res = await getUser()
		user = res

		// Show welcome message if returning after 45 mins
		if (shouldWelcomeBack()) {
			sequence.run()
		}
	})

	onDestroy(() => {
		sequence.stop()
	})

	let menuOpen = $state(false)

	function onOpenChange(open: boolean) {
		console.log(open)
		if (open) {
			menuOpen = true
			sequence.stop()
			swapActive = true
			swapData = 'menu'
		} else {
			menuOpen = false
			swapActive = false
			swapData = null
		}
	}

	const handleSettings = () => {
		settingsShown = true
	}

	const selectLogout = async () => {
		await handleLogout()
	}
</script>

<DropdownMenu.Root {onOpenChange}>
	<DropdownMenu.Trigger class="outline-none">
		<div
			class={createClass(
				'flex items-center justify-center gap-2 rounded-[3rem] bg-neutral-200 transition-all duration-200',
				swapActive && 'bg-neutral-900 shadow-md',
				menuOpen && 'bg-neutral-700'
			)}
		>
			<Adapt.Swap
				bind:isActive={swapActive}
				bind:swapData
				class="flex items-center"
				adaptSize={true}
			>
				{#snippet swapContent(data)}
					<div transition:fade={{ duration: 200 }}>
						{#if data === 'initial'}
							<div class="flex items-center justify-center gap-1 px-4 py-2">
								<h3 class="text-[0.95rem] font-medium text-white">Logged In</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.identifier}</p>
							</div>
						{:else if data === 'welcome'}
							<div class="flex items-center justify-center gap-1 px-4 py-2">
								<h3 class="text-[0.95rem] font-medium text-white">Welcome back</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.name}</p>
							</div>
						{:else if data === 'menu'}
							<div class="flex items-center justify-center gap-2 px-4 py-2" in:fade>
								<h3 class="text-[0.95rem] font-medium text-white">{user.name}</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.identifier}</p>
							</div>
						{/if}
					</div>
				{/snippet}

				<div class="px-2">
					<IconDots color="var(--color-neutral-500)" />
				</div>
			</Adapt.Swap>
		</div>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		class="w-44 rounded-[1.15rem] bg-neutral-900 p-[0.25rem] shadow-lg outline-none"
		sideOffset={8}
		collisionPadding={8}
	>
		<DropdownMenu.Item onSelect={handleSettings} class="outline-none">
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconSettings class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Settings</p>
			</div>
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={selectLogout} class="outline-none">
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconLogout class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Logout</p>
			</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
