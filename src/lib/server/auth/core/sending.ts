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

/**
 * Initiates an email change flow by creating a challenge and sending a verification code.
 * Cleans up any existing email change attempts for this user before creating the new one.
 *
 * The challenge identifier is stored as "oldEmail:newEmail" to allow lookup by user's current email.
 *
 * @param sessionId - The current session ID
 * @param currentEmail - The user's current email address
 * @param newEmail - The new email address to change to
 * @param timezone - Optional timezone for email formatting
 * @returns The created challenge data including expiration
 */
export async function sendEmailChangeCode({
	sessionId,
	currentEmail,
	newEmail,
	timezone
}: {
	sessionId: string
	currentEmail: string
	newEmail: string
	timezone?: string
}) {
	const normalizedCurrentEmail = normalizeIdentifierInput(currentEmail)
	const normalizedNewEmail = normalizeIdentifierInput(newEmail)

	// Cleanup any existing email change challenges for this user (across all sessions)
	const cleanupResult = await cleanupChallengesByType({
		identifier: normalizedCurrentEmail,
		sessionId: null,
		type: 'code_email_change'
	})

	if (!cleanupResult.success) {
		throw error(500, 'Failed to cleanup existing email change challenges')
	}

	// Generate and hash verification code
	const code = generateShortCode()
	const hashedCode = await hashShortCode(code)

	// Create expires at time from auth config
	const expiresAt = new Date(Date.now() + Auth.durations.challengeCodeMaxAge)

	// Derive time for sharing in email
	const maxAgeMins = Math.floor(Auth.durations.challengeCodeMaxAge / (60 * 1000))

	// Store identifier as "oldEmail:newEmail" for easy lookup by user
	const challengeIdentifier = `${normalizedCurrentEmail}:${normalizedNewEmail}`

	// Save challenge
	const challenge = await createChallenge({
		identifier: challengeIdentifier,
		sessionId,
		credential: hashedCode,
		type: 'code_email_change',
		expiresAt
	})

	if (!challenge.success || !challenge.data) {
		throw error(500, 'Failed to create email change challenge')
	}

	// Send verification code to the NEW email address
	try {
		await AuthEmails.sendChangeEmailCode({
			email: normalizedNewEmail,
			code,
			timezone,
			expiresAt,
			maxAgeMins
		})
	} catch (e) {
		console.error('Failed trying to send email change verification', e)
		throw error(500, 'Failed to send verification email')
	}

	return
}
