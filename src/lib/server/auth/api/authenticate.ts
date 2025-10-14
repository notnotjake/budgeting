import type { RequestEvent } from '@sveltejs/kit'
import AuthCore from '$lib/server/auth/core'
import { z } from 'zod'

export async function startLogin({
	event,
	identifier
}: {
	event: RequestEvent
	identifier: string
}) {
	// Rate limit

	// Normalize input
	const normalizedInput = identifier.toLowerCase().trim()

	// Validate input
	const emailSchema = z.string().email()
	const validInput = emailSchema.safeParse(normalizedInput)
	if (!validInput) {
		// TODO: throw error, invalid input
	}

	// Check if user exists and has passkey
	const userResult = await AuthCore.getUser({ identifier })

	if (!userResult.success || !userResult.data) {
		// TODO: Failed to check user exists
	}

	const user = userResult.data?.user

	// Check if passkey is available
	let passkeyAvailable = false
	if (user) {
		const passkeyAvailableResult = await AuthCore.userHasPasskeyAvailable({
			userId: user.id
		})

		if (!passkeyAvailableResult.success || !passkeyAvailableResult.data) {
			// TODO: Failed to query passkeys
		}

		passkeyAvailable = passkeyAvailableResult.data ?? false
	}

	if (passkeyAvailable) {
		return {
			codeSent: false,
			passkeyAvailable
		}
	}

	// If passkey unavailable (including no existing user) then send login code to email
	await sendLoginCode()

	return {
		codeSent: true,
		passkeyAvailable
	}
}

// cleanup challenges
// create and hash token
// create challenge
export async function sendLoginCode() {}

export async function verifyLoginCode() {}

export async function verifyLoginPasskey() {}

export async function startReauth() {}

export async function verifyReauthCode() {}

export async function verifyReauthPasskey() {}

export async function logout() {}
