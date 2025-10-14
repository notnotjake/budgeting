import { type RequestEvent, error, redirect } from '@sveltejs/kit'
import { type Session, type User } from '$lib/server/auth/schema'
import AuthCore from '$lib/server/auth/core'
import Auth, { AUTH_DURATIONS } from '$lib/server/auth'

/**
 * Ensures that a session is attached to the event or creates one.
 * Only checks that there is an unauthenticated session and does not check
 * for a user attached to session or event.
 *
 * Will create a new unauthenticated session if one doesn't exist
 */
export async function requireSession(event: RequestEvent): Promise<Session> {
	if (event.locals.session) {
		return event.locals.session
	}

	const result = await AuthCore.createSession({ event })

	if (!result.success || !result.data) {
		console.error('Failed')
		throw error(500)
	}

	const { rawSessionToken, session } = result.data

	AuthCore.setSessionTokenCookie({ event, token: rawSessionToken, expiresAt: session.expiresAt })

	return session
}

/**
 * Ensures that the user is authenticated before proceeding with the request.
 * If the user is not authenticated, redirects them to the login page
 */
export async function requireAuthenticatedUser(event: RequestEvent): Promise<User> {
	if (!event.locals.user || !event.locals.session) {
		AuthCore.setRedirectUrlCookie(event)
		throw redirect(303, Auth.routes.login)
	}

	return event.locals.user
}

/**
 * Checks if session has been authenticated in last 15 mins
 * If it hasn't, redirect user to reauth route
 */
export async function requireRecentAuth(event: RequestEvent) {
	const session = event.locals.session

	// Check session exists and has recent auth
	const hasRecentAuth =
		session?.lastAuthAt &&
		Date.now() < session.lastAuthAt.getTime() + AUTH_DURATIONS.recentAuthWindow

	if (!hasRecentAuth) {
		AuthCore.setRedirectUrlCookie(event)
		redirect(303, Auth.routes.reauth)
	}

	return
}
