import { form, query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'
import { z } from 'zod'

import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { unwrap } from '$utils/structured-response'
import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
	type PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/server'

import { delay } from '$utils/timing'

export const logout = command(async () => {
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

	return { redirectUrl: Auth.redirects.afterLogout }
})

export const startLogin = form(
	z.object({
		identifier: z.string().email(),
		timezone: z.string().optional()
	}),
	async ({ identifier: identifierRaw, timezone }) => {
		const { locals } = getRequestEvent()

		// Require session
		if (!locals.session) {
			throw error(400)
		}

		// Normalize input
		const identifier = identifierRaw.toLowerCase().trim()

		if (identifier === 'error@error.com') {
			return error(401, 'Email not Allowed')
		}

		// Check if user exists
		const userResult = await AuthCore.getUser({ identifier })

		if (!userResult.success || userResult.data === undefined) {
			throw error(500, 'Failed to get user')
		}

		const user = userResult.data

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
		await AuthCore.sendLoginCode({
			sessionId: locals.session.id,
			identifier,
			existingUser: !!user,
			timezone: timezone
		})

		return {
			identifier: identifier,
			codeSent: true,
			passkeyAvailable: false
		}
	}
)

export const sendLoginCode = form(
	z.object({
		identifier: z.string().email(),
		timezone: z.string().optional()
	}),
	async ({ identifier: identifierRaw, timezone }) => {
		await delay(750)

		const { locals } = getRequestEvent()

		if (!locals.session) {
			throw error(400)
		}

		// Normalize input
		const identifier = identifierRaw.toLowerCase().trim()

		// Check if user exists
		const user = unwrap(await AuthCore.getUser({ identifier }), () => {
			throw error(500, 'Failed to get user')
		})

		// Send login code
		await AuthCore.sendLoginCode({
			sessionId: locals.session.id,
			identifier,
			existingUser: !!user,
			timezone: timezone
		})

		return { success: true }
	}
)

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
			throw error(400)
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

		const challengeResult = await AuthCore.createChallenge({
			identifier: identifier || '',
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

export const verifyLoginPasskey = command(
	z.object({
		attestation: z.any()
	}),
	async ({ attestation }) => {
		const event = getRequestEvent()

		if (!event.locals.session) {
			throw error(400)
		}

		const session = event.locals.session

		const challenge = unwrap(
			await AuthCore.getChallenge({
				type: 'passkey',
				sessionId: session.id
			}),
			() => {
				throw error(500)
			}
		)

		if (!challenge || !challenge.credential) {
			throw error(400, 'No login challenge found')
		}

		if (!attestation?.id) {
			throw error(400, 'Missing credential ID')
		}

		const savedPasskey = unwrap(
			await AuthCore.getPasskeyCredential({ passkeyId: attestation.id }),
			() => {
				throw error(500)
			}
		)

		if (!savedPasskey) {
			throw error(400, 'No passkey found')
		}

		const attempt = await verifyAuthenticationResponse({
			response: attestation,
			expectedChallenge: challenge.credential,
			expectedOrigin: Auth.passkeys.expectedOrigin,
			expectedRPID: Auth.passkeys.rpID,
			credential: {
				id: attestation.id,
				publicKey: savedPasskey,
				counter: 0
			}
		})

		if (attempt.verified) {
			const user = unwrap(await AuthCore.getPasskeyUser({ passkeyId: attestation.id }), () => {
				throw error(500)
			})

			if (!user) {
				throw error(400)
			}

			await AuthCore.cleanupLoginChallenges({
				identifier: challenge.identifier,
				sessionId: session.id
			})

			// Authentiacte the session
			const authenticatedSession = unwrap(
				await AuthCore.authenticateSession({ event, user }),
				() => {
					throw error(500)
				}
			)

			// Set the session cookie
			AuthCore.setSessionTokenCookie({
				event,
				token: authenticatedSession.rawSessionToken,
				expiresAt: authenticatedSession.session.expiresAt
			})

			const redirectUrl = AuthCore.consumeRedirectUrlCookie(event) || Auth.redirects.afterLogin

			return { success: true, redirectUrl }
		}

		return { success: false }
	}
)
