import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { scheduledTasks } from '$lib/server/scheduled'
import { ratelimit } from '$lib/server/ratelimit'
import Auth from '$lib/server/auth'

scheduledTasks()

export const handle: Handle = sequence(
	ratelimit.handleGlobalRatelimit,
	Auth.hooks.handleAuthentication,
	Auth.hooks.handleProtected
)
