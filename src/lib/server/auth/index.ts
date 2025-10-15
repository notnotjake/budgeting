import type { AuthConfig } from './types'
import userConfig from './config'

import { handleAuthentication } from './hooks/authentication'
import { handleProtected } from './hooks/protected'

import { requireSession, requireAuthenticatedUser, requireRecentAuth } from './api/protect'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const MIN_IN_MS = 60 * 1000

// Defining default config values
const DEFAULT_CONFIG: AuthConfig = {
	routes: {
		login: '/login',
		reauth: '/reauth',
		lock: '/lock',
		protectedGroup: '(protected)'
	},
	redirects: {
		afterLogin: '/app',
		afterLogout: '/',
		afterAccountCreated: '/app/welcome'
	},
	durations: {
		recentAuthWindow: 10 * MIN_IN_MS,
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
	emails: {
		sendLoginCodeNewUser: async () => {
			console.error('Auth: sendLoginCodeNewUser email not implemented')
			throw new Error('Email function not implemented')
		},
		sendLoginCodeReturningUser: async () => {
			console.error('Auth: sendLoginCodeReturningUser email not implemented')
			throw new Error('Email function not implemented')
		},
		sendEmailChangeCode: async () => {
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
	}
}

const config: AuthConfig = {
	routes: { ...DEFAULT_CONFIG.routes, ...userConfig.routes },
	redirects: { ...DEFAULT_CONFIG.redirects, ...userConfig.redirects },
	durations: { ...DEFAULT_CONFIG.durations, ...userConfig.durations },
	emails: { ...DEFAULT_CONFIG.emails, ...userConfig.emails }
}

const Auth = {
	routes: config.routes,
	redirects: config.redirects,
	durations: config.durations,
	hooks: {
		handleAuthentication,
		handleProtected
	},
	protect: {
		requireSession,
		requireAuthenticatedUser,
		requireRecentAuth
	}
	// TODO: add api
}
export default Auth

// Exported separately to discourage usage outside of auth api functions
export const AuthEmails = config.emails

// Helper function for defineConfig use in .config.ts files
export function defineConfig(userConfig: Partial<AuthConfig>): Partial<AuthConfig> {
	return userConfig
}

export const ERROR_MESSAGE = {
	// Generic errors
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden',
	RATE_LIMITED: 'Too many requests',
	GENERIC: 'Operation failed',

	CORE: {
		// User errors
		USER_CREATE_FAILED: 'Failed to create user',
		USER_UPDATE_FAILED: 'Failed to update user',
		USER_DELETE_FAILED: 'Failed to delete user',
		USER_NOT_FOUND: 'User not found',
		USER_LOOKUP_FAILED: 'Failed to lookup user',
		USER_LOCK_FAILED: 'Failed to update lock status',
		USER_NO_FIELDS_TO_UPDATE: 'No fields to update',

		// Session errors
		SESSION_CREATE_FAILED: 'Failed to create session',
		SESSION_AUTHENTICATE_FAILED: 'Failed to authenticate session',
		SESSION_VALIDATE_FAILED: 'Failed to validate session',
		SESSION_INVALIDATE_FAILED: 'Failed to invalidate session',
		SESSION_INVALIDATE_ALL_FAILED: 'Failed to invalidate all sessions',
		SESSION_LIST_FAILED: 'Failed to retrieve sessions',
		SESSION_CLEANUP_FAILED: 'Failed to cleanup sessions',
		SESSION_NOT_FOUND: 'Session not found',
		SESSION_INVALID: 'Session is invalid',
		SESSION_EXPIRED: 'Session has expired',

		// Challenge errors
		CHALLENGE_CREATE_FAILED: 'Failed to create challenge',
		CHALLENGE_GET_FAILED: 'Failed to retrieve challenge',
		CHALLENGE_CLEANUP_FAILED: 'Failed to cleanup challenges',
		CHALLENGE_INVALID: 'Challenge is invalid',
		CHALLENGE_EXPIRED: 'Challenge has expired',

		// Key/Passkey errors
		KEY_CREATE_FAILED: 'Failed to create passkey',
		KEY_GET_FAILED: 'Failed to get passkey',
		KEY_LIST_FAILED: 'Failed to list passkeys',
		KEY_DELETE_FAILED: 'Failed to delete passkey',
		KEY_UPDATE_FAILED: 'Failed to update passkey',
		KEY_NOT_FOUND: 'Passkey not found'
	},

	API: {
		// Hooks
		AUTHENTICATION_HOOK: 'Authentication hook error',
		PROTECTED_HOOK: 'Protected route hook error'
	}
} as const
