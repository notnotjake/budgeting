import { form, query, command, getRequestEvent } from '$app/server'
import { error, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'
import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { AuthEmails } from '$lib/server/auth'
import { unwrap } from '$utils/structured-response'

export const getUser = query(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { user } = event.locals

	return {
		identifier: user?.identifier || '',
		name: user?.name || '',
		profilePic: user?.profilePic || null
	}
})

export const updateUserName = form(
	z.object({
		name: z.string().min(3, 'Too Short').max(32, 'Too Long')
	}),
	async ({ name }) => {
		const event = getRequestEvent()
		await Auth.ratelimit.standard(event)

		const { user } = event.locals

		if (!user) {
			throw error(401)
		}

		if (name === user.name) {
			return { success: true, name: name }
		}

		const updatedUser = unwrap(
			await AuthCore.updateUser({ userId: user.id, newName: name }),
			() => {
				throw error(500)
			}
		)

		await getUser().refresh()

		return { success: true, name: updatedUser.name }
	}
)

// startEmailChange

// verifyEmailChange

export const deleteUserAccount = command(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

	if (!session || !user || !hasRecentAuth(event)) {
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

function hasRecentAuth(event: RequestEvent) {
	const { locals } = event

	if (!locals.session || !locals.user) {
		throw error(401, 'Requires recent authentication. Please reauthenticate and try again')
	}

	const buffer = 3 * 60 * 1000 // 3 mins in ms

	return (
		locals.session?.lastAuthAt &&
		Date.now() < locals.session.lastAuthAt.getTime() + Auth.durations.recentAuthWindow - buffer
	)
}
