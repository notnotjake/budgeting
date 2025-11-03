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

	const currentSession = locals.session
	const result = await AuthCore.listAllUserSessions(locals.user.id)

	if (!result.success) {
		throw error(500)
	}

	return {
		currentSessionId: currentSession.id,
		allSessions: result.data
	}
})

// invalidateSession
// invalidateAllSessions
// invalidateAllOtherSessions
