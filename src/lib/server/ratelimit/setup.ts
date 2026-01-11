import { RedisClient } from 'bun'
import { REDIS_URL } from '$env/static/private'
import { BunRedisAdapter } from './adapter-bun'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis connection
const redis = new RedisClient(REDIS_URL)

// Then wrap in our adapter
const bunRedis = new BunRedisAdapter(redis)

type AnyAlgorithm =
	| ReturnType<typeof Ratelimit.fixedWindow>
	| ReturnType<typeof Ratelimit.slidingWindow>
	| ReturnType<typeof Ratelimit.tokenBucket>
	| ReturnType<typeof Ratelimit.cachedFixedWindow>

type RatelimiterConfig = {
	prefix: string
	limiter: AnyAlgorithm
}

/**
 * Create a rate limiter with our Bun Redis adapter
 * Analytics are always disabled as they're not supported with Bun Redis
 *
 * @example
 * ```ts
 * const limiter = createRatelimiter({
 *   prefix: 'api:auth',
 *   limiter: Ratelimit.fixedWindow(10, '10s')
 * })
 *
 * const result = await limiter.limit('user:123')
 * if (!result.success) {
 *   throw new Error('Rate limited')
 * }
 * ```
 */
export function createRatelimit(config: RatelimiterConfig) {
	return new Ratelimit({
		redis: bunRedis,
		analytics: false,
		limiter: config.limiter,
		prefix: config.prefix
	})
}
