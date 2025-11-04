import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { ratelimit } from '$lib/server/ratelimit'
import Auth from '$lib/server/auth'

export const handleGlobalRatelimit: Handle = async ({ event, resolve }) => {
	// Your hook code
	const ip = event.getClientAddress()
	const result = await ratelimit.free.limit(ip)

	if (result.remaining < 3) {
		console.log('RATELIMIT: Almost at limit')
	}

	if (result.remaining === 0) {
		console.log('RATELIMIT: exceeded')
	}

	return resolve(event)
}

export const handle: Handle = sequence(
	handleGlobalRatelimit,
	Auth.hooks.handleAuthentication,
	Auth.hooks.handleProtected
)
