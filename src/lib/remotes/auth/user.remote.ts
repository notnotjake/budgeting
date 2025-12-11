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

/**
 * Start the email change flow by sending a verification code to the new email.
 * Cleans up any existing email change attempts for this user first.
 */
export const startEmailChange = form(
	z.object({
		newEmail: z.email('Invalid email address')
	}),
	async ({ newEmail }) => {
		const event = getRequestEvent()
		await Auth.ratelimit.expensive(event)

		const { session, user } = event.locals

		if (!session || !user || !hasRecentAuth(event)) {
			return { requireReauth: true }
		}

		// Reject emails containing colon (reserved for internal use)
		if (newEmail.includes(':')) {
			return { error: 'Invalid email address' }
		}

		const normalizedNewEmail = AuthCore.normalizeIdentifierInput(newEmail)
		const normalizedCurrentEmail = AuthCore.normalizeIdentifierInput(user.identifier)

		// Check if the new email is the same as current
		if (normalizedNewEmail === normalizedCurrentEmail) {
			return { error: 'New email must be different from current email' }
		}

		// Check if the new email is already registered to another user
		const existingUserResult = await AuthCore.userExists({ identifier: normalizedNewEmail })

		if (!existingUserResult.success) {
			throw error(500, 'Failed to check email availability')
		}

		if (existingUserResult.data) {
			return { error: 'This email is already associated with another account' }
		}

		// Send the verification code (this also cleans up any existing attempts)
		try {
			await AuthCore.sendEmailChangeCode({
				sessionId: session.id,
				currentEmail: user.identifier,
				newEmail: normalizedNewEmail
			})

			return { success: true }
		} catch (e) {
			console.error('Failed to start email change', e)
			throw error(500, 'Failed to send verification email')
		}
	}
)

/**
 * Verify the email change code and update the user's email.
 * Sends a notification to the old email address on success.
 */
export const verifyEmailChange = form(
	z.object({
		code: z.string().length(6, 'Code must be 6 digits')
	}),
	async ({ code }) => {
		const event = getRequestEvent()
		await Auth.ratelimit.standard(event)

		const { session, user } = event.locals

		if (!session || !user) {
			throw error(401)
		}

		// Get the pending challenge for this session
		const challenge = unwrap(
			await AuthCore.getChallenge({
				type: 'code_email_change',
				sessionId: session.id
			}),
			() => {
				throw error(400, 'No pending email change request found. Please start again.')
			}
		)

		if (!challenge) {
			throw error(400, 'No pending email change request found. Please start again.')
		}

		// Parse the identifier to get old and new email
		const [oldEmail, newEmail] = challenge.identifier.split(':')

		if (!oldEmail || !newEmail) {
			return { error: 'Invalid challenge data. Please start again.' }
		}

		// Verify the code matches
		const codeMatches = await AuthCore.verifyShortCodesMatch({
			inputCode: code,
			savedCode: challenge.credential || ''
		})

		if (!codeMatches) {
			return { error: 'Invalid verification code' }
		}

		// Sanity check: make sure user's current email matches the old email in challenge
		const normalizedUserEmail = AuthCore.normalizeIdentifierInput(user.identifier)
		if (normalizedUserEmail !== oldEmail) {
			// Email was already changed (maybe on another session), clean up and return success
			return { success: true, alreadyChanged: true }
		}

		// Update the user's identifier to the new email
		const updateResult = await AuthCore.updateUser({
			userId: user.id,
			newIdentifier: newEmail
		})

		if (!updateResult.success) {
			throw error(500, 'Failed to update email')
		}

		// Clean up the challenge (it's consumed)
		// Note: cleanupChallengesByType won't work well here due to the composite identifier
		// The challenge will be cleaned up by expiry or when starting a new change flow

		// Send notification to the OLD email
		try {
			await AuthEmails.sendEmailDidChangeNotification({
				email: oldEmail,
				updatedEmail: newEmail
			})
		} catch (e) {
			// Don't fail the operation if notification fails
			console.error('Failed to send email change notification', e)
		}

		return { success: true, newEmail }
	}
)

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
