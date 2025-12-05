import { error, type RequestEvent } from '@sveltejs/kit'
import type { RatelimitContext, RatelimitResult, RatelimitCallback } from '../types'

/**
 * Builds a RatelimitContext from a RequestEvent.
 * Extracts IP from x-forwarded-for header for proxy support.
 * Handles comma-separated IPs from multiple proxies (takes the first/client IP).
 */
function buildContext(event: RequestEvent): RatelimitContext {
	const forwarded = event.request.headers.get('x-forwarded-for')
	const ip = forwarded?.split(',')[0]?.trim() || event.getClientAddress() || 'unknown'
	return {
		event,
		user: event.locals.user ?? null,
		session: event.locals.session ?? null,
		ip
	}
}

/**
 * Wraps a ratelimit callback to create a function that:
 * - Accepts a RequestEvent
 * - Builds the context (event, user, session, ip)
 * - Calls the configured ratelimit callback
 * - Throws 429 "Too many requests" if rate limit exceeded
 * - Returns the RatelimitResult if allowed
 *
 * @param callback - The ratelimit callback from config
 * @returns A function that takes RequestEvent and throws on rate limit
 */
export function createRatelimiter(callback: RatelimitCallback) {
	return async (event: RequestEvent): Promise<RatelimitResult> => {
		const ctx = buildContext(event)
		const result = await callback(ctx)

		if (!result.success) {
			throw error(429, 'Too many requests')
		}

		return result
	}
}
