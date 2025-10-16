import type { RequestEvent } from '@sveltejs/kit'
import { error, redirect } from '@sveltejs/kit'
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

	if (!userResult.success) {
		console.log('Failed here.', userResult)
		throw error(500, 'Failed to get user')
	}

	const user = userResult.data

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

	return
}

export async function verifyLoginCode({ event, code }: { event: RequestEvent; code: string }) {
	if (!event.locals.session) {
		throw error(500)
	}

	// Rate limit

	// Validate input
	const codeSchema = z
		.string()
		.regex(/^\d+$/, 'Code must contain only numbers')
		.length(6, 'Code should be 6 digits')
	const validCode = codeSchema.safeParse(code)
	if (!validCode.success) {
		const errorMessage = validCode.error.errors[0].message
		throw error(400, `Invalid code. ${errorMessage}`)
	}

	const sessionId = event.locals.session?.id

	// Look for the challenge (associated by session)
	const challengeResult = await AuthCore.getChallenge({
		type: 'code',
		sessionId
	})

	if (!challengeResult.success) {
		throw error(500)
	}

	const challenge = challengeResult.data

	if (!challenge || !challenge.credential) {
		throw error(400, 'No login challenge found')
	}

	// Check that the input code matches the saved challenge
	const challengePass = await AuthCore.verifyShortCodesMatch({
		savedCode: challenge.credential,
		inputCode: validCode.data
	})

	if (!challengePass) {
		throw error(400, 'Invalid login code')
	}

	// Check for existing user
	const identifier = challenge.identifier

	const userResult = await AuthCore.getUser({ identifier })

	if (!userResult.success) {
		throw error(500)
	}

	if (userResult.data) {
		const user = userResult.data

		const authenticationResult = await AuthCore.authenticateSession({ event, user })

		if (!authenticationResult.success || !authenticationResult.data) {
			throw error(500)
		}

		AuthCore.setSessionTokenCookie({
			event,
			token: authenticationResult.data.rawSessionToken,
			expiresAt: authenticationResult.data.session.expiresAt
		})

		throw redirect(303, Auth.redirects.afterLogin)
	} else {
		const tempName = AuthCore.generateRandomName()

		const newUser = await AuthCore.createUser({ identifier, name: tempName })

		if (!newUser.success || !newUser.data) {
			throw error(500)
		}

		const user = newUser.data

		const authenticationResult = await AuthCore.authenticateSession({ event, user })

		if (!authenticationResult.success || !authenticationResult.data) {
			throw error(500)
		}

		AuthCore.setSessionTokenCookie({
			event,
			token: authenticationResult.data.rawSessionToken,
			expiresAt: authenticationResult.data.session.expiresAt
		})

		throw redirect(303, Auth.redirects.afterAccountCreated)
	}
}

export async function verifyLoginPasskey() {}

export async function startReauth() {}

export async function verifyReauthCode() {}

export async function verifyReauthPasskey() {}

export async function logout() {}
