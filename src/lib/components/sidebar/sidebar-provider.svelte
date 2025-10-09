<script lang="ts">
	import { setContext, type Snippet } from 'svelte'
	import { createClass } from '$utils/styles'
	import { Tween } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	type Props = {
		isShown?: boolean
		onChange?: () => void
		children: Snippet
		sidebarContent: Snippet
		class?: string
		minWidth?: number
		maxWidth?: number
		defaultWidth?: number
		resizable?: boolean
		side?: 'left' | 'right'
	}
	let {
		isShown: isShownProp = $bindable(true),
		onChange,
		children,
		sidebarContent,
		class: classProp,
		minWidth = 150,
		maxWidth = 500,
		defaultWidth = 300,
		resizable = true,
		side = 'left'
	}: Props = $props()

	let sidebar = $state({
		isShown: isShownProp
	})
	setContext('sidebar', sidebar)

	// Sizing
	let contentWidth = $state(defaultWidth)
	let sidebarWidthTweened = new Tween(sidebar.isShown ? contentWidth : 0, {
		duration: 350,
		easing: cubicOut
	})
	let beforeResizingWidth = $state(null)

	// Resizing
	let isResizing = $state(false)
	function startResize(event) {
		isResizing = true
		event.preventDefault()
		beforeResizingWidth = contentWidth
	}
	function stopResize() {
		isResizing = false
		beforeResizingWidth = null
	}
	let containerWidth = $state(0)
	function resize(event) {
		if (!isResizing) return

		let x
		if (side == 'left') {
			x = event.pageX
		} else {
			x = containerWidth - event.pageX
		}
		if (x < 25) {
			sidebar.isShown = !sidebar.isShown
			contentWidth = beforeResizingWidth
			stopResize()
			return
		}
		const newWidth = Math.max(minWidth, Math.min(maxWidth, x))
		contentWidth = newWidth
		sidebarWidthTweened.set(newWidth, { duration: 0 })
	}

	// Show/Hide
	$effect(() => {
		if (!isResizing && !sidebar.isShown) {
			sidebarWidthTweened.target = 0
		} else if (!isResizing && sidebar.isShown) {
			sidebarWidthTweened.target = contentWidth
		}
	})
	$effect(() => {
		if (isShownProp) {
			sidebar.isShown = true
		} else if (!isShownProp) {
			sidebar.isShown = false
		}
	})
</script>

<svelte:window on:mouseup={stopResize} />

<div
	class={createClass('flex h-full w-full', side == 'right' ? 'flex-row-reverse' : '', classProp)}
	onmousemove={resize}
	bind:offsetWidth={containerWidth}
>
	<div
		desc="sidebar container"
		style:width={`${sidebarWidthTweened.current}px`}
		class="relative h-full shrink-0 overflow-hidden"
	>
		<div
			desc="sidebar content"
			style:width={`${contentWidth}px`}
			class={createClass(
				'absolute top-0 h-full transition-opacity delay-[25ms] duration-250',
				side == 'left' ? 'left-0' : 'right-0',
				sidebar.isShown ? 'opacity-100' : 'opacity-20'
			)}
		>
			{@render sidebarContent()}
		</div>
		<div
			desc="drag handle"
			class={createClass(
				'absolute top-0 h-full w-[0px] bg-blue-500 transition-all duration-200 has-hover:w-[3px] has-hover:opacity-100',
				!resizable && 'hidden',
				side == 'left' ? 'right-0' : 'left-0',
				isResizing ? 'w-[3px] opacity-100' : 'opacity-0'
			)}
			onmousedown={startResize}
		>
			<div
				class={createClass(
					'absolute top-0 h-full w-2.5 cursor-ew-resize',
					side == 'left' ? 'right-0' : 'left-0'
				)}
			></div>
		</div>
	</div>

	<div class="h-full w-full" desc="main content">
		{@render children()}
	</div>
</div>
