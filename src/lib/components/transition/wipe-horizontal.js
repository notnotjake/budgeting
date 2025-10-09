import { cubicOut } from 'svelte/easing'

export function wipeHorizontal(node, { duration = 300, delay = 0, easing = cubicOut }) {
	const targetWidth = node.offsetWidth
	return {
		duration,
		delay,
		easing,
		css: (t) => `
			width: ${t * targetWidth}px;
			overflow: hidden;
			white-space: nowrap;
			opacity: ${t};
		`
	}
}
