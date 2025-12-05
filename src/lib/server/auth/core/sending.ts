import { error } from '@sveltejs/kit'

import Auth from '$lib/server/auth'
import { AuthEmails } from '$lib/server/auth'
import type { sendCodeParams } from '$lib/server/auth/types'

import { createChallenge, cleanupChallengesByType } from './challenges'
import { generateShortCode, hashShortCode, normalizeIdentifierInput } from './utils'

export async function sendLoginCode({
	sessionId,
	identifier,
	existingUser,
	timezone
}: {
	sessionId: string
	identifier: string
	existingUser: boolean
	timezone?: string
}) {
	const normalizedIdentifier = normalizeIdentifierInput(identifier)
	const emailParams = await sendCodeCore({ sessionId, identifier: normalizedIdentifier, timezone })

	try {
		if (existingUser) {
			await AuthEmails.sendLoginCodeExistingUser(emailParams)
		} else {
			await AuthEmails.sendLoginCodeNewUser(emailParams)
		}
	} catch (e) {
		console.error('Failed trying to send login email', e)
		throw error(500, 'Failed to send email')
	}

	return
}

export async function sendReauthCode({
	sessionId,
	identifier,
	timezone
}: {
	sessionId: string
	identifier: string
	timezone?: string
}) {
	const normalizedIdentifier = normalizeIdentifierInput(identifier)
	const emailParams = await sendCodeCore({ sessionId, identifier: normalizedIdentifier, timezone })

	// Send code to email
	try {
		await AuthEmails.sendReauthCode(emailParams)
	} catch (e) {
		console.error('Failed trying to send login email', e)
		throw error(500, 'Failed to send email')
	}

	return
}

async function sendCodeCore({
	sessionId,
	identifier,
	timezone
}: {
	sessionId: string
	identifier: string
	timezone?: string
}): Promise<sendCodeParams> {
	// Cleanup any existing login code challenges
	const cleanupResult = await cleanupChallengesByType({
		identifier,
		sessionId,
		type: 'code'
	})

	if (!cleanupResult.success) {
		throw error(500, 'Failed to cleanup challenges')
	}

	// Generate and hash short code
	const code = generateShortCode()
	const hashedCode = await hashShortCode(code)

	// Create expires at time from auth config
	const expiresAt = new Date(Date.now() + Auth.durations.challengeCodeMaxAge)

	// Derive time for sharing in email
	const maxAgeMins = Math.floor(Auth.durations.challengeCodeMaxAge / (60 * 1000))

	// Save challenge
	const challenge = await createChallenge({
		identifier,
		sessionId,
		credential: hashedCode,
		type: 'code',
		expiresAt
	})

	if (!challenge.success) {
		throw error(500, 'Failed to create login challenge')
	}

	return {
		email: identifier,
		code,
		timezone,
		expiresAt,
		maxAgeMins
	}
}
