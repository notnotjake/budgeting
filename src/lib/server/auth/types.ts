import type { RequestEvent } from '@sveltejs/kit'
import type { Session, User } from './schema'

/**
 * Result returned by ratelimit callbacks.
 * Matches Upstash's return shape for simplicity.
 */
export type RatelimitResult = {
	/** Whether the request is allowed */
	success: boolean
	/** Maximum number of requests allowed in the window */
	limit: number
	/** Number of requests remaining in the current window */
	remaining: number
	/** Unix timestamp (ms) when the limit resets */
	reset: number
}

/**
 * Context passed to ratelimit callbacks.
 * Provides all relevant information for making rate limiting decisions.
 */
export type RatelimitContext = {
	/** The SvelteKit request event */
	event: RequestEvent
	/** The authenticated user, if any */
	user: User | null
	/** The current session, if any */
	session: Session | null
	/** Client IP address (extracted from headers for proxy support) */
	ip: string
}

/**
 * Callback function signature for ratelimit implementations.
 * Implementers decide how to rate limit based on the provided context.
 */
export type RatelimitCallback = (context: RatelimitContext) => Promise<RatelimitResult>

/**
 * Ratelimit configuration with two tiers for different operation types.
 *
 * Each callback receives context and must return a result:
 *
 * @example
 * ```ts
 * ratelimit: {
 *   expensive: async ({ ip, user, session, event }) => {
 *     const short = await limits.short.limit(ip)
 *     if (!short.success) return short
 *     return limits.long.limit(ip)
 *   },
 *   standard: async ({ ip }) => {
 *     return myRatelimiter.limit(ip)
 *   }
 * }
 * ```
 */
export type RatelimitConfig = {
	/**
	 * For expensive operations: external costs, side effects, or security-sensitive.
	 * Examples: sending emails/SMS, verification attempts, login attempts.
	 * Should be the strictest limit to prevent abuse and brute-force attacks.
	 *
	 * @param context - `{ event, user, session, ip }`
	 * @returns `{ success, limit, remaining, reset }`
	 *
	 * @example
	 * ```ts
	 * expensive: async ({ ip }) => {
	 *   const short = await limits.shortWindow.limit(ip)
	 *   if (!short.success) return short
	 *   return limits.longWindow.limit(ip)
	 * }
	 * ```
	 */
	expensive: RatelimitCallback
	/**
	 * For general auth operations.
	 * Examples: fetching user data, listing sessions, updating profile.
	 * Lighter limits to prevent abuse while allowing normal usage.
	 *
	 * @param context - `{ event, user, session, ip }`
	 * @returns `{ success, limit, remaining, reset }`
	 *
	 * @example
	 * ```ts
	 * standard: async ({ ip }) => {
	 *   return limits.general.limit(ip)
	 * }
	 * ```
	 */
	standard: RatelimitCallback
}

// Full config type with all required properties (after defaults are applied)
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
		recentAuthBuffer: number
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
	passkeys: {
		rpID: string
		rpName: string
		expectedOrigin: string
	}
	emails: {
		sendLoginCodeNewUser: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendLoginCodeExistingUser: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendReauthCode: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendChangeEmailCode: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendEmailDidChangeNotification: (params: {
			email: string
			updatedEmail: string
		}) => Promise<void>
		sendAccountDeletionCompleted: (params: { email: string }) => Promise<void>
	}
	ratelimit: RatelimitConfig
	callbacks?: CallbackConfig
}

// Partial config type for user input (all properties optional)
export type AuthConfigInput = {
	routes?: {
		login?: string
		reauth?: string
		lock?: string
		protectedGroup?: string
	}
	redirects?: {
		afterLogin?: string
		afterLogout?: string
		afterAccountCreated?: string
	}
	durations?: {
		recentAuthWindow?: number
		recentAuthBuffer?: number
		redirectCookieMaxAge?: number
		// Challenges
		challengeCodeMaxAge?: number
		challengePasskeyMaxAge?: number
		challengeLockAccountMaxAge?: number
		// Sessions
		sessionUnauthenticatedMaxAge?: number
		sessionAuthenticatedMaxAge?: number
		sessionRenewalUpdateWindow?: number
		sessionLastSeenUpdateWindow?: number
		sessionRetentionWindow?: number
	}
	passkeys: {
		rpID: string
		rpName: string
		expectedOrigin: string
	}
	emails?: {
		sendLoginCodeNewUser?: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendLoginCodeExistingUser?: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendReauthCode?: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendChangeEmailCode?: (params: {
			email: string
			code: string
			timezone?: string
			expiresAt: Date
			maxAgeMins: number
		}) => Promise<void>
		sendEmailDidChangeNotification?: (params: {
			email: string
			updatedEmail: string
		}) => Promise<void>
		sendAccountDeletionCompleted?: (params: { email: string }) => Promise<void>
	}
	ratelimit?: Partial<RatelimitConfig>
	callbacks?: CallbackConfig
}

export type sendCodeParams = {
	email: string
	code: string
	timezone?: string
	expiresAt: Date
	maxAgeMins: number
}

export type sendEmailDidChangeParams = {
	email: string
	updatedEmail: string
}

export type sendAccountDeletionCompletedParams = {
	email: string
}

/**
 * Optional callbacks for auth lifecycle events.
 *
 * These are fire-and-forget side effects - they do not block the auth flow
 * and errors are logged but never propagate. Use these to trigger application
 * logic like scheduling onboarding emails, analytics, cleanup tasks, etc.
 *
 * @example
 * ```ts
 * callbacks: {
 *   onNewUser: (user) => {
 *     scheduleOnboardingEmail(user.identifier, { delay: '1 day' })
 *   },
 *   onDeleteAccount: (user) => {
 *     cleanupUserStorage(user.id)
 *   }
 * }
 * ```
 */
export type CallbackConfig = {
	/**
	 * Called when a user successfully logs in (authenticates a session).
	 * @param user - The authenticated user
	 */
	onLogin?: (user: User) => Promise<void> | void

	/**
	 * Called when a new user account is created.
	 * @param user - The newly created user
	 */
	onNewUser?: (user: User) => Promise<void> | void

	/**
	 * Called when a user account is deleted.
	 * @param user - The deleted user (captured before deletion)
	 */
	onDeleteAccount?: (user: User) => Promise<void> | void

	/**
	 * Called when a user's identifier (email) is changed.
	 * @param user - The user with the updated identifier
	 * @param previousIdentifier - The identifier before the change
	 */
	onChangeIdentifier?: (user: User, previousIdentifier: string) => Promise<void> | void
}
