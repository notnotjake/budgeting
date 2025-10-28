<script lang="ts">
	import { logout } from '$remotes/auth/authenticate.remote'
	import { Button } from '$ui/input'

	import AccountButton from '$ui/account-button.svelte'

	let { data } = $props()

	$inspect(data.test)

	const user = {
		email: 'test@test.com',
		name: 'Curious Panda'
	}
</script>

<div class="w-full h-screen flex flex-col items-center p-1">
	<AccountButton {user} />

	<div class="w-full h-full debug flex flex-col gap-2 items-center justify-center">
		<h1 class="text-2xl font-semibold text-neutral-500">Welcome back</h1>

		<form {...logout}>
			<Button style="outline" type="submit">Logout</Button>
		</form>
	</div>
</div>
