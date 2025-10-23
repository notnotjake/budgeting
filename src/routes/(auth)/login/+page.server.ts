import type { ServerLoad } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import Auth from '$lib/server/auth'

export const load: ServerLoad = async (event) => {
	await Auth.protect.requireSession(event)

	// TODO: this redirect is causing us to get redirected when creating an account
	// it prevents us from getting back the redirect url from our verify api
	// because when that comes back, it hits the load function again
	// why does it hit the load function a second time?

	// Redirect if already authenticated
	if (event.locals.user) {
		redirect(303, Auth.redirects.afterLogin)
	}

	return {
		title: 'Welcome to Spring',
		text: 'Log in or sign up to get started'
	}
}
