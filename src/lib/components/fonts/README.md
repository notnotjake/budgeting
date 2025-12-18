# Fonts

To add a new font:

1. Create `{name}.css` with the `@font-face` rule:

```css
@font-face {
	font-family: '{Name}';
	src: url('/{font_file}.woff2') format('woff2');
}
```

2. Create `{name}.svelte` that imports the CSS and conditionally renders preload:

```svelte
<script lang="ts">
	import './{name}.css'
	import Preload from './preload.svelte'

	type Props = { preload?: boolean }
	let { preload = true }: Props = $props()
</script>

{#if preload}
	<Preload href="/{font_file}.woff2" />
{/if}
```

3. Add to `index.ts`:

```ts
export { default as {Name} } from './{name}.svelte'

// and add to the Font namespace object:
import {Name} from './{name}.svelte'

export const Font = {
	// ...existing
	{Name}
}
```

To use the newly added font:

```svelte
<script>
	import { Runde } from '$ui/fonts'
</script>

<Runde /><p class="font-[Runde]">Text</p>
```
