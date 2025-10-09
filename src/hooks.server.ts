import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { ratelimit } from '$lib/server/ratelimit'

// import { authHandler } from '$lib/server/auth'

export const serverHook: Handle = async ({ event, resolve }) => {
	// Your hook code
	const ip = event.getClientAddress()
	const result = await ratelimit.free.limit(ip)

	console.log(result)

	return resolve(event)
}

export const handle: Handle = sequence(serverHook)
