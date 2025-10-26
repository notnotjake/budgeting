import type { Handle } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import { ERROR_MESSAGE } from '$lib/server/auth'

export const handleAuthentication: Handle = async ({ event, resolve }) => {
	try {
		const sessionToken = AuthCore.getSessionTokenCookie(event)

		// If there is no cookie, set user and session to null value
		if (!sessionToken) {
			event.locals.user = null
			event.locals.session = null
			return resolve(event)
		}

		// Otherwise, try to validate the session cookie
		// const { session, user } = await AuthCore.validateSessionToken(sessionToken)
		const result = await AuthCore.validateSessionToken(sessionToken)

		if (!result.success || !result.data) {
			event.locals.user = null
			event.locals.session = null
			return resolve(event)
		}

		const { session, user } = result.data

		if (session) {
			// And reset the cookie with new expiration
			AuthCore.setSessionTokenCookie({ event, token: sessionToken, expiresAt: session.expiresAt })
		} else {
			// Otherwise, delete the existing cookie
			AuthCore.clearSessionTokenCookie(event)
		}

		// Return the user and session (could be verified or null)
		event.locals.user = user
		event.locals.session = session

		return resolve(event)
	} catch (e) {
		console.error(ERROR_MESSAGE.API.AUTHENTICATION_HOOK, e)

		event.locals.user = null
		event.locals.session = null

		return resolve(event)
	}
}
