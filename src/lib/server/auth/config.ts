import { defineConfig } from './index'
import { sendAuthEmail } from '$lib/server/email'
import ratelimit from '$lib/server/ratelimit'

import { site } from '$lib/site-config'
import { NODE_ENV } from '$env/static/private'

// Setup passkey values
const rpName = site.name
let rpID: string = site.host
let expectedOrigin: string = site.url

if (NODE_ENV === 'development') {
	rpID = 'localhost'
	expectedOrigin = 'http://localhost:5173'
}

// Timing Constants:
// const DAY_IN_MS = 24 * 60 * 60 * 1000
const MIN_IN_MS = 60 * 1000

export default defineConfig({
	passkeys: {
		rpID,
		rpName,
		expectedOrigin
	},
	emails: {
		sendLoginCodeNewUser: sendAuthEmail.loginCodeNewUser,
		sendLoginCodeExistingUser: sendAuthEmail.loginCodeExistingUser,
		sendReauthCode: sendAuthEmail.reauthCode,
		sendChangeEmailCode: sendAuthEmail.changeEmailCode,
		sendEmailDidChangeNotification: sendAuthEmail.emailDidChangeNotification,
		sendAccountDeletionCompleted: sendAuthEmail.accountDeletionCompleted
	},
	durations: {
		sessionRetentionWindow: 2 * 60 * MIN_IN_MS // 2 hours for dev purposes
	},
	ratelimit: {
		expensive: async ({ ip }) => {
			if (NODE_ENV === 'development') {
				return { success: true, limit: 10, remaining: 10, reset: Date.now() + 1000 }
			}

			// Check short-term limit first (stricter)
			const shortResult = await ratelimit.auth.expensive.short.limit(ip)
			if (!shortResult.success) return shortResult

			// Then check long-term limit
			return ratelimit.auth.expensive.long.limit(ip)
		},
		standard: async ({ ip }) => {
			if (NODE_ENV === 'development') {
				return { success: true, limit: 10, remaining: 10, reset: Date.now() + 1000 }
			}

			return ratelimit.auth.standard.limit(ip)
		}
	}
})
