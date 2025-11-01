<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { goto } from '$app/navigation'
	import { logout } from '$remotes/auth/authenticate.remote'

	import { createClass } from '@opensky/style'
	import { fade } from 'svelte/transition'
	import { createSequence } from '$lib/utils/timing'
	import { IconSettings, IconDots, IconLogout } from '@tabler/icons-svelte'

	import { Adapt } from '$ui/adapt'
	import { DropdownMenu } from 'bits-ui'

	let {
		user,
		settingsShown = $bindable()
	}: { user: { email: string; name: string }; settingsShown: boolean } = $props()

	let swapActive = $state(false)
	let swapData = $state<string | undefined | null>()

	const sequence = createSequence({ interruptible: true })

	sequence
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

	onMount(() => {
		sequence.run()
	})

	onDestroy(() => {
		sequence.stop()
	})

	let menuOpen = $state(false)

	$effect(() => {
		if (menuOpen) {
			sequence.stop()
			swapActive = true
			swapData = 'menu'
		} else {
			swapActive = false
			swapData = null
		}
	})

	const handleLogout = async () => {
		console.log('trying logout')
		try {
			const result = await logout()

			goto(result?.redirectUrl)
		} catch (e) {
			console.error(e)
		}
	}

	const handleSettings = () => {
		console.log('will need to call form submit')
		// goto('/settings')
		settingsShown = true
	}
</script>

<DropdownMenu.Root bind:open={menuOpen}>
	<DropdownMenu.Trigger class="outline-none">
		<div
			class={createClass(
				'flex items-center justify-center gap-2 rounded-[3rem] bg-neutral-100 transition-all duration-200',
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
								<p class="text-[0.93rem] text-neutral-300">{user.email}</p>
							</div>
						{:else if data === 'welcome'}
							<div class="flex items-center justify-center gap-1 px-4 py-2">
								<h3 class="text-[0.95rem] font-medium text-white">Welcome back</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.name}</p>
							</div>
						{:else if data === 'menu'}
							<div class="flex items-center justify-center gap-2 px-4 py-2" in:fade>
								<h3 class="text-[0.95rem] font-medium text-white">{user.name}</h3>
								<p class="text-[0.93rem] text-neutral-300">{user.email}</p>
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
		<DropdownMenu.Item onSelect={handleLogout} class="outline-none">
			<div
				class="flex cursor-pointer gap-2 rounded-[0.9rem] px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconLogout class="text-neutral-200" />
				<p class="px-1.5 font-medium text-neutral-200">Logout</p>
			</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
