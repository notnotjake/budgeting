import type { AuthConfig, AuthConfigInput } from './types'
import userConfig from './config'

import { handleAuthentication } from './hooks/authentication'
import { handleProtected } from './hooks/protected'

import { startAuth, sendCode, verifyCode, verifyPasskey, logout } from './api/authenticate'
import { startPasskeyRegistration, verifyPasskeyRegistration } from './api/passkey'
import { requireSession, requireAuthenticatedUser, requireRecentAuth } from './api/protect'

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
	}
}

const config: AuthConfig = {
	routes: { ...DEFAULT_CONFIG.routes, ...userConfig.routes },
	redirects: { ...DEFAULT_CONFIG.redirects, ...userConfig.redirects },
	durations: { ...DEFAULT_CONFIG.durations, ...userConfig.durations },
	passkeys: { ...DEFAULT_CONFIG.passkeys, ...userConfig.passkeys },
	emails: { ...DEFAULT_CONFIG.emails, ...userConfig.emails }
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
	// Authenticate functions
	startAuth,
	sendCode,
	verifyCode,
	verifyPasskey,
	logout,
	// Passkey
	startPasskeyRegistration,
	verifyPasskeyRegistration
}
export default Auth

// Exported separately to discourage usage outside of auth api functions
export const AuthEmails = config.emails

// Helper function for defineConfig use in .config.ts files
export function defineConfig(userConfig: AuthConfigInput): AuthConfigInput {
	return userConfig
}
