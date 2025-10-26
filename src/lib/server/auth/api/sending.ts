import { error } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import Auth, { AuthEmails } from '$lib/server/auth'

type AuthFlow = 'existinguser' | 'newuser' | 'reauth'

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
