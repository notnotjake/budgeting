import { query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'

// getSessions
export const getUserSessions = query(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

	if (!session || !user) {
		throw error(401, 'Unauthorized')
	}

	const result = await AuthCore.listAllUserSessions(user.id)

	if (!result.success) {
		throw error(500)
	}

	return {
		currentSessionId: session.id,
		allSessions: result.data
	}
})

export const invalidateSession = command(z.string(), async (sessionId) => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

	if (!session || !user) {
		throw error(401, 'Unauthorized')
	}

	const result = await AuthCore.invalidateSession(sessionId)

	if (!result.success) {
		throw error(500)
	}

	// Update the sessions list
	await getUserSessions().refresh()
})

export const invalidateAllSessions = command(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

	if (!session || !user) {
		throw error(401)
	}

	const result = await AuthCore.invalidateAllUserSessions({
		userId: user.id,
		activeSessionId: session.id
	})

	if (!result.success) {
		throw error(500)
	}

	// Update the sessions list
	await getUserSessions().refresh()
})
