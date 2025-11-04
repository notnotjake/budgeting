<script lang="ts">
	import { setContext } from 'svelte'
	import { Dialog, Accordion } from 'bits-ui'
	import { createClass } from '@opensky/style'
	import { slide } from 'svelte/transition'
	import Title from './components/title.svelte'
	import Content from './settings-content.svelte'

	let accordionValue = $state('')
	setContext('accordion-value', () => accordionValue)
</script>

<Dialog.Content forceMount>
	{#snippet child({ props, open })}
		{#if open}
			<div class="absolute inset-0 z-100 flex h-screen w-full justify-center">
				<div
					{...props}
					in:slide={{ axis: 'y', delay: 300, duration: 400 }}
					out:slide={{ axis: 'y', duration: 300 }}
					class={createClass(
						'relative h-fit max-h-152 min-h-52 w-xl overflow-y-scroll rounded-b-4xl bg-neutral-950 text-neutral-100 shadow-lg transition-all duration-200 ease-out outline-none',
						'w-xl data-nested-open:w-[calc(var(--container-xl)-3.5rem)]',
						'mt-0  data-nested-open:mt-5',
						'rounded-t-none data-nested-open:rounded-t-4xl'
					)}
				>
					<div class="sticky top-0 z-10 h-fit w-full">
						<Title />
					</div>

					<div class="w-full px-3 pb-8">
						<Accordion.Root type="single" bind:value={accordionValue}>
							<Content />
						</Accordion.Root>
					</div>
				</div>
			</div>
		{/if}
	{/snippet}
</Dialog.Content>
