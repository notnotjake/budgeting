import type { ServerLoad } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireSession(event)

	// Redirect if already authenticated
	if (event.locals.user) {
		const redirectUrl = AuthCore.consumeRedirectUrlCookie(event)
		redirect(303, redirectUrl ?? Auth.routes.afterLogin)
	}
}
