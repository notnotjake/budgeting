import { form, getRequestEvent, query } from '$app/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { delay } from '$utils/timing'
import { unwrap } from '$utils/structured-response'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

function requireUser() {
	const { locals } = getRequestEvent()
	if (!locals.session || !locals.user) {
		redirect(303, Auth.routes.login)
	}
	return { session: locals.session, user: locals.user }
}

function requireSession() {
	const { locals } = getRequestEvent()
	if (!locals.session) {
		throw error(401)
	}
	return { session: locals.session }
}

export const logout = form(async () => {
	const event = getRequestEvent()
	const session = event.locals.session

	if (!session) {
		AuthCore.clearRedirectUrlCookie(event)
		AuthCore.clearSessionTokenCookie(event)

		throw redirect(303, Auth.redirects.afterLogout)
	}

	// Invalidate the session
	const invalidateSessionResult = await AuthCore.invalidateSession(session.id)

	if (!invalidateSessionResult.success) {
		throw error(500)
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
	async (data, invalid) => {
		const event = getRequestEvent()

		// TODO: Ratelimit

		// Require session
		if (!event.locals.session) {
			throw error(500)
		}

		// Normalize input
		const identifier = data.identifier.toLowerCase().trim()

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
				codeSent: false,
				passkeyAvailable: true
			}
		}

		// Send login code
		await sendCode({
			sessionId: event.locals.session.id,
			identifier,
			flow: user ? 'existinguser' : 'newuser',
			timezone: data.timezone
		})

		return {
			codeSent: true,
			passkeyAvailable: false
		}
	}
)

export const sendLoginCode = form()

export const verifyLoginCode = form()

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

export const verifyLoginPasskey = form()
