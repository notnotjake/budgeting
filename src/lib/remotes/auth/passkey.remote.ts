import { z } from 'zod'
import { query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'

import Auth from '$lib/server/auth'
import AuthCore from '$lib/server/auth/core'
import { unwrap } from '$utils/structured-response'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

export const startPasskeyRegistration = query(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

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
		const event = getRequestEvent()
		await Auth.ratelimit.standard(event)

		const { session, user } = event.locals

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

			await getUserPasskeys().refresh()

			return { success: true }
		}

		throw error(500)
	}
)

export const getUserPasskeys = query(async () => {
	const event = getRequestEvent()
	await Auth.ratelimit.standard(event)

	const { session, user } = event.locals

	if (!session || !user) {
		throw error(401)
	}

	const keysResult = await AuthCore.listUserPasskeys({ userId: user.id })

	if (keysResult.success) {
		return keysResult?.data
	} else {
		throw error(500)
	}
})

export const renamePasskey = query(
	z.object({
		passkeyId: z.string(),
		newName: z.string().min(2).max(32)
	}),
	async ({ passkeyId, newName }) => {
		const event = getRequestEvent()
		await Auth.ratelimit.standard(event)

		if (!event.locals.user) {
			throw error(401)
		}

		// check if user owns passkey
		const passkeyUser = unwrap(await AuthCore.getPasskeyUser({ passkeyId }), () => {
			throw error(500, 'Failed to lookup passkey by id')
		})

		if (passkeyUser?.id !== event.locals.user.id) {
			throw error(403, 'You cannot rename this passkey as it does not belong to you')
		}

		const result = await AuthCore.updatePasskeyName({ passkeyId, name: newName })

		if (!result.success) {
			throw error(500)
		}

		await getUserPasskeys().refresh()

		return { success: true }
	}
)

// delete passkey
export const deletePasskey = command(
	z.object({
		passkeyId: z.string()
	}),
	async ({ passkeyId }) => {
		const event = getRequestEvent()
		await Auth.ratelimit.standard(event)

		if (!event.locals.user) {
			throw error(401)
		}

		// check if user owns passkey
		const passkeyUser = unwrap(await AuthCore.getPasskeyUser({ passkeyId }), () => {
			throw error(500, 'Failed to lookup passkey by id')
		})

		if (passkeyUser?.id !== event.locals.user.id) {
			throw error(403, 'You cannot delete this passkey as it does not belong to you')
		}

		const result = await AuthCore.deletePasskey({ passkeyId })

		if (!result.success) {
			throw error(500)
		}

		await getUserPasskeys().refresh()

		return { success: true }
	}
)
