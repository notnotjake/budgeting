import type { Handle } from '@sveltejs/kit'

import Auth from '$lib/server/auth'

export const authHook: Handle = async ({ event, resolve }) => {
	const sessionToken = Auth.getSessionTokenCookie(event)

	// If there is no cookie, set user and session to null value
	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	// Otherwise, try to validate the session cookie
	const { session, user } = await Auth.validateSessionToken(sessionToken)

	if (session) {
		// And reset the cookie with new expiration
		Auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		// Otherwise, delete the existing cookie
		Auth.deleteSessionTokenCookie(event)
	}

	// Return the user and session (could be verified or null)
	event.locals.user = user
	event.locals.session = session

	return resolve(event)
}
