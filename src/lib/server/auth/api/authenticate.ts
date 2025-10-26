import type { RequestEvent } from '@sveltejs/kit'
import { error, redirect } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import Auth, { AuthEmails } from '$lib/server/auth'
import { z } from 'zod'

type AuthFlow = 'existinguser' | 'newuser' | 'reauth'

export async function startAuth({
	event,
	identifier,
	timezone,
	flow
}: {
	event: RequestEvent
	identifier: string
	timezone?: string
	flow?: AuthFlow
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
		throw error(500, 'Failed to get user')
	}

	const user = userResult.data

	// Check if passkey is available
	let passkeyAvailable = false
	if (user) {
		const passkeyAvailableResult = await AuthCore.userHasPasskeyAvailable({
			userId: user.id
		})

		if (!passkeyAvailableResult.success) {
			throw error(500, 'Failed to check passkeys')
		}

		passkeyAvailable = passkeyAvailableResult.data ?? false
	}

	// If passkey is available we don't send code automatically
	if (passkeyAvailable) {
		return {
			codeSent: false,
			passkeyAvailable
		}
	}

	const sessionId = event.locals.session.id

	// If passkey unavailable (including no existing user) then send login code to email
	await sendCode({
		sessionId,
		identifier: normalizedIdentifier,
		flow: flow ?? (user ? 'existinguser' : 'newuser'),
		timezone
	})

	return {
		codeSent: true,
		passkeyAvailable
	}
}

// create challenge
export async function sendCode({
	sessionId,
	identifier,
	flow,
	timezone
}: {
	sessionId: string
	identifier: string
	flow: AuthFlow
	timezone?: string
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

	// Create expires at time from auth config
	const expiresAt = new Date(Date.now() + Auth.durations.challengeCodeMaxAge)

	// Derive time for sharing in email
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

	const emailParams = {
		email: identifier,
		code,
		timezone,
		expiresAt,
		maxAgeMins
	}

	// Send code to email
	try {
		if (flow === 'existinguser') {
			await AuthEmails.sendLoginCodeExistingUser(emailParams)
		} else if (flow === 'newuser') {
			await AuthEmails.sendLoginCodeNewUser(emailParams)
		} else if (flow === 'reauth') {
			await AuthEmails.sendReauthCode(emailParams)
		}
	} catch (e) {
		console.error('Failed trying to send login email', e)
		throw error(500, 'Failed to send email')
	}

	return
}

export async function verifyCode({ event, code }: { event: RequestEvent; code: string }) {
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

	const identifier = challenge.identifier

	// Successfully passed challenge. Now we cleanup auth challenges
	const result = await AuthCore.cleanupLoginChallenges({ identifier, sessionId })

	if (!result.success) {
		throw error(500)
	}

	// Check for existing user
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

		const redirectUrl = AuthCore.consumeRedirectUrlCookie(event)

		return { success: true, redirectUrl: redirectUrl || Auth.redirects.afterLogin }
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

		return { success: true, redirectUrl: Auth.redirects.afterAccountCreated }
	}
}

export async function startPasskey({
	event,
	identifier
}: {
	event: RequestEvent
	identifier?: string
}) {
	if (!event.locals.session) {
		throw error(500)
	}

	if (!identifier) {
		// create passkey options
	}
}

export async function verifyPasskey() {}

export async function logout({ event }: { event: RequestEvent }) {
	if (!event.locals.session) {
		AuthCore.clearRedirectUrlCookie(event)
		AuthCore.clearSessionTokenCookie(event)

		throw redirect(303, Auth.redirects.afterLogout)
	}

	// Invalidate the session
	const tryLogout = await AuthCore.invalidateSession(event.locals.session.id)

	if (!tryLogout.success) {
		throw error(500)
	}

	// Remove the session cookie and any redirects
	AuthCore.clearRedirectUrlCookie(event)
	AuthCore.clearSessionTokenCookie(event)

	throw redirect(303, Auth.redirects.afterLogout)
}
