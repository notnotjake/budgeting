import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { ratelimit } from '$lib/server/ratelimit'
import Auth from '$lib/server/auth'

export const handleGlobalRatelimit: Handle = async ({ event, resolve }) => {
	// Your hook code
	const ip = event.getClientAddress()
	const result = await ratelimit.free.limit(ip)

	console.log(result)

	return resolve(event)
}

export const handle: Handle = sequence(
	handleGlobalRatelimit,
	Auth.hooks.handleAuthentication,
	Auth.hooks.handleProtected
)
