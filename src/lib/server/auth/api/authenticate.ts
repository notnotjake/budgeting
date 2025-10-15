import type { RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import Auth, { AuthEmails } from '$lib/server/auth'
import { z } from 'zod'

export async function startLogin({
	event,
	identifier,
	timezone
}: {
	event: RequestEvent
	identifier: string
	timezone: string
}) {
	// Rate limit

	if (!event.locals.session) {
		throw error(500)
	}

	// Normalize input
	const normalizedIdentifier = identifier.toLowerCase().trim()

	// Validate input
	const emailSchema = z.string().email()
	const validInput = emailSchema.safeParse(normalizedIdentifier)
	if (!validInput.success) {
		throw error(400, 'Invalid email format')
	}

	// Check if user exists and has passkey
	const userResult = await AuthCore.getUser({ identifier: normalizedIdentifier })

	if (!userResult.success || !userResult.data) {
		throw error(500, 'Failed to get user')
	}

	const user = userResult.data?.user

	// Check if passkey is available
	let passkeyAvailable = false
	if (user) {
		const passkeyAvailableResult = await AuthCore.userHasPasskeyAvailable({
			userId: user.id
		})

		if (!passkeyAvailableResult.success || !passkeyAvailableResult.data) {
			throw error(500, 'Failed to check passkeys')
		}

		passkeyAvailable = passkeyAvailableResult.data ?? false
	}

	if (passkeyAvailable) {
		return {
			codeSent: false,
			passkeyAvailable
		}
	}

	const sessionId = event.locals.session.id

	// If passkey unavailable (including no existing user) then send login code to email
	await sendLoginCode({
		sessionId,
		identifier: normalizedIdentifier,
		existingUser: !!user,
		timezone
	})

	return {
		codeSent: true,
		passkeyAvailable
	}
}

// create challenge
export async function sendLoginCode({
	sessionId,
	identifier,
	existingUser,
	timezone
}: {
	sessionId: string
	identifier: string
	existingUser: boolean
	timezone: string
}) {
	// Cleanup any existing login code challenges
	const cleanupResult = await AuthCore.cleanupDuplicateLoginChallenges({
		identifier,
		sessionId,
		type: 'code'
	})

	if (!cleanupResult.success) {
		throw error(500, 'Failed to cleanup challenges')
	}

	// Generate and hash short code
	const code = AuthCore.generateShortCode()
	const hashedCode = await AuthCore.hashShortCode(code)

	const expiresAt = new Date(Date.now() + Auth.durations.challengeCodeMaxAge)
	const maxAgeMins = Math.floor(Auth.durations.challengeCodeMaxAge / (60 * 1000))

	// Save challenge
	const challenge = await AuthCore.createChallenge({
		identifier,
		sessionId,
		credential: hashedCode,
		type: 'code',
		expiresAt
	})

	if (!challenge.success) {
		throw error(500, 'Failed to create login challenge')
	}

	// Send code to email
	try {
		if (existingUser) {
			await AuthEmails.sendLoginCodeExistingUser({
				email: identifier,
				code,
				timezone,
				expiresAt,
				maxAgeMins
			})
		} else {
			await AuthEmails.sendLoginCodeNewUser({
				email: identifier,
				code,
				timezone,
				expiresAt,
				maxAgeMins
			})
		}
	} catch (e) {
		console.error('Failed trying to send login email', e)
		// TODO: implement retry logic, propogate error
		throw error(500, 'Failed to send email')
	}

	// Return success or error
}

export async function verifyLoginCode() {}

export async function verifyLoginPasskey() {}

export async function startReauth() {}

export async function verifyReauthCode() {}

export async function verifyReauthPasskey() {}

export async function logout() {}
