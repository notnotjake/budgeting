import type { ServerLoad } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import Auth from '$lib/server/auth'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireAuthenticatedUser(event)

	const user = event.locals?.user

	if (!user) {
		throw redirect(303, Auth.routes.login)
	}

	return {
		user,
		codeSent: true,
		passkeyAvailable: false
	}
}
