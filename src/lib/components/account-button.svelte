<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte'
	import { logout } from '$remotes/auth/authenticate.remote'

	import { createClass } from '@opensky/style'
	import { fade } from 'svelte/transition'
	import { createSequence } from '$lib/utils/timing'
	import { IconSettings, IconDots, IconLogout } from '@tabler/icons-svelte'

	import { Adapt } from '$ui/adapt'
	import { DropdownMenu } from 'bits-ui'
	import Button from '$ui/input/button.svelte'

	let { user } = $props()

	let isActive = $state(false)
	let swapData = $state<string | undefined>()

	const sequence = createSequence({ interruptible: true})

	sequence
		.at(0, () => {
			isActive = true
			swapData = 'initial'
		})
		.add(2000, () => {
			swapData = 'welcome'
		})
		.add(3000, () => {
			isActive = false
			swapData = null
		})

	onMount(() => {
		sequence.run()
	})

	onDestroy(() => {
		sequence.stop()
	})

	let showingMenu = $state<boolean>(false)

	let menuOpen = $state(false)

	let openToast = $state(null)
	let closeToast = $state(null)

	const handleLogout = () => {
		console.log('will need to call form submit')
	}
</script>

<DropdownMenu.Root bind:open={menuOpen}>
	<DropdownMenu.Trigger class="outline-none">
		<div
			class={createClass(
				'flex items-center justify-center gap-2 rounded-[3rem] transition-all duration-200',
				isActive ? 'bg-neutral-900 shadow-md' : 'bg-neutral-100'
			)}
		>
			<Adapt.Swap bind:isActive bind:swapData class="flex items-center" adaptSize={true}>
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
		class="	w-50 rounded-xl bg-neutral-900 p-1.5 shadow-lg outline-none"
		sideOffset={8}
		collisionPadding={8}
	>
		<DropdownMenu.Item class="outline-none">
			<Button resetStyles href="/settings" class="w-full">
				<div
					class="flex cursor-pointer gap-2 rounded-md px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
				>
					<IconSettings color="var(--color-neutral-200)" />
					<p class="px-1.5 font-medium text-neutral-200">Settings</p>
				</div>
			</Button>
		</DropdownMenu.Item>
		<DropdownMenu.Separator class="bg-neutral-600" />
		<DropdownMenu.Item onSelect={handleLogout} class="outline-none">
			<div
				class="flex cursor-pointer gap-2 rounded-md px-2 py-1.5 pr-3 text-white hover:bg-neutral-600/80"
			>
				<IconLogout color="var(--color-neutral-200)" />
				<p class="px-1.5 font-medium text-neutral-200">Logout</p>
			</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
