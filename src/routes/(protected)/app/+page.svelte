<script lang="ts">
	import { resolve } from '$app/paths'
	// let { data } = $props()
</script>

<div class="flex h-screen w-full flex-col items-center p-1">
	<div class="flex h-full w-full flex-col items-center justify-center gap-2">
		<h1 class="text-2xl font-semibold text-neutral-500">Welcome back</h1>

		<a href={resolve('/dayticket')}>Dayticket Tool</a>
	</div>
</div>
