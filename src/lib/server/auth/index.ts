import type { AuthConfig, AuthConfigInput } from './types'
import userConfig from './config'

import { handleAuthentication } from './hooks/authentication'
import { handleProtected } from './hooks/protected'
import { requireSession, requireAuthenticatedUser, requireRecentAuth } from './api/protect'
import { cleanupChallenges, cleanupSessions } from './api/cleanup'
import { createRatelimiter } from './core/ratelimit'

import { NODE_ENV } from '$env/static/private'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const MIN_IN_MS = 60 * 1000

// Defining default config values
const DEFAULT_CONFIG: AuthConfig = {
	routes: {
		login: '/login',
		reauth: '/reauth',
		lock: '/lock',
		protectedGroup: '/(protected)'
	},
	redirects: {
		afterLogin: '/app',
		afterLogout: '/',
		afterAccountCreated: '/welcome'
	},
	durations: {
		recentAuthWindow: 10 * MIN_IN_MS,
		recentAuthBuffer: 3 * MIN_IN_MS,
		redirectCookieMaxAge: 10 * MIN_IN_MS,
		// Challenges
		challengeCodeMaxAge: 5 * MIN_IN_MS,
		challengePasskeyMaxAge: 3 * MIN_IN_MS,
		challengeLockAccountMaxAge: 2 * DAY_IN_MS,
		// Sessions
		sessionUnauthenticatedMaxAge: 7 * DAY_IN_MS,
		sessionAuthenticatedMaxAge: 30 * DAY_IN_MS,
		sessionRenewalUpdateWindow: 20 * DAY_IN_MS,
		sessionLastSeenUpdateWindow: 5 * MIN_IN_MS,
		sessionRetentionWindow: 30 * DAY_IN_MS
	},
	passkeys: {
		rpID: 'localhost',
		rpName: 'SvelteKit Example',
		expectedOrigin: 'http://localhost:5173'
	},
	emails: {
		sendLoginCodeNewUser: async () => {
			console.error('Auth: sendLoginCodeNewUser email not implemented')
			throw new Error('Email function not implemented')
		},
		sendLoginCodeExistingUser: async () => {
			console.error('Auth: sendLoginCodeReturningUser email not implemented')
			throw new Error('Email function not implemented')
		},
		sendReauthCode: async () => {
			console.error('Auth: sendReauthCode email not implemented')
			throw new Error('Email function not implemented')
		},
		sendChangeEmailCode: async () => {
			console.error('Auth: sendEmailChangeCode email not implemented')
			throw new Error('Email function not implemented')
		},
		sendEmailDidChangeNotification: async () => {
			console.error('Auth: sendEmailDidChangeNotification email not implemented')
			throw new Error('Email function not implemented')
		},
		sendAccountDeletionCompleted: async () => {
			console.error('Auth: sendAccountDeletionCompleted email not implemented')
			throw new Error('Email function not implemented')
		}
	},
	ratelimit: {
		expensive: async () => {
			if (NODE_ENV === 'development') {
				console.warn(`Auth: Missing ratelimit configuration. Allowing in development`)
				return { success: true, limit: 0, remaining: 0, reset: 0 }
			}
			throw new Error(`Auth: Missing ratelimit configuration.`)
		},
		standard: async () => {
			if (NODE_ENV === 'development') {
				console.warn(`Auth: Missing ratelimit configuration. Allowing in development`)
				return { success: true, limit: 0, remaining: 0, reset: 0 }
			}
			throw new Error(`Auth: Missing ratelimit configuration.`)
		}
	}
}

const config: AuthConfig = {
	routes: { ...DEFAULT_CONFIG.routes, ...userConfig.routes },
	redirects: { ...DEFAULT_CONFIG.redirects, ...userConfig.redirects },
	durations: { ...DEFAULT_CONFIG.durations, ...userConfig.durations },
	passkeys: { ...DEFAULT_CONFIG.passkeys, ...userConfig.passkeys },
	emails: { ...DEFAULT_CONFIG.emails, ...userConfig.emails },
	ratelimit: { ...DEFAULT_CONFIG.ratelimit, ...userConfig.ratelimit }
}

const Auth = {
	routes: config.routes,
	redirects: config.redirects,
	durations: config.durations,
	passkeys: config.passkeys,
	hooks: {
		handleAuthentication,
		handleProtected
	},
	protect: {
		requireSession,
		requireAuthenticatedUser,
		requireRecentAuth
	},
	cleanup: {
		sessions: cleanupSessions,
		challenges: cleanupChallenges
	},
	/**
	 * Rate limiting functions for auth operations.
	 * Each function accepts a RequestEvent and throws 429 if rate limit exceeded.
	 */
	ratelimit: {
		/**
		 * Strict rate limit for expensive or security-sensitive operations.
		 * Use for: sending emails/SMS, login attempts.
		 *
		 * Throws 429 if rate limit exceeded.
		 *
		 * @param event - The SvelteKit RequestEvent
		 * @throws {HttpError} 429 "Too many requests" if rate limited
		 */
		expensive: createRatelimiter(config.ratelimit.expensive),

		/**
		 * Rate limit for general auth operations.
		 *
		 * Throws 429 if rate limit exceeded.
		 *
		 * @param event - The SvelteKit RequestEvent
		 * @throws {HttpError} 429 "Too many requests" if rate limited
		 */
		standard: createRatelimiter(config.ratelimit.standard)
	}
}
export default Auth

// Exported separately to discourage usage outside of auth api functions
export const AuthEmails = config.emails

// Helper function for defineConfig use in .config.ts files
export function defineConfig(userConfig: AuthConfigInput): AuthConfigInput {
	return userConfig
}

// Re-export types for use in remotes
export type { RatelimitResult, RatelimitContext } from './types'
