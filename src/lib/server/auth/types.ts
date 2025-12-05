import type { RequestEvent } from '@sveltejs/kit'
import type { User, Session } from './schema'

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
			lockLink: string
			maxAgeMins: number
		}) => Promise<void>
		sendAccountDeletionCompleted: (params: { email: string }) => Promise<void>
	}
	ratelimit: RatelimitConfig
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
			lockLink: string
			maxAgeMins: number
		}) => Promise<void>
		sendAccountDeletionCompleted?: (params: { email: string }) => Promise<void>
	}
	ratelimit?: Partial<RatelimitConfig>
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
	lockLink: string
	maxAgeMins: number
}

export type sendAccountDeletionCompletedParams = {
	email: string
}
