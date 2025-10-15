export type AuthConfig = {
	routes: {
		login: string
		reauth: string
		lock: string
		protectedGroup: string
	}
	redirects: {
		afterLogin: string
		afterLogout: string
		afterAccountCreated: string
	}
	durations: {
		recentAuthWindow: number
		redirectCookieMaxAge: number
		// Challenges
		challengeCodeMaxAge: number
		challengePasskeyMaxAge: number
		challengeLockAccountMaxAge: number
		// Sessions
		sessionUnauthenticatedMaxAge: number
		sessionAuthenticatedMaxAge: number
		sessionRenewalUpdateWindow: number
		sessionLastSeenUpdateWindow: number
		sessionRetentionWindow: number
	}
	emails: {
		sendLoginCodeNewUser: (params: {
			email: string
			code: string
			timezone: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendLoginCodeExistingUser: (params: {
			email: string
			code: string
			timezone: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendReauthCode: (params: {
			email: string
			code: string
			timezone: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendChangeEmailCode: (params: {
			email: string
			code: string
			timezone: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendEmailDidChangeNotification: (params: {
			email: string
			updatedEmail: string
			lockLink: string
			maxAgeMins: number
		}) => Promise<void>
		sendAccountDeletionCompleted: (params: { email: string }) => Promise<void>
	}
}

export type sendCodeParams = {
	email: string
	code: string
	timezone: string
	expiresAt: Date
	maxAgeMins: number
}

export type sendEmailDidChangeParams = {
	email: string
	updatedEmail: string
	lockLink: string
	maxAgeMins: number
}

export type sendAccountDeletionCompletedParams = {
	email: string
}
