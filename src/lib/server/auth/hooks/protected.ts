import { type Handle, redirect } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import Auth from '$lib/server/auth'

export const handleProtected: Handle = async ({ event, resolve }) => {
	if (
		event.route.id?.startsWith(Auth.routes.protectedGroup) &&
		(!event.locals.user || !event.locals.session)
	) {
		console.log('Hook protecting route: ' + event.route.id)

		AuthCore.setRedirectUrlCookie(event)
		throw redirect(303, Auth.routes.login)
	}

	return resolve(event)
}
