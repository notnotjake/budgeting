import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { scheduledTasks } from '$lib/server/scheduled'
import { ratelimit } from '$lib/server/ratelimit'
import Auth from '$lib/server/auth'

scheduledTasks()

export const handleGlobalRatelimit: Handle = async ({ event, resolve }) => {
	const ip = event.request.headers.get('x-forwarded-for') || ''

	const result = await ratelimit.free.limit(ip)

	const test = await ratelimit.test.limit(ip)
	console.log(test)

	return resolve(event)
}

export const handle: Handle = sequence(
	handleGlobalRatelimit,
	Auth.hooks.handleAuthentication,
	Auth.hooks.handleProtected
)
