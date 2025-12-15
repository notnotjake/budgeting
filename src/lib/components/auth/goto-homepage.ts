import { goto } from '$app/navigation'
import { resolve } from '$app/paths'

export const handleGotoHomepage = async (duration: number) => {
	const expiresAt = new Date(Date.now() + duration)
	document.cookie = `homepageIntent=true; expires=${expiresAt.toUTCString()}; path=/`
	goto(resolve('/'))
}
