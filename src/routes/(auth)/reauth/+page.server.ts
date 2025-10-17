import type { ServerLoad } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireAuthenticatedUser(event)

	const user = event.locals?.user?.identifier ?? 'unknown'

	console.log(user)

	return {
		user
	}
}
