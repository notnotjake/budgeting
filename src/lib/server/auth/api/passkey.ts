import { error, redirect, type RequestEvent } from '@sveltejs/kit'
import { NODE_ENV } from '$env/static/private'
import { site } from '$lib/site-config'
import AuthCore from '$lib/server/auth/core'
import Auth from '$lib/server/auth'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'

const inDev = NODE_ENV === 'development'

const rpID = inDev ? 'localhost' : site.host
const rpName = site.name
const expectedOrigin = inDev ? 'http://localhost:5173' : site.url

export async function startPasskeyRegistration({ event }: { event: RequestEvent }) {
	const session = event.locals.session
	const user = event.locals.user

	if (!session || !user) {
		throw error(401)
	}

	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		timeout: Auth.durations.challengePasskeyMaxAge,
		userName: user.identifier,
		userDisplayName: user.name
	})

	const expiresAt = new Date(Date.now() + Auth.durations.challengePasskeyMaxAge)

	await AuthCore.cleanupDuplicateLoginChallenges({
		type: 'passkey_register',
		sessionId: session.id,
		identifier: user.identifier
	})

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
}

export async function verifyPasskeyRegistration({
	event,
	name,
	registrationResponse
}: {
	event: RequestEvent
	name: string
	registrationResponse: RegistrationResponseJSON
}) {
	const session = event.locals.session
	const user = event.locals.user

	if (!session || !user) {
		throw error(401)
	}

	const challenge = await AuthCore.getChallenge({
		type: 'passkey_register',
		sessionId: session.id
	})

	console.log('1', challenge)

	if (!challenge.success || !challenge.data || !challenge.data.credential) {
		console.log('A')
		throw error(500)
	}

	const attempt = await verifyRegistrationResponse({
		response: registrationResponse,
		expectedChallenge: challenge.data.credential,
		expectedOrigin,
		expectedRPID: rpID,
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
			console.log('B')
			throw error(500)
		}

		await AuthCore.cleanupDuplicateLoginChallenges({
			type: 'passkey_register',
			sessionId: session.id,
			identifier: user.identifier
		})

		console.log('success')

		return { success: true }
	}

	console.log('C')
	throw error(500)
}

export async function getAllPasskeys() {}

export async function deletePasskey() {}
