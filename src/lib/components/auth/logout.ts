import { goto } from '$app/navigation'
import { logout } from '$remotes/auth/authenticate.remote'

export const handleLogout = async (error?: boolean) => {
	try {
		error = false
		const res = await logout()

		localStorage.removeItem('lastSeenAt')

		goto(res.redirectUrl)
	} catch {
		error = true
	}
}
