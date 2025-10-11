import { type Handle, redirect } from '@sveltejs/kit'
import { console } from 'node:inspector/promises'

import Auth from '$lib/server/auth'

export const handleAuthorization: Handle = async ({ event, resolve }) => {
	if (event.route.id?.startsWith('/(protected)')) {
		console.log('Hit Protected Route')
		if (!event.locals.user || !event.locals.session) {
			console.log('Hook protecting route ' + event.route.id)
			throw redirect(303, Auth.routes.login)
		}
	}

	return resolve(event)
}
