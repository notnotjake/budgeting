<script lang="ts">
	import { logout } from '$remotes/auth/authenticate.remote'
	import { Button } from '$ui/input'

	let { data } = $props()

	$inspect(data.test)
</script>

<div class="flex h-screen w-full flex-col items-center p-1">
	<div class="flex h-full w-full flex-col items-center justify-center gap-2">
		<h1 class="text-2xl font-semibold text-neutral-500">Welcome back</h1>

		<form {...logout}>
			<Button style="outline" type="submit">Logout</Button>
		</form>
	</div>
</div>
