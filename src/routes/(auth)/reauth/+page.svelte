<script>
	import { logout } from '$lib/remotes/auth.remote'
	import { Button } from '$ui/input'

	let { data } = $props()
</script>

<h1>Reauth</h1>

<p>Reauthenticate for {data.user}</p>
