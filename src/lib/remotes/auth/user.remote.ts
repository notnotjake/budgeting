import { form, query, command, getRequestEvent } from '$app/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { AuthEmails } from '$lib/server/auth'

// updateUserProfile
// startEmailChange
// verifyEmailChange
// getActiveEmailChangeAttempt
// lockUserAccount
// unlockUserAccount
// deleteUserAccount
export const deleteUserAccount = command(async () => {
	const event = getRequestEvent()

	// ensure recent auth
	const session = event.locals.session
	const user = event.locals.user

	if (!user || !session) {
		throw error(401)
	}

	const hasRecentAuth =
		session?.lastAuthAt &&
		Date.now() < session.lastAuthAt.getTime() + Auth.durations.recentAuthWindow

	if (!hasRecentAuth) {
		AuthCore.setRedirectUrlCookie(event)
		redirect(303, Auth.routes.reauth)
	}

	// delete user
	const result = await AuthCore.deleteUser({ userId: user.id })

	if (!result.success) {
		throw error(500)
	}

	// invalidate session
	await AuthCore.invalidateSession(session.id)

	AuthCore.clearRedirectUrlCookie(event)
	AuthCore.clearSessionTokenCookie(event)

	// send email
	await AuthEmails.sendAccountDeletionCompleted({ email: user.identifier })

	// return success
	return { success: true }
})
