import {
	setSessionTokenCookie,
	getSessionTokenCookie,
	deleteSessionTokenCookie,
	setRedirectUrlCookie,
	getRedirectUrlCookie,
	clearRedirectUrlCookie
} from './core/cookies'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const MIN_IN_MS = 60 * 1000

export const AUTH_DURATIONS = {
	authCodeExpiry: 10 * MIN_IN_MS,
	sessionUnauthenticated: 7 * DAY_IN_MS,
	sessionAuthenticated: 30 * DAY_IN_MS,
	sessionRenewalThreshold: 20 * DAY_IN_MS,
	sessionLastSeenUpdateThreshold: 5 * MIN_IN_MS,
	sessionRetentionWindow: 30 * DAY_IN_MS,
	redirectCookieMaxAge: 10 * MIN_IN_MS
}

const Auth = {
	routes: {
		login: '/login',
		afterLogin: '/app'
	},
	durations: AUTH_DURATIONS,
	// Session token cookies
	setSessionTokenCookie,
	getSessionTokenCookie,
	deleteSessionTokenCookie,
	// Redirect url cookies
	setRedirectUrlCookie,
	getRedirectUrlCookie,
	clearRedirectUrlCookie
}

export default Auth
