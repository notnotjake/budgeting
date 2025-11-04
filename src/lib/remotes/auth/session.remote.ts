import { form, query, command, getRequestEvent } from '$app/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { AuthEmails } from '$lib/server/auth'
import { unwrap } from '$utils/structured-response'

// getSessions
export const getUserSessions = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized')
	}

	const result = await AuthCore.listAllUserSessions(locals.user.id)

	if (!result.success) {
		throw error(500)
	}

	return {
		currentSessionId: locals.session.id,
		allSessions: result.data
	}
})

export const invalidateSession = command(z.string(), async (sessionId) => {
	const { locals } = getRequestEvent()

	if (!locals.session || !locals.user) {
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
	const { locals } = getRequestEvent()

	if (!locals.session || !locals.user) {
		throw error(401)
	}

	const activeSessionId = locals.session.id

	const result = await AuthCore.invalidateAllUserSessions({
		userId: locals.session.id,
		activeSessionId
	})

	if (!result.success) {
		throw error(500)
	}

	// Update the sessions list
	await getUserSessions().refresh()
})
