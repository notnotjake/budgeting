import { error, type Handle } from '@sveltejs/kit'
import { limits } from './limits'

export const handleGlobalRatelimit: Handle = async ({ event, resolve }) => {
	const ip = event.request.headers.get('x-forwarded-for') || ''

	const rate = await limits.free.limit(ip)

	// If rate limit exceeded, send back error
	if (!rate.success) {
		error(429, `Rate limit exceeded. Try again at ${rate.reset}`)
	}

	const result = await resolve(event)
	// Add rate limit headers
	result.headers.set('X-RateLimit-Limit', rate.limit.toString())
	result.headers.set('X-RateLimit-Remaining', rate.remaining.toString())
	result.headers.set('X-RateLimit-Reset', rate.reset.toString())

	return result
}
