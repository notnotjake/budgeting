import { form, query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { AuthEmails } from '$lib/server/auth'
import { unwrap } from '$utils/structured-response'

export const getUser = query(async () => {
	const { locals } = getRequestEvent()

	return {
		identifier: locals.user?.identifier || '',
		name: locals.user?.name || ''
	}
})

export const updateUserName = form(
	z.object({
		name: z.string().min(3, 'Too Short').max(32, 'Too Long')
	}),
	async ({ name }) => {
		const { locals } = getRequestEvent()

		if (!locals.user) {
			throw error(401)
		}

		if (name === locals.user.name) {
			return { success: true, name: name }
		}

		const updatedUser = unwrap(
			await AuthCore.updateUser({ userId: locals.user.id, newName: name }),
			() => {
				throw error(500)
			}
		)

		return { success: true, name: updatedUser.name }
	}
)

// startEmailChange

// verifyEmailChange

export const deleteUserAccount = command(async () => {
	const event = getRequestEvent()

	const session = event.locals.session
	const user = event.locals.user

	if (!session || !user || !hasRecentAuth()) {
		return { requireReauth: true }
	}

	// delete user
	const result = await AuthCore.deleteUser({ userId: user.id })

	console.log(result)
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

function hasRecentAuth() {
	const { locals } = getRequestEvent()

	if (!locals.session || !locals.user) {
		throw error
	}

	const buffer = 3 * 60 * 1000 // 3 mins in ms

	const r =
		locals.session?.lastAuthAt &&
		Date.now() < locals.session.lastAuthAt.getTime() + Auth.durations.recentAuthWindow - buffer

	return r
}
