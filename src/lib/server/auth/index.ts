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

const Auth = {
	routes: {
		login: '/login',
		afterLogin: '/app'
	},
	expiration: {
		unauthenticatedSession: 7 * DAY_IN_MS,
		authenticatedSession: 30 * DAY_IN_MS,
		renewSession: 20 * DAY_IN_MS,
		retainSession: 30 * DAY_IN_MS,
		codeChallenge: 5 * MIN_IN_MS
	},
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
