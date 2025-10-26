import { form, getRequestEvent, query } from '$app/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { unwrap } from '$utils/structured-response'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

// import { delay } from '$utils/timing'

export const logout = form(async () => {
	const event = getRequestEvent()
	const session = event.locals.session

	// Invalidate the session if we have one
	if (session) {
		const invalidateSessionResult = await AuthCore.invalidateSession(session.id)

		if (!invalidateSessionResult.success) {
			throw error(500)
		}
	}

	AuthCore.clearRedirectUrlCookie(event)
	AuthCore.clearSessionTokenCookie(event)

	throw redirect(303, Auth.redirects.afterLogout)
})

export const startLogin = form(
	z.object({
		identifier: z.string().email(),
		timezone: z.string().optional()
	}),
	async ({ identifier: identifierRaw, timezone }) => {
		const event = getRequestEvent()

		// Require session
		if (!event.locals.session) {
			throw error(500)
		}

		// Normalize input
		const identifier = identifierRaw.toLowerCase().trim()

		// Check if user exists
		const user = unwrap(await AuthCore.getUser({ identifier }), () => {
			throw error(500, 'Failed to get user')
		})

		// Check if a user has passkey
		let passkeyAvailable = false
		if (user) {
			passkeyAvailable = unwrap(await AuthCore.userHasPasskeyAvailable({ userId: user.id }), () => {
				throw error(500, 'Failed to check for passkey')
			})
		}

		if (passkeyAvailable) {
			return {
				identifier: identifier,
				codeSent: false,
				passkeyAvailable: true
			}
		}

		// Send login code
		await sendCode({
			sessionId: event.locals.session.id,
			identifier,
			flow: user ? 'existinguser' : 'newuser',
			timezone: timezone
		})

		return {
			identifier: identifier,
			codeSent: true,
			passkeyAvailable: false
		}
	}
)

// export const sendLoginCode = form()

export const verifyLoginCode = form(
	z.object({
		code: z
			.string()
			.regex(/^\d+$/, 'Code must contain only numbers')
			.length(6, 'Code should be 6 digits')
	}),
	async ({ code }) => {
		const event = getRequestEvent()

		if (!event.locals.session) {
			throw error(500)
		}

		const session = event.locals.session

		const challenge = unwrap(
			await AuthCore.getChallenge({
				type: 'code',
				sessionId: session.id
			}),
			() => {
				throw error(500)
			}
		)

		if (!challenge || !challenge.credential) {
			throw error(400, 'No login challenge found')
		}

		// Test if code matches saved hash
		const challengePass = await AuthCore.verifyShortCodesMatch({
			savedCode: challenge.credential,
			inputCode: code
		})

		// Code was not valid
		if (!challengePass) {
			return { success: false }
		}

		//
		// Code accepted: login or create user
		//

		await AuthCore.cleanupLoginChallenges({
			identifier: challenge.identifier,
			sessionId: session.id
		})

		// Look for existing user
		let user = unwrap(await AuthCore.getUser({ identifier: challenge.identifier }), () => {
			throw error(500)
		})

		let redirectUrl: string | null = null

		// No user: create new user account
		if (!user) {
			const tempName = AuthCore.generateRandomName()

			user = unwrap(
				await AuthCore.createUser({ identifier: challenge.identifier, name: tempName }),
				() => {
					throw error(500)
				}
			)

			redirectUrl = Auth.redirects.afterAccountCreated
		}

		// Authentiacte the session
		const authenticatedSession = unwrap(await AuthCore.authenticateSession({ event, user }), () => {
			throw error(500)
		})

		// Set the session cookie
		AuthCore.setSessionTokenCookie({
			event,
			token: authenticatedSession.rawSessionToken,
			expiresAt: authenticatedSession.session.expiresAt
		})

		if (!redirectUrl) {
			redirectUrl = AuthCore.consumeRedirectUrlCookie(event) || Auth.redirects.afterLogin
		}

		return { success: true, redirectUrl }
	}
)

export const startLoginPasskey = query(
	z.object({
		identifier: z.string().email().optional()
	}),
	async ({ identifier }) => {
		const { locals } = getRequestEvent()

		if (!locals.session) {
			throw error(500)
		}

		let options: PublicKeyCredentialRequestOptionsJSON

		if (!identifier) {
			options = await generateAuthenticationOptions({
				rpID: Auth.passkeys.rpID,
				userVerification: 'preferred'
			})
		} else {
			const user = unwrap(await AuthCore.getUser({ identifier }), () => {
				throw error(401)
			})

			if (!user) {
				throw error(401)
			}

			const userPasskeys = unwrap(await AuthCore.listUserPasskeys({ userId: user.id }), () => {
				throw error(500)
			})

			options = await generateAuthenticationOptions({
				allowCredentials: userPasskeys.map((passkey) => ({
					id: passkey.id,
					type: 'public-key'
				})),
				rpID: Auth.passkeys.rpID,
				userVerification: 'preferred',
				timeout: Auth.durations.challengePasskeyMaxAge
			})
		}

		const expiresAt = new Date(Date.now() + Auth.durations.challengePasskeyMaxAge)

		await AuthCore.cleanupDuplicateLoginChallenges({
			identifier: null,
			sessionId: locals.session.id,
			type: 'passkey'
		})

		const challengeResult = await AuthCore.createChallenge({
			identifier: '',
			sessionId: locals.session.id,
			type: 'passkey',
			credential: options.challenge,
			expiresAt
		})

		if (!challengeResult.success) {
			throw error(500)
		}

		return { success: true, options }
	}
)

// export const verifyLoginPasskey = form()
