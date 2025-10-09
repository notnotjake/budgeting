import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private'

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// const redis = Redis.fromEnv()

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL,
	token: UPSTASH_REDIS_REST_TOKEN
})

const cache: Map<string, number> = new Map()

export const ratelimit = {
	free: new Ratelimit({
		redis,
		analytics: true,
		prefix: 'ratelimit:free',
		ephemeralCache: cache,
		limiter: Ratelimit.slidingWindow(10, '10s')
	}),
	paid: new Ratelimit({
		redis,
		analytics: true,
		prefix: 'ratelimit:paid',
		limiter: Ratelimit.slidingWindow(60, '10s')
	}),
	auth: new Ratelimit({
		redis,
		analytics: true,
		prefix: 'ratelimit:auth',
		limiter: Ratelimit.slidingWindow(5, '10s')
	})
}

export default ratelimit
