import { z } from 'zod'
import { query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'

import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

export const startPasskeyRegistration = query(async () => {
	const { locals } = getRequestEvent()

	const session = locals.session
	const user = locals.user

	if (!session || !user) {
		throw error(401)
	}

	const options = await generateRegistrationOptions({
		rpName: Auth.passkeys.rpName,
		rpID: Auth.passkeys.rpID,
		timeout: Auth.durations.challengePasskeyMaxAge,
		userName: user.identifier,
		userDisplayName: user.name
	})

	const expiresAt = new Date(Date.now() + Auth.durations.challengePasskeyMaxAge)

	const result = await AuthCore.createChallenge({
		identifier: user.identifier,
		sessionId: session.id,
		type: 'passkey_register',
		credential: options.challenge,
		expiresAt
	})

	if (!result.success) {
		throw error(500)
	}

	return { success: true, options }
})

export const verifyPasskeyRegistration = command(
	z.object({
		name: z.string().max(64),
		registration: z.any()
	}),
	async ({ name, registration }) => {
		const { locals } = getRequestEvent()

		const session = locals.session
		const user = locals.user

		if (!session || !user) {
			throw error(401)
		}

		const challenge = await AuthCore.getChallenge({
			type: 'passkey_register',
			sessionId: session.id
		})

		if (!challenge.success || !challenge.data || !challenge.data.credential) {
			throw error(500)
		}

		const attempt = await verifyRegistrationResponse({
			response: registration,
			expectedChallenge: challenge.data.credential,
			expectedOrigin: Auth.passkeys.expectedOrigin,
			expectedRPID: Auth.passkeys.rpID,
			requireUserVerification: true
		})

		if (attempt.verified) {
			const createPasskeyResult = await AuthCore.createPasskey({
				name,
				userId: user.id,
				passkeyId: attempt.registrationInfo?.credential.id,
				publicKey: attempt.registrationInfo?.credential.publicKey
			})

			if (!createPasskeyResult.success) {
				throw error(500)
			}

			await AuthCore.cleanupChallengesByType({
				type: 'passkey_register',
				sessionId: session.id,
				identifier: user.identifier
			})

			return { success: true }
		}

		await getUserPasskeys().refresh()

		throw error(500)
	}
)

// get all passkeys
export const getUserPasskeys = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.session || !locals.user) {
		throw error(401)
	}

	const keysResult = await AuthCore.listUserPasskeys({ userId: locals.user.id })

	if (keysResult.success) {
		return keysResult?.data
	} else {
		throw error(500)
	}
})

// rename passkey
// delete passkey
