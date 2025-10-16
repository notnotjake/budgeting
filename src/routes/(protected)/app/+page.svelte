<script>
	import { logout } from '$lib/remotes/auth.remote'
	import { Button } from '$ui/input'
</script>

<h1>App dashboard</h1>

<form {...logout}>
	<Button style="outline" type="submit">Logout</Button>
</form>
