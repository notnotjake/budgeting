<script lang="ts">
	import { logout } from '$remotes/auth/authenticate.remote'
	import { Button } from '$ui/input'

	let { data } = $props()

	$inspect(data.test)
</script>

<h1>App dashboard</h1>

<form {...logout}>
	<Button style="outline" type="submit">Logout</Button>
</form>
