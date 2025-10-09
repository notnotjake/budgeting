<script lang="ts">
	import { getContext } from 'svelte'
	import SidebarButton from '$ui/icon/sidebar-button.svelte'
	import { Tooltip } from 'bits-ui'

	let { children, whenOpen, whenClosed, useButton } = $props()

	let sidebar = getContext('sidebar')

	function toggle() {
		sidebar.isShown = !sidebar.isShown
	}
</script>

{#if whenOpen}
	<button onclick={toggle} class="text-lg font-semibold text-neutral-300">
		{#if sidebar.isShown}
			{@render whenOpen()}
		{/if}
	</button>
{/if}

{#if whenClosed}
	<button onclick={toggle} class="text-lg font-semibold text-neutral-300">
		{#if !sidebar.isShown}
			{@render whenClosed()}
		{/if}
	</button>
{/if}

{#if useButton}
	<div onclick={toggle} aria-role="button" class="text-lg font-semibold text-neutral-300">
		<Tooltip.Provider>
			<Tooltip.Root delayDuration={350}>
				<Tooltip.Trigger>
					<SidebarButton isOpen={sidebar.isShown} colorTint="var(--color-neutral-400)" />
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" sideOffset={5} align="start">
					<div
						class="rounded-xl bg-neutral-900 px-3 py-2 text-[0.9rem] font-semibold text-neutral-50"
					>
						{sidebar.isShown ? 'Close Sidebar' : 'Open Sidebar'}
					</div>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>
{/if}

{#if children}
	{@render children()}
{/if}
