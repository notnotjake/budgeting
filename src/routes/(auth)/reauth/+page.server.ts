import type { ServerLoad } from '@sveltejs/kit'
import Auth from '$lib/server/auth'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireAuthenticatedUser(event)

	return
}
