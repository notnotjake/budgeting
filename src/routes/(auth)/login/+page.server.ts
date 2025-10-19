import type { ServerLoad } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import Auth from '$lib/server/auth'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireSession(event)

	// Redirect if already authenticated
	if (event.locals.user) {
		redirect(303, Auth.redirects.afterLogin)
	}
}
