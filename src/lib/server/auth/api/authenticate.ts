import type { RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import Auth from '$lib/server/auth'
import { z } from 'zod'

export async function startLogin({
	event,
	identifier
}: {
	event: RequestEvent
	identifier: string
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
	await sendLoginCode({ sessionId, identifier: normalizedIdentifier, existingUser: !!user })

	return {
		codeSent: true,
		passkeyAvailable
	}
}

// create challenge
export async function sendLoginCode({
	sessionId,
	identifier,
	existingUser
}: {
	sessionId: string
	identifier: string
	existingUser: boolean
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

	const expiresAt = new Date(Date.now() + Auth.durations.authCodeExpiry)

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

	// Return success or error
}

export async function verifyLoginCode() {}

export async function verifyLoginPasskey() {}

export async function startReauth() {}

export async function verifyReauthCode() {}

export async function verifyReauthPasskey() {}

export async function logout() {}
